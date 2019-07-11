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
	NEWS_EVENT,
	SERVER_LOG_LEVEL,
	SCANNER_SUBSCRIPTION_FILTER
} from './interactive_brokers/constants'

import * as icFactory from './interactive_brokers/intentConfig/factory'

export const initIb = () => {
	const connectorConfig = {
		username: 'hxvn0002',
		password: 'Hydra2019',
		serverLogLevel: SERVER_LOG_LEVEL.DETAIL,
		// free user must set market data subscription to DELAYED in order to get market data
		marketDataType: MARKET_DATA_TYPE.DELAYED
	}

	const ib = new IbConnector(connectorConfig)

	return ib
}

const main = async () => {
	const facebookConId = 107113386
	const facebookSymbol = 'fb'

	const ib = initIb()

	ib.on(EVENT.ERROR, (uuid, err) => console.log(uuid, err))
	ib.on(EVENT.CLOSE, uuid => console.log(uuid, 'disconnected'))
	// ib.on(EVENT.MESSAGE, message => console.log(uuid, message))
	// every command sent to IB will be logged here
	// ib.on(EVENT.COMMAND_SEND, message => console.log(JSON.stringify(message)))
	// every data got from IB will be logged here
	// ib.on(EVENT.DATA, (uuid, data, event) => console.log(uuid, 'global', data, event))

	await ib.connect({ uuid: 'fb' })
	setTimeout(() => ib.disconnect(), 40 * 1000)

	// testWatchlist(ib, facebookSymbol)
	// testOrderbook(ib, 'eur/usd', SECURITY_TYPE.FOREX)
	// testAccount(ib)
	// testRecentTrades(ib, 'eur/usd', SECURITY_TYPE.FOREX)
	// testHistoricData(ib, 'eur/usd', SECURITY_TYPE.FOREX)
	// testPositions(ib)
	// testHistoricalNews(ib, facebookConId, [
	// 	'BRFG',
	// 	'BRFUPDN',
	// 	'DJNL'
	// ])
	// testRecentNews(ib, facebookSymbol, SECURITY_TYPE.STOCK, 'BRFG')
	// testScannerSubscription(ib)

	// testTrading(ib, facebookSymbol)
	// setTimeout(() => testOpenOrders(ib), 4 * 1000)

	// testPortfolio(ib)

	// await testWatchlistSnapshot(ib, facebookSymbol)
	// await testNewsProviders(ib)
	// await testNewsArticle(ib, 'BRFG', 'BRFG$0af99099')
	// await testInstrumentDetail(ib, facebookSymbol)
	// await testMatchingSymbols(ib, facebookSymbol)
	// await testInstrumentFundamental(ib, facebookSymbol)
	await testScannerParameters(ib)

	// not work
	// await testCompletedOrders(ib)
}

main().catch(err => console.error(err))

const testWatchlist = (ib, exSymbol, secType) => {
	const watchlist = { bid: '-', ask: '-', last: '-', lastTraded: '-', volume: '-', close: '-', open: '-' }

	let watchlistTimeoutId = undefined
	ib.subscribe(INTENT.MARKET_DATA, icFactory.marketDataConfig(exSymbol, secType), (_, data) => {
		Object.keys(watchlist).filter(field => data[field] !== undefined).forEach(field => (watchlist[field] = data[field]))

		clearTimeout(watchlistTimeoutId)
		watchlistTimeoutId = setTimeout(() => console.log(watchlist), 300)
	})
}

const testWatchlistSnapshot = async (ib, exSymbol, secType) => {
	const result = await ib.getMarketdataSnapshot(exSymbol, secType)
	console.log(result)
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

const testInstrumentDetail = async (ib, exSymbol, secType) => {
	const result = await ib.getInstrumentDetails(exSymbol, secType)
	console.log(result)
}

const testInstrumentFundamental = async (ib, exSymbol, secType) => {
	const result = await ib.getInstrumentFundamental(exSymbol, secType)
	console.log(result)
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
	ib.subscribe(INTENT.OPEN_POSITIONS, icFactory.defaultIntentConfig(), (uuid, data, event) => console.log(uuid, data, event))
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
	const data = await ib.getNewsArticle(providerCode, articleId)
	console.log(data)
}

const testRecentNews = async (ib, exSymbol, secType, providerCode) => {
	ib.subscribe(INTENT.RECENT_NEWS, icFactory.recentNewsConfig(exSymbol, secType, providerCode), (uuid, data, event) =>
		console.log(uuid, exSymbol, data, event)
	)
}

const testMatchingSymbols = async (ib, pattern) => {
	const data = await ib.getMatchingSymbols(pattern)
	console.log(data)
}

const testScannerSubscription = async ib => {
	ib.subscribe(
		INTENT.SCANNER_SUBSCRIPTION,
		icFactory.scannerSubscriptionConfig({
			[SCANNER_SUBSCRIPTION_FILTER.NUMBER_OF_ROWS]: 5,
			// the rules are got from subscriptionParameters
			[SCANNER_SUBSCRIPTION_FILTER.SCAN_CODE]: 'TOP_PERC_GAIN',
			[SCANNER_SUBSCRIPTION_FILTER.INSTRUMENT]: 'STK',
			[SCANNER_SUBSCRIPTION_FILTER.LOCATION_CODE]: 'STK.NASDAQ.NMS',
			[SCANNER_SUBSCRIPTION_FILTER.STOCK_TYPE_FILTER]: 'ALL'
		}),
		(uuid, data, event) => console.log(uuid, data, event)
	)
}

// WARNING: the XML content's size is 1.4Mbs, which is too costly to parse. So the connector will not parse it in main thread
// It's preferred to use scannerParamsJob as a weekly/monthly job to fetch and parse this data
const testScannerParameters = async ib => {
	const data = await ib.getScannerParameters()
	require('fs').writeFile('./dist/params.xml', data, err => console.log(err || 'The file was saved!'))
}
