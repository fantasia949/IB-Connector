import IbConnector from './interactive_brokers'
import {
	MARKET_DATA_TYPE,
	INTENT,
	EVENT,
	SECURITY_TYPE,
	ORDER_TYPE,
	ORDERBOOK_OPERATION,
	ACCOUNT_EVENT,
	MARKETDATA_EVENT,
	NEWS_EVENT
} from './interactive_brokers/constants'

import * as icFactory from './interactive_brokers/intentConfig/factory'

const main = async () => {
	const credentials = {
		username: 'hxvn0001',
		password: 'Hydra2019'
	}

	const facebookConId = 107113386
	const facebookSymbol = 'fb'

	const ib = new IbConnector(credentials)

	// free user must set market data subscription to DELAYED in order to get market data
	ib.setMarketDataType(MARKET_DATA_TYPE.DELAYED)
	ib.on(EVENT.ERROR, (uuid, err) => console.log(uuid, err))
	ib.on(EVENT.CLOSE, uuid => console.log(uuid, 'disconnected'))
	ib.on(EVENT.MESSAGE, message => console.log(uuid, message))
	// every command sent to IB will be logged here
	ib.on(EVENT.COMMAND_SEND, message => console.log(JSON.stringify(message)))
	// every data got from IB will be logged here
	// ib.on(EVENT.DATA, (uuid, data, event) => console.log(uuid, 'global', data, event))

	console.log('connecting')

	await ib.connect({ uuid: 'fb' })

	console.log('connected')

	// testWatchlist(ib, facebookSymbol)

	// testOrderbook(ib, 'eur/usd', SECURITY_TYPE.FOREX)

	// testInstrumentDetail(ib, facebookSymbol)

	// testAccount(ib)

	// testRecentTrades(ib, 'eur/usd', SECURITY_TYPE.FOREX)

	// testHistoricData(ib, 'eur/usd', SECURITY_TYPE.FOREX)

	// testPositions(ib)

	// testTrading(ib, facebookSymbol)
	// setTimeout(() => testOpenOrders(ib), 4 * 1000)

	// testPortfolio(ib)

	// await testNewsProviders(ib)

	// testHistoricalNews(ib, facebookConId, [
	// 	'BRFG',
	// 	'BRFUPDN',
	// 	'DJNL'
	// ])

	// await testNewsArticle(ib, 'BRFG', 'BRFG$0af99099')

	// testRecentNews(ib, facebookSymbol, SECURITY_TYPE.STOCK, 'BRFG')

	await testMatchingSymbols(ib, facebookSymbol)

	// not work now
	// await testCompletedOrders(ib)

	setTimeout(() => ib.disconnect(), 40 * 1000)
}

main().catch(err => console.error(err))

const testWatchlist = (ib, exSymbol, secType) => {
	const watchlist = { bid: '-', ask: '-', last: '-', lastTraded: '-', volume: '-', close: '-', open: '-' }

	let watchlistTimeoutId = undefined
	ib.subscribe(INTENT.WATCHLIST, icFactory.watchlistConfig(exSymbol, secType), (_, data) => {
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

	ib.subscribe(
		INTENT.ORDERBOOK,
		icFactory.orderbookConfig(exSymbol, secType, 2),
		(_, { position, operation, side, price, size }) => {
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
		}
	)
}

const testInstrumentDetail = (ib, exSymbol, secType) => {
	const info = []
	ib.subscribe(INTENT.INSTRUMENT_DETAIL, icFactory.instrumentDetailConfig(exSymbol, secType), (_, entry, event) => {
		if (event === MARKETDATA_EVENT.INSTRUMENT_DETAIL_END) {
			console.log(info)
		}
		info.push(entry)
	})
}

const testAccount = async ib => {
	const account = {}
	const accountReqId = await ib.subscribe(
		INTENT.ACCOUNT_SUMMARY,
		icFactory.accountSummaryConfig(),
		(_, { tag, value }, event) => {
			if (event === ACCOUNT_EVENT.ACCOUNT_SUMMARY_END) {
				console.log(account)
				ib.unsubscribe(INTENT.ACCOUNT_SUMMARY, accountReqId)
			}
			account[tag] = value
		}
	)
}

const testRecentTrades = (ib, exSymbol, secType, whatToShow) => {
	ib.subscribe(INTENT.RECENT_TRADES, icFactory.recentTradesConfig(exSymbol, secType, whatToShow), (uuid, data, event) =>
		console.log(uuid, data, event)
	)
}

const testHistoricData = (ib, exSymbol, secType, whatToShow) => {
	ib.subscribe(INTENT.HISTORICAL_DATA, icFactory.historicalDataConfig(exSymbol, secType, whatToShow), (uuid, data, event) =>
		console.log(uuid, exSymbol, data, event)
	)
}

const testPositions = ib => {
	ib.subscribe(INTENT.POSITIONS, icFactory.defaultIntentConfig(), (uuid, data, event) => console.log(uuid, data, event))
}

const testOpenOrders = async ib => {
	const orders = await ib.getOpenOrders()
	console.log(orders)
}

const testCompletedOrders = async ib => {
	const orders = await ib.getCompletedOrders()
	console.log(orders)
}

const testTrading = async (ib, facebookSymbol) => {
	const orderId = await ib.placeOrder(facebookSymbol, ORDER_TYPE.LIMIT, 10, { price: 0.01 })
	setTimeout(() => ib.cancelOrder(orderId), 8 * 1000)
}

const testPortfolio = ib => {
	const account = {}
	ib.subscribe(INTENT.PORTFOLIO, icFactory.defaultIntentConfig(), (uuid, data, event) => {
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

const testNewsProviders = async ib => {
	const providers = await ib.getNewsProviders()
	console.log(providers)
}

const testHistoricalNews = (ib, contId, providerCodes) => {
	const newsList = []

	ib.subscribe(INTENT.HISTORICAL_NEWS, icFactory.historicalNewsConfig(contId, providerCodes), (uuid, data, event) => {
		if (event === NEWS_EVENT.HISTORICAL_NEWS_END) {
			console.log(uuid, newsList)
		}
		if (event === NEWS_EVENT.HISTORICAL_NEWS) {
			newsList.push(data)
		}
	})
}

const testNewsArticle = async (ib, providerCode, articleId) => {
	const entry = await ib.getNewsArticle(providerCode, articleId)
	console.log(entry)
}

const testRecentNews = async (ib, exSymbol, secType, providerCode) => {
	ib.subscribe(INTENT.RECENT_NEWS, icFactory.recentNewsConfig(exSymbol, secType, providerCode), (uuid, data, event) =>
		console.log(uuid, exSymbol, data, event)
	)
}

const testMatchingSymbols = async (ib, pattern) => {
	const entry = await ib.getMatchingSymbols(pattern)
	console.log(entry)
}
