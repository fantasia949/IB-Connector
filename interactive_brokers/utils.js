import { SECURITY_TYPE, ORDER_TYPE, SECURITY_TYPES, CURRENCIES } from './constants'
import assert from 'assert'

class BaseExchange {
	constructor (exSymbol, secType) {
		this.exSymbol = exSymbol
		this.secType = secType
	}
}

class FutureExchange extends BaseExchange {
	constructor (exSymbol, expiry, multiplier) {
		super(exSymbol, SECURITY_TYPE.FUTURE)
		this.expiry = expiry
		this.multiplier = multiplier
	}
}

class OptionExchange extends BaseExchange {
	constructor (exSymbol, right, expiry, strike) {
		super(exSymbol, SECURITY_TYPE.OPTION)
		this.right = right
		this.expiry = expiry
		this.strike = strike
	}
}

class FutureOptionExchange extends BaseExchange {
	constructor (exSymbol, right, expiry, strike) {
		super(exSymbol, SECURITY_TYPE.FOP)
		this.expiry = expiry
		this.strike = strike
		this.right = right
	}
}

export const exchangeUtils = {
	isExchangeObject: object => object instanceof BaseExchange,
	commodity: exSymbol => new BaseExchange(exSymbol, SECURITY_TYPE.COMMODITY),
	stock: exSymbol => new BaseExchange(exSymbol, SECURITY_TYPE.STOCK),
	forex: exSymbol => new BaseExchange(exSymbol, SECURITY_TYPE.FOREX),
	index: exSymbol => new BaseExchange(exSymbol, SECURITY_TYPE.INDEX),
	future: (exSymbol, expiry, multiplier) => new FutureExchange(exSymbol, expiry, multiplier),
	option: (exSymbol, right, expiry, strike) => new OptionExchange(exSymbol, right, expiry, strike),
	futureOption: (exSymbol, right, expiry, strike) => new FutureOptionExchange(exSymbol, right, expiry, strike)
}

export const orderUtils = {
	limit: (action, totalQuantity, price) => ({
		action: action,
		lmtPrice: price,
		orderType: ORDER_TYPE.LIMIT,
		totalQuantity,
		transmit: true
	}),
	market: (action, totalQuantity, goodAfterTime = '', goodTillDate = '') => ({
		action: action,
		orderType: ORDER_TYPE.MARKET,
		totalQuantity,
		transmit: true,
		goodAfterTime,
		goodTillDate
	}),
	marketClose: (action, totalQuantity) => ({
		action: action,
		orderType: ORDER_TYPE.MARKET_CLOSE,
		totalQuantity,
		transmit: true
	}),
	stop: (action, totalQuantity, auxPrice, parentId = 0, tif = 'DAY') => ({
		action,
		auxPrice,
		orderType: ORDER_TYPE.STOP,
		totalQuantity,
		transmit: true,
		parentId,
		tif
	}),
	stopLimit: (action, totalQuantity, lmtPrice, auxPrice, parentId = 0, tif = 'DAY') => ({
		action,
		lmtPrice,
		auxPrice,
		orderType: ORDER_TYPE.STOP_LIMIT,
		totalQuantity,
		transmit: true,
		parentId,
		tif
	}),
	trailingStop: (action, totalQuantity, auxPrice, parentId = 0, tif = 'DAY') => ({
		action,
		totalQuantity,
		orderType: ORDER_TYPE.TRAILING_STOP,
		auxPrice,
		tif,
		transmit: true,
		parentId
	})
}

export const makeContract = input => {
	const DEFAULT_CURRENCY = 'USD'
	const DEFAULT_EXCHANGE = 'SMART'

	if (input.type && input.subtype) {
		return input
	}

	let { exSymbol, secType, multiplier, expiry, strike, right } = exchangeUtils.isExchangeObject(input)
		? input
		: { exSymbol: input }

	assert(exSymbol, 'exSymbol is required')

	let exludedSecType = undefined

	if (secType) {
		exludedSecType = exSymbol
	} else {
		;[ secType, exludedSecType ] = exSymbol.split('@')

		if (exludedSecType === undefined) {
			exludedSecType = secType
			secType = SECURITY_TYPE.STOCK
		}
	}

	assert(SECURITY_TYPES.includes(secType), 'secType is invalid: ' + secType)

	let [ excludedSecTypeCurrency, currency = DEFAULT_CURRENCY ] = exludedSecType.split('/')
	let [ exchange, symbol ] = excludedSecTypeCurrency.split(':')

	if (symbol === undefined) {
		symbol = exchange
		exchange = undefined
	}

	assert(symbol, 'symbol is required')

	const contract = {
		symbol,
		currency,
		secType,
		exchange
	}

	switch (secType) {
		case SECURITY_TYPE.STOCK:
		case SECURITY_TYPE.COMMODITY:
			break
		case SECURITY_TYPE.FOREX:
			// Swap between symbol and currency if the ordering is incorrect.
			if (CURRENCIES.indexOf(symbol) > CURRENCIES.indexOf(currency)) {
				;[ symbol, currency ] = [ currency, symbol ]
			}

			if (!exchange) {
				contract.exchange = 'IDEALPRO'
			}
			break
		case SECURITY_TYPE.INDEX:
			if (!exchange) {
				contract.exchange = 'CBOE'
			}
			break
		case SECURITY_TYPE.FUTURE:
			assert(expiry, 'expiry is required')
			if (!exchange) {
				contract.exchange = 'ONE'
			}
			Object.assign(contract, { expiry, multiplier })
			break
		case SECURITY_TYPE.OPTION:
			assert(expiry, 'expiry is required')
			assert(right, 'right is required')
			assert(strike, 'strike is required')
			Object.assign(contract, { expiry, right, strike, multiplier: multiplier || 100 })
			break
		case SECURITY_TYPE.FOP:
			assert(expiry, 'expiry is required')
			assert(right, 'right is required')
			assert(strike, 'strike is required')
			if (!exchange) {
				contract.exchange = 'GLOBEX'
			}
			Object.assign(contract, { expiry, right, strike, multiplier: multiplier || 50 })
			break
	}

	if (!contract.exchange) {
		contract.exchange = DEFAULT_EXCHANGE
	}

	return contract
}

export const reqIdMappingFunc = ([ reqId ]) => ({ reqId })
