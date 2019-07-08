import { INTENT, SUBSCRIPTION_TYPE, SECURITY_TYPE, ORDER_ACTION } from './constants'
import { makeContract, makeOrder } from './utils'
import assert from 'assert'
import {
	RecentTradesConfig,
	HistoricalDataConfig,
	OrderbookConfig,
	WatchlistConfig,
	AccountSummaryConfig,
	InstrumentDetailConfig,
	PortfolioConfig,
	HistoricalNewsConfig
} from './intentConfig'
import * as icFactory from './intentConfig/factory'
import NewsArticleConfig from './intentConfig/NewsArticleConfig'

export const makeRequestSubscriptionCommand = (intent, reqId, config = icFactory.defaultIntentConfig()) => {
	const subscriptionType = SUBSCRIPTION_TYPE[intent]

	assert(subscriptionType, 'This intent is not supported: ' + intent)

	const command = 'req' + subscriptionType

	switch (intent) {
		case INTENT.RECENT_TRADES:
			assert(config instanceof RecentTradesConfig, 'Config must be instance of RecentTradesConfig')
			break
		case INTENT.HISTORICAL_DATA:
			assert(config instanceof HistoricalDataConfig, 'Config must be instance of HistoricalDataConfig')
			break
		case INTENT.ORDERBOOK:
			assert(config instanceof OrderbookConfig, 'Config must be instance of OrderbookConfig')
			break
		case INTENT.WATCHLIST:
			assert(config instanceof WatchlistConfig, 'Config must be instance of WatchlistConfig')
			break
		case INTENT.ACCOUNT_SUMMARY:
			assert(config instanceof AccountSummaryConfig, 'Config must be instance of AccountSummaryConfig')
			break
		case INTENT.INSTRUMENT_DETAIL:
			assert(config instanceof InstrumentDetailConfig, 'Config must be instance of InstrumentDetailConfig')
			break
		case INTENT.PORTFOLIO:
			assert(config instanceof PortfolioConfig, 'Config must be instance of PortfolioConfig')
			break
		case INTENT.HISTORICAL_NEWS:
			assert(config instanceof HistoricalNewsConfig, 'Config must be instance of HistoricalNewsConfig')
			break
		case INTENT.NEWS_ARTICLE:
			assert(config instanceof NewsArticleConfig, 'Config must be instance of NewsArticleConfig')
			break
	}

	const args = reqId !== undefined ? config.toCommandParams(reqId) : config.toCommandParams()

	return { command, args }
}

export const makeCancelSubscriptionCommand = (intent, reqId) => {
	const subscriptionType = SUBSCRIPTION_TYPE[intent]

	assert(subscriptionType, 'This intent is not supported: ' + intent)

	const command = 'cancel' + subscriptionType
	const args = [
		reqId
	]

	return { command, args }
}

export const makePlaceOrderCommand = (orderId, orderType, exSymbol, quantity, config) => {
	const command = 'placeOrder'

	const { secType = SECURITY_TYPE.STOCK } = config
	const args = [
		orderId,
		makeContract({ secType, exSymbol }),
		makeOrder(orderType, ORDER_ACTION.BUY, quantity, config)
	]

	return { command, args }
}

export const makeCancelOrderCommand = orderId => {
	const command = 'cancelOrder'
	const args = [
		orderId
	]

	return { command, args }
}
