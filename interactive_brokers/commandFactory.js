import { INTENT, GENERIC_TICK, SUBSCRIPTION_TYPE, SECURITY_TYPE, ORDER_TYPE, ORDER_ACTION } from './constants'
import { makeContract, makeOrder } from './utils'

export const makeRequestSubscriptionCommand = (intent, reqId, exSymbol, options = {}) => {
	let args = undefined
	const subscriptionType = SUBSCRIPTION_TYPE[intent]

	if (!subscriptionType) {
		throw new Error('This intent is not supported: ' + intent)
	}

	const command = 'req' + subscriptionType

	const {
		secType = SECURITY_TYPE.STOCK,
		snapshot = false,
		regulatory = false,
		genericTickList = GENERIC_TICK.DEFAULT,
		numRows = 1
	} = options

	switch (intent) {
		case INTENT.RECENT_TRADES:
			args = [
				reqId,
				makeContract(secType, exSymbol),
				'',
				'1 D',
				'1 min',
				'TRADES',
				1,
				1,
				true
			]
			break
		case INTENT.ORDERBOOK:
			args = [
				reqId,
				makeContract(secType, exSymbol),
				numRows
			]
			break
		case INTENT.WATCHLIST:
			args = [
				reqId,
				makeContract(secType, exSymbol),
				genericTickList,
				snapshot,
				regulatory
			]
			break
	}

	return { command, args }
}

export const makeCancelSubscriptionCommand = (intent, reqId) => {
	const subscriptionType = SUBSCRIPTION_TYPE[intent]

	if (!subscriptionType) {
		throw new Error('This intent is not supported: ' + intent)
	}

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
		makeContract(secType, exSymbol),
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
