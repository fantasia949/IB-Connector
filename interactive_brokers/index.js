import assert from 'assert'
import WebSocket from 'simple-websocket'
import EventEmitter from 'events'
import {
	MARKET_DATA_TYPE,
	EVENT,
	TRADE_EVENT,
	INTENT,
	NEWS_EVENT,
	MARKETDATA_EVENT,
	GENERIC_TICK,
	SERVER_LOG_LEVEL,
	SECURITY_TYPES,
	ACCOUNT_EVENT
} from './constants'
import { parseMessage } from './parser'
import {
	makeRequestSubscriptionCommand,
	makeCancelSubscriptionCommand,
	makePlaceOrderCommand,
	makeCancelOrderCommand
} from './commandFactory'
import * as icFactory from './intentConfig/factory'
import { defer } from './utils'

const createWs = url => {
	const socket = new WebSocket(url)
	Object.assign(socket, {
		_reqId: 1,
		getReqId: function () {
			return this._reqId++
		}
	})

	return socket
}

/**
 * @typedef IbConnectorConfig
 * @property {string} username
 * @property {string} password
 * @property {string} endpoint
 * @property {number=} marketDataType
 * @property {number=} serverLogLevel
 * @property {number=} isMaster
 */

export default class IbConnector extends EventEmitter {
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
		this._orders = undefined
		this._allOrdersMode = false
	}

	setMarketDataType (marketDataType) {
		assert(Object.values(MARKET_DATA_TYPE).includes(marketDataType), 'marketDataType is invalid')
		this._marketDataType = marketDataType
	}

	setServerLogLevel (serverLogLevel) {
		assert(Object.values(SERVER_LOG_LEVEL).includes(serverLogLevel), 'serverLogLevel is invalid')
		this._serverLogLevel = serverLogLevel
	}

	get connected () {
		const socket = this._socket
		return socket ? socket.connected : false
	}

	get assets () {
		return Object.entries(SECURITY_TYPES)
	}

	/**
	 *
	 * @callback subscriptionCallback
	 * @param {number} uuid
	 * @param {object} result
	 * @param {string} event
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
	subscribe (intent, config, cb) {
		this._checkConnected()

		let reqId = undefined
		let message = undefined

		if (intent === INTENT.LIVE_PORTFOLIO) {
			message = makeRequestSubscriptionCommand(intent, true, icFactory.portfolioConfig(this.account))
		} else if (intent === INTENT.OPEN_ORDERS) {
			// order events are registered by default, no need to register
		} else {
			reqId = this._socket.getReqId()
			message = makeRequestSubscriptionCommand(intent, reqId, config)
		}
		
		if (message) {
			this._sendCommand(message)
		}

		if (typeof cb === 'function') {
			let key = [ INTENT.OPEN_ORDERS, INTENT.LIVE_PORTFOLIO ].includes(intent) ? intent : reqId
			if (intent === INTENT.ALL_OPEN_ORDERS) {
				key = INTENT.OPEN_ORDERS
			}
			this._responseHandlers[key] = cb
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
	unsubscribe (intent, reqId) {
		this._checkConnected()

		let message = undefined

		if (intent === INTENT.LIVE_PORTFOLIO) {
			message = makeRequestSubscriptionCommand(intent, false, icFactory.portfolioConfig(this.account))
		} else {
			assert(reqId, 'reqId is required to cancel this intent subscription')
			message = makeCancelSubscriptionCommand(intent, reqId)
		}

		this._sendCommand(message)

		if (this._responseHandlers[reqId || intent]) {
			this._responseHandlers[reqId || intent] = undefined
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

	async getAccountSummary (tags) {
		const command = makeRequestSubscriptionCommand(
			INTENT.LIVE_ACCOUNT_SUMMARY,
			this._socket.getReqId(),
			icFactory.accountSummaryConfig(undefined, tags)
		)

		const response = await this._getData(
			command,
			ACCOUNT_EVENT.ACCOUNT_SUMMARY_END,
			[ ACCOUNT_EVENT.ACCOUNT_SUMMARY ],
			(result, data, event) => {
				const field = parseMessage({ data, event })
				const { value, tag } = field.data
				result[tag] = value
				return result
			},
			{}
		)
		const { data } = parseMessage(response)
		return data
	}

	async getPortfolio () {
		const entries = []
		this.subscribe(INTENT.LIVE_PORTFOLIO, icFactory.defaultIntentConfig(), (_, entry, event) => {
			if (event === ACCOUNT_EVENT.UPDATE_PORTFOLIO) {
				entries.push(entry)
			}
		})
		await defer(2000)
		this.unsubscribe(INTENT.LIVE_PORTFOLIO)

		return entries
	}

	async getSupportedExchanges () {
		const command = makeRequestSubscriptionCommand(INTENT.EXCHANGES, undefined, icFactory.defaultIntentConfig())

		const response = await this._getData(command, MARKETDATA_EVENT.EXCHANGES)
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

	/**
	 * Get open orders
	 *
	 * @param {Boolean=} all
	 * @memberof IbConnector
	 * returns Promise<Array>
	 */
	async getOpenOrders (all) {
		if (all && !this._config.isMaster) {
			throw new Error('Only show all orders if the client is master client')
		}
		if (this._allOrdersMode !== all) {
			this._orders = undefined
			this._allOrdersMode = all
			const command = makeRequestSubscriptionCommand(all ? INTENT.ALL_OPEN_ORDERS : INTENT.OPEN_ORDERS)
			await this._getData(command, TRADE_EVENT.ORDER_OPEN_END)
		}

		return this._orders || []
	}

	async getCompletedOrders () {
		const command = makeRequestSubscriptionCommand(INTENT.COMPLETED_ORDERS)
		const response = await this._getData(
			command,
			TRADE_EVENT.ORDER_COMPLETED_END,
			[ TRADE_EVENT.ORDER_COMPLETED ],
			(result, data, event) => [ ...result, parseMessage({ event, data }).data ],
			[]
		)

		return response.data
	}

	/**
	 * Place an order
	 *
	 * @param {string} exSymbol
	 * @param {OrderConfig} orderConfig
	 * @returns {Object} order
	 * @memberof IbConnector
	 */
	async placeOrder (exSymbol, orderConfig) {
		const getOrderICommand = {
			command: 'reqIds',
			args: [ 1 ]
		}

		const message = await this._getData(getOrderICommand, TRADE_EVENT.NEXT_ORDER_ID)
		const { orderId } = parseMessage(message).data
		const command = makePlaceOrderCommand(orderId, exSymbol, orderConfig)
		await this._getData(command, TRADE_EVENT.ORDER_STATUS)
		return this._orders.find(order => order.orderId === orderId)
	}

	/**
	 * Cancel an order
	 *
	 * @param {string} orderId
	 * @returns {Object} order
	 */
	async cancelOrder (orderId) {
		const command = makeCancelOrderCommand(orderId)
		await this._getData(command, TRADE_EVENT.ORDER_STATUS)
		return this._orders.find(order => order.orderId === orderId)
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
			this._orders = undefined
			this._allOrdersMode = false

			setTimeout(resolve)
		})
	}

	_checkConnected (errCb) {
		const socket = this._socket
		if (!socket || !socket.connected) {
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

		if (socket && socket.connected) {
			throw new Error('The connection is already opened')
		}
	}

	_getData (command, completeEvent, acumulateEvents = [], onAcumulate, initialAcumulatedData, done) {
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

			const onFinished = (data, event) => {
				resolve({ data: acumulateEvents.length ? acumulatedData : data, event })
				offEvents.forEach(off => off())
				if (typeof done === 'function') {
					try {
						done()
					} catch (err) {}
				}
			}

			if (completeEvent instanceof Promise) {
				completeEvent.then(() => onFinished(acumulatedData))
			} else {
				this._onceMessageEvent(completeEvent, onFinished)
			}
		})
	}

	_onMessage (message, { uuid }) {
		let data = undefined
		let event = undefined

		try {
			const parsedMessage = parseMessage(message.toString('utf8'))

			data = parsedMessage.data
			event = parsedMessage.event

			if (event === EVENT.ERROR) {
				this.emit(EVENT.ERROR, uuid, data)
				return
			}

			this._handleOrderEvents(event, data)

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
		const { username, password, isMaster } = this._config

		let params = [ [ 'username', username ], [ 'password', password ] ]

		if (isMaster) {
			params.push([ 'isMaster', isMaster ])
		}

		const query = new URLSearchParams(params)

		const url = `${this._getStream(config)}?${query}`

		return createWs(url)
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

	_handleOrderEvents (event, data) {
		if ((event === TRADE_EVENT.ORDER_OPEN || event === TRADE_EVENT.ORDER_STATUS) && this._orders === undefined) {
			this._orders = []
		}

		const orders = this._orders

		if (event === TRADE_EVENT.ORDER_OPEN) {
			const order = mapToOrder(data)
			const index = orders.findIndex(({ orderId }) => orderId === order.orderId)
			if (index >= 0) {
				orders[index] = order
			} else {
				orders.push(order)
			}
		} else if (event === TRADE_EVENT.ORDER_STATUS) {
			const index = orders.findIndex(({ orderId }) => orderId === data.orderId)

			if (index === -1) {
				return
			}

			const { remaining, filled, status } = data
			Object.assign(orders[index], { remaining, filled, status })
		}
	}
}

const mapToOrder = ({
	orderId,
	contract: { symbol, currency, secType },
	order: { lmtPrice, totalQuantity },
	orderState: { status, commission }
}) => ({
	orderId,
	symbol,
	currency,
	secType,
	price: getValueOrDefault(lmtPrice, 0),
	totalQuantity,
	status,
	remaining: undefined,
	filled: undefined,
	commission: getValueOrDefault(commission, 0)
})

const getValueOrDefault = (value, defaultValue) => (value === Number.MAX_VALUE || value === undefined ? 0 : defaultValue)
