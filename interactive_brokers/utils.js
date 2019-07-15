import { SECURITY_TYPE, ORDER_TYPE } from './constants'
import assert from 'assert'

export const makeOrder = (orderType, action, quantity, config = {}) => {
	const { price, transmitOrder, goodAfterTime, goodTillDate, parentId, tif, limitPrice, stopPrice, auxPrice } = config

	let args = [ action, quantity ]

	switch (orderType) {
		case ORDER_TYPE.LIMIT:
			args = [ ...args, price, transmitOrder ]
			break
		case ORDER_TYPE.MARKET:
			args = [ ...args, transmitOrder, goodAfterTime, goodTillDate ]
			break
		case ORDER_TYPE.STOP:
			args = [ ...args, price, transmitOrder, parentId, tif ]
			break
		case ORDER_TYPE.STOP_LIMIT:
			args = [ ...args, limitPrice, stopPrice, transmitOrder, parentId, tif ]
			break
		case ORDER_TYPE.TRAILING_STOP:
			args = [ ...args, auxPrice, tif, transmitOrder, parentId ]
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

export const makeContract = ({ secType = SECURITY_TYPE.STOCK, exSymbol, multiplier, expiry, strike, right }) => {
	let args = []

	assert(exSymbol, 'exSymbol must be defined')

	const [ _exsymbol, currency ] = exSymbol.split('/')
	let [ exchange, symbol ] = _exsymbol.split(':')

	switch (secType) {
		case SECURITY_TYPE.STOCK:
		case SECURITY_TYPE.CFD:
			// symbol, exchange=SMART, currency-USD

			if (symbol === undefined) {
				symbol = exchange
				args = [ symbol ]
			} else {
				args = [ symbol, exchange ]
			}

			if (currency) {
				args.push(currency)
			}
			break
		case SECURITY_TYPE.FOREX:
			// symbol, currency
			assert(currency, 'forex instrument must have this format: symbol/currency')

			args = [ _exsymbol, currency ]
			break
		case SECURITY_TYPE.COMBO:
			// symbol, currency=USD, exchange=SMART
			args = [ symbol, currency, exchange ]
			break
		case SECURITY_TYPE.IND:
			// symbol, currency='USD', exchange=CBOE
			args = [ symbol, currency, exchange ]
			break
		case SECURITY_TYPE.FUTURE:
			// symbol, expiry, currency=USD, exchange=ONE, multiplier
			assert(expiry, 'expiry must be defined')
			assert(multiplier, 'multiplier must be defined')
			args = [ symbol, expiry, currency, exchange, multiplier ]
			break
		case SECURITY_TYPE.OPTION:
			// symbol, expiry, strike, right, exchange=SMART, currency=USD
			assert(expiry, 'expiry must be defined')
			assert(right, 'right must be defined')
			assert(strike, 'strike must be defined')
			args = [ symbol, expiry, strike, right, exchange, currency ]
			break
		case SECURITY_TYPE.FOP:
			// symbol, expiry, strike, right, multiplier=50, exchange=GLOBEX, currency=USD
			assert(expiry, 'expiry must be defined')
			assert(right, 'right must be defined')
			assert(strike, 'strike must be defined')
			args = [ symbol, expiry, strike, right, multiplier, exchange, currency ]
			break
		default:
			throw new Error('Security type is invalid: ' + secType)
	}

	return {
		type: 'contract',
		subtype: secType,
		args
	}
}

export const reqIdMappingFunc = ([ reqId ]) => ({ reqId })
