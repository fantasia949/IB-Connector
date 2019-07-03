import { SECURITY_TYPE, ORDER_TYPE } from './constants'

export const makeOrder = (orderType, action, quantity, config = {}) => {
	const { price, transmitOrder, goodAfterTime, goodTillDate, parentId, tif, limitPrice, stopPrice, auxPrice } = config

	let args = [
		action,
		quantity
	]

	switch (orderType) {
		case ORDER_TYPE.LIMIT:
			args = [
				...args,
				transmitOrder,
				price
			]
			break
		case ORDER_TYPE.MARKET:
			args = [
				...args,
				transmitOrder,
				goodAfterTime,
				goodTillDate
			]
			break
		case ORDER_TYPE.STOP:
			args = [
				...args,
				price,
				transmitOrder,
				parentId,
				tif
			]
			break
		case ORDER_TYPE.STOP_LIMIT:
			args = [
				...args,
				limitPrice,
				stopPrice,
				transmitOrder,
				parentId,
				tif
			]
			break
		case ORDER_TYPE.TRAILING_STOP:
			args = [
				...args,
				auxPrice,
				tif,
				transmitOrder,
				parentId
			]
			break
		case ORDER_TYPE.MARKET_CLOSE:
			break
		default:
			break
	}

	return {
		type: 'order',
		subtype: orderType,
		args
	}
}

export const makeContract = (secType, exSymbol, currency) => {
	let args = []

	switch (secType) {
		case SECURITY_TYPE.STOCK:
		case SECURITY_TYPE.CFD:
			// symbol, exchange=SMART, currency=USD
			let [
				exchange,
				symbol
			] = exSymbol.split(':')

			if (symbol === undefined) {
				symbol = exchange
				args = [
					symbol
				]
			} else {
				args = [
					symbol,
					exchange
				]
			}

			if (currency) {
				args.push(currency)
			}
			break
		case SECURITY_TYPE.FOREX:
			// symbol, currency
			const symbolCurrency = exSymbol.split('/')

			if (symbolCurrency.length !== 2) {
				throw new Error('forex instrument must have this format: symbol/currency')
			}

			args = [
				...symbolCurrency
			]
			break
		case SECURITY_TYPE.COMBO:
			// symbol, currency=USD, exchange=SMART
			args = [
				...exSymbol.split('/')
			]
			break
		case SECURITY_TYPE.IND:
		// symbol, currency='USD', exchange=CBOE
		case SECURITY_TYPE.FUTURE:
		// symbol, expiry, currency=USD, exchange=ONE, multiplier
		case SECURITY_TYPE.OPTION:
		// symbol, expiry, strike, right, exchange=SMART, currency=USD
		case SECURITY_TYPE.FOP:
		// symbol, expiry, strike, right, multiplier=50, exchange=GLOBEX, currency=USD
		default:
			//TODO: implement args for those securities
			break
	}

	return {
		type: 'contract',
		subtype: secType,
		args
	}
}

export const dumpFunc = data => data
