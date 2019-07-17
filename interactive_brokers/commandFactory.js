import { INTENT, SUBSCRIPTION_TYPE, ORDER_ACTIONS, ORDER_TYPES } from './constants'
import { makeContract } from './utils'
import assert from 'assert'
import {
	RecentTradesConfig,
	HistoricalDataConfig,
	OrderbookConfig,
	MarketDataConfig,
	AccountSummaryConfig,
	InstrumentDetailsConfig,
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
		case INTENT.LIVE_TRADES:
			assertType(config, RecentTradesConfig)
			break
		case INTENT.HISTORICAL_BAR:
			assertType(config, HistoricalDataConfig)
			break
		case INTENT.LIVE_ORDERBOOK:
			assertType(config, OrderbookConfig)
			break
		case INTENT.LIVE_MARKET_DATA:
			assertType(config, MarketDataConfig)
			break
		case INTENT.LIVE_ACCOUNT_SUMMARY:
			assertType(config, AccountSummaryConfig)
			break
		case INTENT.INSTRUMENT_DETAILS:
			assertType(config, InstrumentDetailsConfig)
			break
		case INTENT.LIVE_PORTFOLIO:
			assertType(config, PortfolioConfig)
			break
		case INTENT.HISTORICAL_NEWS:
			assertType(config, HistoricalNewsConfig)
			break
		case INTENT.NEWS_ARTICLE:
			assertType(config, NewsArticleConfig)
			break
		case INTENT.LIVE_NEWS:
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
	const args = [ reqId ]

	return { command, args }
}

export const makePlaceOrderCommand = (orderId, exSymbol, orderConfig) => {
	const command = 'placeOrder'
	assert(orderId, 'orderId is required')
	assert(exSymbol, 'exSymbol is required')
	assert(orderConfig, 'orderConfig is invalid')
	assert(ORDER_ACTIONS.includes(orderConfig.action), 'action is invalid')
	assert(ORDER_TYPES.includes(orderConfig.orderType), 'orderType is invalid')
	assert(orderConfig.totalQuantity > 0, 'totalQuantity is invalid')
	const args = [ orderId, makeContract(exSymbol), orderConfig ]

	return { command, args }
}

export const makeCancelOrderCommand = orderId => {
	const command = 'cancelOrder'
	const args = [ orderId ]

	return { command, args }
}
