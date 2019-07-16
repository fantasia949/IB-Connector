import assert from 'assert'
import websocket_connection_manager from '../websocket_connection_manager'
import EventEmitter from 'events'
import {
	MARKET_DATA_TYPE,
	EVENT,
	TRADE_EVENT,
	INTENT,
	NEWS_EVENT,
	MARKETDATA_EVENT,
	GENERIC_TICK,
	SERVER_LOG_LEVEL
} from './constants'
import { parseMessage } from './parser'
import {
	makeRequestSubscriptionCommand,
	makeCancelSubscriptionCommand,
	makePlaceOrderCommand,
	makeCancelOrderCommand
} from './commandFactory'
import * as icFactory from './intentConfig/factory'

const { subscribe } = new websocket_connection_manager()

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
 * @property {number=} marketDatType
 * @property {number=} serverLogLevel
 */

class IbConnector extends EventEmitter {
	/**
	 *Creates an instance of IbConnector.
	 * @param {IbConnectorConfig} [config={}]
	 * @memberof IbConnector
	 */
	constructor (config = {}) {
		super()

		const { username, password, endpoint, marketDataType, serverLogLevel } = config

		assert(username && password && endpoint, 'config is invalid. { username, password, endpoint } are required')

		this._config = config

		if (marketDataType !== undefined) {
			this.setMarketDataType(marketDataType)
		}

		this._serverLogLevel = SERVER_LOG_LEVEL.ERROR

		if (serverLogLevel !== undefined) {
			this.setServerLogLevel(serverLogLevel)
		}

		this._responseHandlers = {}
	}

	setMarketDataType (marketDataType) {
		assert(Object.values(MARKET_DATA_TYPE).includes(marketDataType), 'marketDataType is invalid')
		this._marketDataType = marketDataType
	}

	setServerLogLevel (serverLogLevel) {
		assert(Object.values(SERVER_LOG_LEVEL).includes(serverLogLevel), 'serverLogLevel is invalid')
		this._serverLogLevel = serverLogLevel
	}

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
	 * @param {object} config - instance of intentConfig
	 * @param {subscriptionCallback=} cb
	 * @returns {number} request ID
	 * @memberof IbConnector
	 */
	onSubscription (intent, config, cb) {
		this._checkConnected()

		if (intent === INTENT.LIVE_PORTFOLIO) {
			const message = makeRequestSubscriptionCommand(intent, true, icFactory.portfolioConfig(this.account))
			this._sendCommand(message)
			this._responseHandlers[intent] = cb
			return
		}

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
		this._checkConnected()

		if (intent === INTENT.LIVE_PORTFOLIO) {
			const message = makeRequestSubscriptionCommand(intent, false, icFactory.portfolioConfig(this.account))
			this._sendCommand(message)

			if (this._responseHandlers[intent]) {
				this._responseHandlers[intent] = undefined
			}

			return
		}

		assert(reqId, 'reqId is required to cancel this intent subscription')

		const message = makeCancelSubscriptionCommand(intent, reqId)
		this._sendCommand(message)

		if (this._responseHandlers[reqId]) {
			this._responseHandlers[reqId] = undefined
		}
	}

	async getNewsProviders () {
		const command = makeRequestSubscriptionCommand(INTENT.NEWS_PROVIDERS)
		const response = await this._getData(command, NEWS_EVENT.NEWS_PROVIDERS)
		const { data } = parseMessage(response)
		return data.entries
	}

	async getMatchingSymbols (pattern) {
		const command = makeRequestSubscriptionCommand(
			INTENT.MATCHING_SYMBOLS,
			this._socket.getReqId(),
			icFactory.matchingSymbolsConfig(pattern)
		)
		const response = await this._getData(command, MARKETDATA_EVENT.SYMBOL_SAMPLES)
		const { data } = parseMessage(response)
		return data.entries
	}

	async getNewsArticle (providerCode, articleId) {
		const command = makeRequestSubscriptionCommand(
			INTENT.NEWS_ARTICLE,
			this._socket.getReqId(),
			icFactory.newsArticleConfig(providerCode, articleId)
		)

		const response = await this._getData(command, NEWS_EVENT.NEWS_ARTICLE)
		const { data } = parseMessage(response)
		return data
	}

	async getInstrumentDetails (exSymbol) {
		const command = makeRequestSubscriptionCommand(
			INTENT.INSTRUMENT_DETAILS,
			this._socket.getReqId(),
			icFactory.instrumentDetailsConfig(exSymbol)
		)

		const response = await this._getData(
			command,
			MARKETDATA_EVENT.INSTRUMENT_DETAIL_END,
			[ MARKETDATA_EVENT.INSTRUMENT_DETAIL ],
			(result, data, event) => [ ...result, parseMessage({ data, event }).data ],
			[]
		)

		return response.data
	}

	async getInstrumentFundamental (exSymbol) {
		const command = makeRequestSubscriptionCommand(
			INTENT.INSTRUMENT_FUNDAMENTAL,
			this._socket.getReqId(),
			icFactory.instrumentFundamentalConfig(exSymbol)
		)

		const response = await this._getData(command, MARKETDATA_EVENT.FUNDAMENTAL_DATA)

		const { data } = parseMessage(response)
		return data
	}

	async getMarketdataSnapshot (exSymbol) {
		const command = makeRequestSubscriptionCommand(
			INTENT.LIVE_MARKET_DATA,
			this._socket.getReqId(),
			icFactory.marketDataConfig(exSymbol, GENERIC_TICK.DEFAULT, true)
		)

		const response = await this._getData(
			command,
			MARKETDATA_EVENT.TICK_SNAPSHOT_END,
			[ MARKETDATA_EVENT.TICK_PRICE, MARKETDATA_EVENT.TICK_SIZE, MARKETDATA_EVENT.TICK_STRING ],
			(result, data, event) => {
				const field = parseMessage({ data, event })
				Object.assign(result, field.data)
				return result
			},
			{}
		)

		return response.data
	}

	async getScannerParameters () {
		const command = makeRequestSubscriptionCommand(INTENT.SCANNER_PARAMTERS)
		const response = await this._getData(command, MARKETDATA_EVENT.SCANNER_PARAMETERS)
		const result = response.data[0]
		return result
	}

	async getOpenOrders () {
		const command = makeRequestSubscriptionCommand(INTENT.OPEN_ORDERS)
		const response = await this._getData(
			command,
			TRADE_EVENT.ORDER_OPEN_END,
			[ TRADE_EVENT.ORDER_OPEN ],
			(result, message) => [ ...result, parseMessage(message).data ],
			[]
		)

		return response.data
	}

	async getCompletedOrders () {
		const command = makeRequestSubscriptionCommand(INTENT.COMPLETED_ORDERS)
		const response = await this._getData(
			command,
			TRADE_EVENT.ORDER_COMPLETED_END,
			[ TRADE_EVENT.ORDER_COMPLETED ],
			(result, message) => [ ...result, parseMessage(message).data ],
			[]
		)

		return response.data
	}

	/**
	* 
	* @typedef OrderConfig
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
	 * @param {string} exSymbol
	 * @param {string} orderType
	 * @param {number} quantity
	 * @param {OrderConfig} orderConfig
	 * @memberof IbConnector
	 */
	async placeOrder (exSymbol, orderType, quantity, orderConfig) {
		const getOrderICommand = {
			command: 'reqIds',
			args: [ 1 ]
		}

		const { data } = await this._getData(getOrderICommand, TRADE_EVENT.NEXT_ORDER_ID)
		const [ orderId ] = data

		const message = makePlaceOrderCommand(orderId, orderType, exSymbol, quantity, orderConfig)
		this._sendCommand(message)

		return orderId
	}

	/**
	 * Cancel an order
	 *
	 * @param {string} orderId
	 */
	cancelOrder (orderId) {
		const message = makeCancelOrderCommand(orderId)
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

			this._checkDisconnected()

			const socket = this._initConnection(config)

			this._socket = socket

			this._onceMessageEvent(EVENT.READY, account => {
				this.account = account

				if (this._marketDataType !== undefined) {
					this._sendCommand({
						command: 'reqMarketDataType',
						args: [ this._marketDataType ]
					})
				}

				if (this._serverLogLevel !== SERVER_LOG_LEVEL.ERROR) {
					this._sendCommand({
						command: 'setServerLogLevel',
						args: [ this._serverLogLevel ]
					})
				}

				socket.off(EVENT.ERROR, reject)
				resolve(this)
			})

			socket.once(EVENT.ERROR, reject)

			socket.on(EVENT.MESSAGE, message => this._onMessage(message, config))

			const forwardedEvents = [ EVENT.OPEN, EVENT.CLOSE, EVENT.ERROR ]

			forwardedEvents.forEach(event => socket.on(event, (...args) => this.emit(uuid, event, ...args)))
		})
	}

	/**
	 * disconnect from IB proxy and release related resources
	 *
	 * @returns {Promise}
	 * @memberof IbConnector
	 */
	disconnect () {
		return new Promise((resolve, reject) => {
			this._checkConnected(reject)

			const socket = this._socket
			socket.close()

			this._responseHandlers = {}
			this._socket = undefined

			setTimeout(resolve)
		})
	}

	_checkConnected (errCb) {
		const socket = this._socket

		if (!socket || socket.readyState === socket.CLOSED) {
			const message = 'The connection is already closed'
			if (errCb) {
				errCb(message)
			} else {
				throw new Error(message)
			}
		}
	}

	_checkDisconnected () {
		const socket = this._socket

		if (socket && socket.readyState === socket.OPEN) {
			throw new Error('The connection is already opened')
		}
	}

	_getData (command, completeEvent, acumulateEvents = [], onAcumulate, initialAcumulatedData) {
		return new Promise((resolve, reject) => {
			try {
				this._sendCommand(command)
			} catch (error) {
				reject(error)
			}

			let offEvents = []

			let acumulatedData = initialAcumulatedData

			acumulateEvents.forEach(acumulateEvent => {
				offEvents.push(
					this._onMessageEvent(acumulateEvent, (data, event) => {
						acumulatedData = onAcumulate(acumulatedData, data, event)
					})
				)
			})

			this._onceMessageEvent(completeEvent, (data, event) => {
				resolve({ data: acumulateEvents.length ? acumulatedData : data, event })
				offEvents.forEach(off => off())
			})
		})
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

		const { reqId, intent, ...result } = data

		if (!reqId && !intent) {
			return
		}

		const handler = this._responseHandlers[reqId || intent]

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

		const query = new URLSearchParams([ [ 'username', username ], [ 'password', password ] ])

		const url = `${this._getStream(config)}?${query}`

		const socket = subscribe(config.uuid, [ url, {} ])

		attachRequestManagertoSocket(socket)

		return socket
	}

	_sendCommand (message) {
		this._checkConnected()

		assert(message.command, 'Command is not valid: ' + message.command)

		this.emit(EVENT.COMMAND_SEND, message)

		this._socket.send(JSON.stringify(message, (k, v) => (v === undefined ? '' : v)))
	}
	_onMessageEvent (eventName, cb) {
		const socket = this._socket

		const onMessage = message => {
			const { event, data } = JSON.parse(message)
			if (event === eventName) {
				cb(data, eventName)
			}
		}

		socket.on(EVENT.MESSAGE, onMessage)

		return () => socket.off(EVENT.MESSAGE, onMessage)
	}
	_onceMessageEvent (eventName, cb) {
		const socket = this._socket
		// ws's once() does not work as expected

		const onMessage = message => {
			const { event, data } = JSON.parse(message)
			if (event === eventName) {
				socket.off(EVENT.MESSAGE, onMessage)
				cb(data, eventName)
			}
		}

		socket.on(EVENT.MESSAGE, onMessage)
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
	subscribe (intent, config, cb) {
		return super.onSubscription(intent, config, cb)
	}

	unsubscribe (intent, reqId) {
		return super.offSubscription(intent, reqId)
	}
}
