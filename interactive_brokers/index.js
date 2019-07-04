import assert from 'assert'
import websocket_connection_manager from '../websocket_connection_manager'
import EventEmitter from 'events'
import { MARKET_DATA_TYPE, EVENT, TRADE_EVENT } from './constants'
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

		assert(username && password && endpoint, 'config is invalid. { username, password, endpoint } are required')

		this._config = config

		this._marketDataType = undefined

		this._responseHandlers = {}
	}

	setMarketDataType (marketDataType) {
		assert(Object.values(MARKET_DATA_TYPE).includes(marketDataType), 'marketDataType is invalid')
		this._marketDataType = marketDataType
	}

	/**
	* 
	* @typedef SubscriptionConfig
		@property {string} secType - security type (stock, forex,...)
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
	 * @param {SubscriptionConfig} [config={}]
	 * @param {subscriptionCallback=} cb
	 * @returns {number} request ID
	 * @memberof IbConnector
	 */
	onSubscription (intent, config, cb) {
		const reqId = this._socket.getReqId()

		const message = makeRequestSubscriptionCommand(intent, reqId, config)
		this._sendCommand(message)

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
		this._sendCommand(message)

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
				this._sendCommand(message)

				resolve(orderId)
			})

			this._sendCommand({
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
		this._sendCommand(message)
	}

	/**
 * @typedef ConnectConfig
 * @property {string} uuid
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
			const { uuid } = config
			if (!uuid) {
				reject('config is invalid. { uuid } are required')
			}
			const socket = this._initConnection(config)

			this._socket = socket

			this._onceMessageEvent(EVENT.READY, () => {
				if (this._marketDataType !== undefined) {
					this._sendCommand({
						command: 'reqMarketDataType',
						args: [
							this._marketDataType
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

	_sendCommand (message) {
		assert(message.command, 'Command is not valid: ' + message.command)

		this.emit(EVENT.COMMAND_SEND, message)

		this._socket.send(JSON.stringify(message))
	}
	_onceMessageEvent (eventName, cb) {
		const socket = this._socket
		// ws's once() does not work as expected
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
	async subscribe (intent, config, cb) {
		return super.onSubscription(intent, config, cb)
	}

	unsubscribe(intent, reqId) {
		return super.offSubscription(intent, reqId)
	}
}
