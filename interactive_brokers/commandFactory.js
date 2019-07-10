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
	HistoricalNewsConfig,
	MatchingSymbolsConfig,
	NewsArticleConfig,
	RecentNewsConfig
} from './intentConfig'
import * as icFactory from './intentConfig/factory'

const assertType = (actualConfig, expectedType) =>
	assert(actualConfig instanceof expectedType, `Config must be instance of ${expectedType.name}`)

export const makeRequestSubscriptionCommand = (intent, reqId, config = icFactory.defaultIntentConfig()) => {
	const subscriptionType = SUBSCRIPTION_TYPE[intent]

	assert(subscriptionType, 'This intent is not supported: ' + intent)

	const command = 'req' + subscriptionType

	switch (intent) {
		case INTENT.RECENT_TRADES:
			assertType(config, RecentTradesConfig)
			break
		case INTENT.HISTORICAL_DATA:
			assertType(config, HistoricalDataConfig)
			break
		case INTENT.ORDERBOOK:
			assertType(config, OrderbookConfig)
			break
		case INTENT.WATCHLIST:
			assertType(config, WatchlistConfig)
			break
		case INTENT.ACCOUNT_SUMMARY:
			assertType(config, AccountSummaryConfig)
			break
		case INTENT.INSTRUMENT_DETAIL:
			assertType(config, InstrumentDetailConfig)
			break
		case INTENT.PORTFOLIO:
			assertType(config, PortfolioConfig)
			break
		case INTENT.HISTORICAL_NEWS:
			assertType(config, HistoricalNewsConfig)
			break
		case INTENT.NEWS_ARTICLE:
			assertType(config, NewsArticleConfig)
			break
		case INTENT.RECENT_NEWS:
			assertType(config, RecentNewsConfig)
			break
		case INTENT.MATCHING_SYMBOLS:
			assertType(config, MatchingSymbolsConfig)
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
