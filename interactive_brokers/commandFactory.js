import { INTENT, SUBSCRIPTION_TYPE, SECURITY_TYPE, ORDER_ACTION } from './constants'
import { makeContract, makeOrder } from './utils'
import assert from 'assert'

export const makeRequestSubscriptionCommand = (intent, reqId, config = intentConfig) => {
	let args = undefined
	const subscriptionType = SUBSCRIPTION_TYPE[intent]

	assert(subscriptionType, 'This intent is not supported: ' + intent)

	const command = 'req' + subscriptionType

	switch (intent) {
		case INTENT.RECENT_TRADES:
			assert(config, 'Recent trades config must be defined')
			args = config.toCommandParams(reqId)
			break
		case INTENT.ORDERBOOK:
			assert(config, 'Orderbook config must be defined')
			args = config.toCommandParams(reqId)
			break
		case INTENT.WATCHLIST:
			assert(config, 'Watchlist config must be defined')
			args = config.toCommandParams(reqId)
			break
		case INTENT.ACCOUNT_SUMMARY:
			assert(config, 'Account summary config must be defined')
			args = config.toCommandParams(reqId)
			break
		case INTENT.INSTRUMENT_DETAIL:
			assert(config, 'Instrument detail config must be defined')
			args = config.toCommandParams(reqId)
			break
	}

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
