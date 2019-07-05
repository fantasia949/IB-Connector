import lmaxlondon_connector from './lmaxlondon'
import hitbtc_connector from './hitbtc'
import IbConnector from './interactive_brokers'
import {
	MARKET_DATA_TYPE,
	INTENT,
	EVENT,
	SECURITY_TYPE,
	ORDER_TYPE,
	ORDERBOOK_OPERATION,
	ACCOUNT_EVENT,
	MARKETDATA_EVENT
} from './interactive_brokers/constants'

// let lmaxlondon = new lmaxlondon_connector();
// let hitbtc = new hitbtc_connector()
import {
	WatchlistConfig,
	OrderbookConfig,
	HistoricalDataConfig,
	AccountSummaryConfig,
	InstrumentDetailConfig,
	RecentTradesConfig,
	PortfolioConfig
} from './interactive_brokers/intentConfigs'
;(async () => {
	const credentials = {
		username: 'hxvn0001',
		password: 'Hydra2019'
	}

	const ib = new IbConnector(credentials)
	// free user must set market data subscription to DELAYED in order to get market data
	ib.setMarketDataType(MARKET_DATA_TYPE.DELAYED)
	ib.on(EVENT.ERROR, (uuid, err) => console.log(uuid, err))
	ib.on(EVENT.CLOSE, uuid => console.log(uuid, 'disconnected'))
	// every command sent to IB will be logged here
	ib.on(EVENT.COMMAND_SEND, message => console.log(JSON.stringify(message)))
	// every data got from IB will be logged here
	// ib.on(EVENT.DATA, (uuid, data, event) => console.log(uuid, 'global', data, event))

	await ib.connect({ uuid: 'fb' })

	const facebookSymbol = 'fb'

	// testWatchlist(ib, facebookSymbol)

	// testOrderbook('eur/usd', SECURITY_TYPE.FOREX)

	// testInstrumentDetail(ib, facebookSymbol)

	// testAccount(ib)

	// testRecentTrades(ib, 'eur/usd', SECURITY_TYPE.FOREX)

	// testHistoricData('eur/usd', SECURITY_TYPE.FOREX)

	// testPositions(ib)

	// testOpenOrders(ib)
	// testTrading(ib, facebookSymbol)

	// testPortfolio(ib)

	setTimeout(() => ib.disconnect(), 40 * 1000)
})()

//lmaxlondon.subscribe('watchlist', 'socket_id', 'lmaxlondon:eur/usd');
//hitbtc.subscribe('watchlist', 'socket','hitbtc:ltc/btc')

const testWatchlist = (ib, exSymbol, secType) => {
	const watchlist = { bid: '-', ask: '-', last: '-', lastTraded: '-', volume: '-', close: '-', open: '-' }

	let watchlistTimeoutId = undefined
	ib.subscribe(INTENT.WATCHLIST, new WatchlistConfig(exSymbol, secType), (_, data) => {
		Object.keys(watchlist).filter(field => data[field] !== undefined).forEach(field => (watchlist[field] = data[field]))

		clearTimeout(watchlistTimeoutId)
		watchlistTimeoutId = setTimeout(() => console.log(watchlist), 300)
	})
}

const testOrderbook = (ib, exSymbol, secType) => {
	const orderbookEntry = { price: '-', size: '-' }
	const orderbook = Array.from({ length: 2 }).fill([
		{ ...orderbookEntry },
		{ ...orderbookEntry }
	])
	let orderbookTimeoutId = undefined

	ib.subscribe(INTENT.ORDERBOOK, new OrderbookConfig(exSymbol, secType, 2), (_, { position, operation, side, price, size }) => {
		switch (operation) {
			case ORDERBOOK_OPERATION.INSERT:
				orderbook[position][side] = { price, size }
				break
			case ORDERBOOK_OPERATION.UPDATE:
				Object.assign(orderbook[position][side], JSON.parse(JSON.stringify({ price, size })))
				break
			case ORDERBOOK_OPERATION.DELETE:
				orderbook[position][side] = { ...orderbookEntry }
				break
		}

		clearTimeout(orderbookTimeoutId)
		orderbookTimeoutId = setTimeout(() => console.log(orderbook), 300)
	})
}

const testInstrumentDetail = (ib, exSymbol, secType) => {
	const info = []
	ib.subscribe(INTENT.INSTRUMENT_DETAIL, new InstrumentDetailConfig(exSymbol, secType), (_, entry, event) => {
		if (event === MARKETDATA_EVENT.INSTRUMENT_DETAIL_END) {
			console.log(info)
		}
		info.push(entry)
	})
}

const testAccount = async ib => {
	const account = {}
	const accountReqId = await ib.subscribe(INTENT.ACCOUNT_SUMMARY, new AccountSummaryConfig(), (_, { tag, value }, event) => {
		if (event === ACCOUNT_EVENT.ACCOUNT_SUMMARY_END) {
			console.log(account)
			ib.unsubscribe(INTENT.ACCOUNT_SUMMARY, accountReqId)
		}
		account[tag] = value
	})
}

const testRecentTrades = (ib, exSymbol, secType, whatToShow) => {
	ib.subscribe(INTENT.RECENT_TRADES, new RecentTradesConfig(exSymbol, secType, whatToShow), (uuid, data, event) =>
		console.log(uuid, data, event)
	)
}

const testHistoricData = (ib, exSymbol, secType, whatToShow) => {
	ib.subscribe(INTENT.HISTORICAL_DATA, new HistoricalDataConfig(exSymbol, secType, whatToShow), (uuid, data, event) =>
		console.log(uuid, facebookSymbol, data, event)
	)
}

const testPositions = ib => {
	ib.subscribe(INTENT.POSITIONS, undefined, (uuid, data, event) => console.log(uuid, data, event))
}

const testOpenOrders = ib => {
	ib.subscribe(INTENT.OPEN_ORDERS, undefined, (uuid, data, event) => console.log(uuid, data, event))
}

const testTrading = async (ib, facebookSymbol) => {
	const orderId = await ib.placeOrder(facebookSymbol, ORDER_TYPE.LIMIT, 10, { price: 0.01 })
	setTimeout(() => ib.cancelOrder(orderId), 8 * 1000)
}

const testPortfolio = ib => {
	const account = {}
	ib.subscribe(INTENT.PORTFOLIO, undefined, (uuid, data, event) => {
		if (event === ACCOUNT_EVENT.ACCOUNT_DOWNLOAD_END) {
			console.log(uuid, account)
			ib.unsubscribe(INTENT.PORTFOLIO)
		}
		if (event === ACCOUNT_EVENT.UPDATE_ACCOUNT_VALUE) {
			const { key, value } = data
			account[key] = value
		}
		if (event === ACCOUNT_EVENT.UPDATE_ACCOUNT_TIMESTAMP) {
			const { timestamp } = data
			account.timestamp = timestamp
		}
		if (event === ACCOUNT_EVENT.UPDATE_PORTFOLIO) {
			console.log(uuid, data)
		}
	})
}
