import websocket_connection_manager from '../websocket_connection_manager'
import EventEmitter from 'events'
import { MARKET_DATA_TYPE, SUBSCRIPTION_TYPE, EVENT, TRADE_EVENT } from './constants'
import { parseMessage } from './parser'
import {
	makeRequestSubscriptionCommand,
	makeCancelSubscriptionCommand,
	makePlaceOrderCommand,
	makeCancelOrderCommand
} from './commandFactory'

const { subscribe, unsubscribe } = new websocket_connection_manager()

const attachRequestManagertoSocket = socket =>
	Object.assign(socket, {
		_reqId: 1,
		getReqId: function () {
			return this._reqId++
		}
	})

/**
 * @typedef IbConnectorConfig
 * @property {string} username
 * @property {string} password
 * @property {string} endpoint
 */

class IbConnector extends EventEmitter {
	/**
	 *Creates an instance of IbConnector.
	 * @param {IbConnectorConfig} [config={}]
	 * @memberof IbConnector
	 */
	constructor (config = {}) {
		super()

		const { username, password, endpoint } = config

		if (!username || !password || !endpoint) {
			throw new Error('config is invalid. { username, password, endpoint } are required')
		}

		this._config = config

		this._responseHandlers = {}
	}

	/**
	* 
	* @typedef SubscriptionConfig
		@property {string} secType - security type (stock, forex,...)
	* @property {boolean=false} snapshot -  A true value will return a one-time snapshot, while a false value will provide streaming data.
	* @property {boolean=false} regulatory - snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription but not corresponding Network A, B, or C subscription necessary for streaming * market data.
	* @property {string=''} genericTickList - comma separated ids of the available generic ticks
	  @property {number=1} numRows - the number of rows on each side of the order book
	*/

	/**
	 *
	 * @callback subscriptionCallback
	 * @param {number} uuid
	 * @param {string} event
	 * @param {object} result
	 */

	/**
	 * Start listening an instrument
	 *
	 * @param {string} intent
	 * @param {string} exSymbol
	 * @param {SubscriptionConfig} [options={}]
	 * @param {subscriptionCallback=} cb
	 * @returns {number} request ID
	 * @memberof IbConnector
	 */
	onSubscription (intent, exSymbol, options, cb) {
		const reqId = this._socket.getReqId()

		const message = makeRequestSubscriptionCommand(intent, reqId, exSymbol, options)
		this._sendData(message)

		if (typeof cb === 'function') {
			this._responseHandlers[reqId] = cb
		}

		return reqId
	}

	/**
	 * Stop listening an instrument
	 *
	 * @param {string} intent
	 * @param {number} reqId
	 * @memberof IbConnector
	 */
	offSubscription (intent, reqId) {
		const message = makeCancelSubscriptionCommand(intent, reqId)
		this._sendData(message)

		if (this._responseHandlers[reqId]) {
			this._responseHandlers[reqId] = undefined
		}
	}

	/**
	* 
	* @typedef OrderConfig
	* @property {string=stock} secType - security type
		@property {boolean=true} transmitOrder
	* @property {number} price - only available to stop + limit order
	* @property {string} goodAfterTime - only available to market order
	* @property {string} goodTillDate - only available to market order
	* @property {number=0} parentId -  only available to stop + stop limit + trailing stop order
	* @property {string=DAY} tif - only available to stop + stop limit + trailing stop order
	* @property {number} limitPrice - only available to stop limit order
	* @property {number} stopPrice - only available to stop limit order
	* @property {number} auxPrice - only available to trailing stop order
	*/

	/**
	 * Place an order
	 *
	 * @param {string} exSymbol - exchange:symbol , or symbol/currency, or symbol
	 * @param {string} orderType
	 * @param {number} quantity
	 * @param {OrderConfig} orderConfig
	 * @memberof IbConnector
	 */
	placeOrder (exSymbol, orderType, quantity, orderConfig) {
		return new Promise(resolve => {
			this._onceMessageEvent(TRADE_EVENT.NEXT_ORDER_ID, orderId => {
				const message = makePlaceOrderCommand(orderId, orderType, exSymbol, quantity, orderConfig)
				this._sendData(message)

				resolve(orderId)
			})

			this._sendData({
				command: 'reqIds',
				args: [
					1
				]
			})
		})
	}

	/**
	 * Cancel an order
	 *
	 * @param {string} exSymbol - exchange:symbol , or symbol/currency, or symbol
	 */
	cancelOrder (orderId) {
		const message = makeCancelOrderCommand(orderId, orderType)
		this._sendData(message)
	}

	/**
 * @typedef ConnectConfig
 * @property {string} uuid
 * @property {number} marketDataType
 */

	/**
	 * Connect to IB proxy
	 *
	 * @param { ConnectConfig } config
	 * @returns {Promise<IbConnector>} promise of IBConnector
	 * @memberof IbConnector
	 */
	connect (config) {
		return new Promise((resolve, reject) => {
			const { uuid, marketDataType } = config
			if (!uuid) {
				reject('config is invalid. { uuid } are required')
			}
			const socket = this._initConnection(config)

			this._socket = socket

			this._onceMessageEvent(EVENT.READY, () => {
				if (marketDataType && marketDataType !== MARKET_DATA_TYPE.LIVE) {
					this._sendData({
						command: 'reqMarketDataType',
						args: [
							marketDataType
						]
					})
				}
				socket.off(EVENT.ERROR, reject)
				resolve(this)
			})

			socket.once(EVENT.ERROR, reject)

			socket.on(EVENT.MESSAGE, message => this._onMessage(message, config))

			const forwardedEvents = [
				EVENT.OPEN,
				EVENT.CLOSE,
				EVENT.ERROR
			]
			forwardedEvents.forEach(event => socket.on(event, (...args) => this.emit(uuid, event, ...args)))
		})
	}

	/**
	 * disconnect from IB proxy and release related resources
	 *
	 * @returns {boolean}
	 * @memberof IbConnector
	 */
	disconnect () {
		const socket = this._socket
		this._responseHandlers = {}
		this._socket = undefined

		return unsubscribe(socket)
	}

	_onMessage (message, { uuid }) {
		let data = undefined
		let event = undefined

		try {
			const parsedMessage = parseMessage(message)
			data = parsedMessage.data
			event = parsedMessage.event

			if (event === EVENT.ERROR) {
				this.emit(EVENT.ERROR, uuid, data)
				return
			}

			// inprocessed result is either undefined or array
			if (!data || Array.isArray(data)) {
				this.emit(EVENT.DATA, uuid, data, event)
				return
			}
		} catch (err) {
			console.error(EVENT.ERROR, uuid, err)
			return
		}

		const { reqId, ...result } = data

		if (!reqId) {
			return
		}

		const handler = this._responseHandlers[reqId]

		if (typeof handler !== 'function') {
			return
		}

		try {
			// emit to subscription listener
			handler(uuid, result, event)
			// emit to global ib listener
			this.emit(EVENT.DATA, uuid, result, event)
		} catch (err) {
			console.error(err)
		}
	}

	_initConnection (config) {
		const { username, password } = this._config

		const query = new URLSearchParams([
			[
				'username',
				username
			],
			[
				'password',
				password
			]
		])

		const url = `${this._getStream(config)}?${query}`

		const socket = subscribe(config.uuid, [
			url,
			{}
		])

		attachRequestManagertoSocket(socket)

		return socket
	}

	_sendData (message) {
		if (!message.command) {
			throw new Error('Command is not valid: ' + message.command)
		}

		console.log(JSON.stringify(message))

		this._socket.send(JSON.stringify(message))
	}
	_onceMessageEvent (eventName, cb) {
		const socket = this._socket
		// ws's once does not work as expected
		socket.on(EVENT.MESSAGE, message => {
			const { event, data } = JSON.parse(message)
			if (event === eventName) {
				socket.off(eventName, cb)
				cb(data)
			}
		})
	}
	_getStream () {
		return this._config.endpoint
	}
}

export default class SimpleIbConnector extends IbConnector {
	constructor (config) {
		config.endpoint = 'ws://127.0.0.1:3000'
		super(config)
	}

	async subscribe (intent, uuid, exSymbol, config = {}, cb) {
		const { marketDataType } = config
		await super.connect({ uuid, marketDataType })
		super.onSubscription(intent, exSymbol, config, cb)
	}

	unsubscribe () {
		return super.disconnect()
	}
}