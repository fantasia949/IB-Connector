import { TICK_PRICE_FIELD, TICK_SIZE_FIELD, TICK_STRING_FIELD, MARKETDATA_EVENT, TRADE_EVENT, ACCOUNT_EVENT } from './constants'
import { reqIdMappingFunc } from './utils'
import assert from 'assert'

const tickSizeField = {
	[TICK_SIZE_FIELD.ASK]: 'askSize',
	[TICK_SIZE_FIELD.DELAYED_ASK_SIZE]: 'askSize',
	[TICK_SIZE_FIELD.BID]: 'bidSize',
	[TICK_SIZE_FIELD.DELAYED_BID_SIZE]: 'bidSize',
	[TICK_SIZE_FIELD.LAST]: 'lastSize',
	[TICK_SIZE_FIELD.DELAYED_LAST_SIZE]: 'lastSize',
	[TICK_SIZE_FIELD.VOLUME]: 'volume',
	[TICK_SIZE_FIELD.DELAYED_VOLUME]: 'volume'
}

const tickStringField = {
	[TICK_STRING_FIELD.LAST_TRADED_TIMESTAMP]: 'lastTraded',
	[TICK_STRING_FIELD.DELAYED_LAST_TRADED_TIMESTAMP]: 'lastTraded'
}

const tickPriceField = {
	[TICK_PRICE_FIELD.ASK]: 'ask',
	[TICK_PRICE_FIELD.DELAYED_ASK]: 'ask',
	[TICK_PRICE_FIELD.BID]: 'bid',
	[TICK_PRICE_FIELD.DELAYED_BID]: 'bid',
	[TICK_PRICE_FIELD.LAST]: 'last',
	[TICK_PRICE_FIELD.DELAYED_LAST]: 'last',
	[TICK_PRICE_FIELD.CLOSE]: 'close',
	[TICK_PRICE_FIELD.DELAYED_CLOSE]: 'close',
	[TICK_PRICE_FIELD.OPEN]: 'open',
	[TICK_PRICE_FIELD.DELAYED_OPEN]: 'open'
}

const dataMapperFunc = {
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a1844eb442fb657c0f2cc0a63e4e74eba
	[MARKETDATA_EVENT.TICK_SIZE]: (
		[
			reqId,
			field,
			size
		]
	) => ({ reqId, [tickSizeField[field]]: size, _origField: field }),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ae851ec3a1e0fa2d0964c7779b0c89718
	[MARKETDATA_EVENT.TICK_PRICE]: (
		[
			reqId,
			field,
			price,
			attribs
		]
	) => ({
		reqId,
		[tickPriceField[field]]: price,
		_origField: field,
		attribs
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a19cb7c5bbd4ab05ccc5f9e686ed07a9e
	[MARKETDATA_EVENT.TICK_STRING]: (
		[
			reqId,
			field,
			value
		]
	) => ({
		reqId,
		[tickStringField[field]]: +value,
		_origField: field
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ab0d68c4cf7093f105095d72dd7e7a912
	[MARKETDATA_EVENT.ORDERBOOK]: (
		[
			reqId,
			position,
			operation,
			side,
			price,
			size
		]
	) => ({
		reqId,
		position,
		operation,
		side,
		price,
		size
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ac943e5b81f6de111ddf71a1f05ab6282
	[MARKETDATA_EVENT.HISTORICAL_DATA]: (
		[
			reqId,
			{ time, open, high, low, close, volume, count, wap }
		]
	) => ({
		reqId,
		time,
		open,
		high,
		low,
		close,
		volume,
		count,
		wap
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a8c168da3a812b667421bec4e6e2a5b2d
	[MARKETDATA_EVENT.HISTORICAL_DATA_UPDATE]: (
		[
			reqId,
			{ time, open, high, low, close, volume, count, wap }
		]
	) => ({
		reqId,
		time,
		open,
		high,
		low,
		close,
		volume,
		count,
		wap
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a715bb6750de66a0e072a910e697e20cf
	[MARKETDATA_EVENT.HISTORICAL_DATA_END]: (
		[
			reqId,
			start,
			end
		]
	) => ({
		reqId,
		start,
		end
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#aa05258f1d005accd3efc0d60bc151407
	[TRADE_EVENT.ORDER_OPEN]: (
		[
			orderId,
			contract,
			order,
			orderState
		]
	) => ({
		orderId,
		contract,
		order,
		orderState
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ab86caf7ed61e14d9b5609e8dd60b93e1
	[TRADE_EVENT.ORDER_OPEN_END]: reqIdMappingFunc,
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a17f2a02d6449710b6394d0266a353313
	[TRADE_EVENT.ORDER_STATUS]: (
		[
			orderId,
			status,
			filled,
			remaining,
			avgFillPrice,
			permId,
			parentId,
			lastFillPrice,
			clientId,
			whyHeld,
			mktCapPrice
		]
	) => ({
		orderId,
		status,
		filled,
		remaining,
		avgFillPrice,
		permId,
		parentId,
		lastFillPrice,
		clientId,
		whyHeld,
		mktCapPrice
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#af4105e2dae9efd6f6bb56f706374c9d6
	[TRADE_EVENT.POSITION]: (
		[
			account,
			{ symbol, exchange, currency },
			pos,
			avgCost
		]
	) => ({
		account,
		symbol,
		exchange,
		currency,
		pos,
		avgCost
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#acf1bebfc1b29cbeff32da7d53aec0971
	[TRADE_EVENT.POSITION_END]: reqIdMappingFunc,
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#acd761f48771f61dd0fb9e9a7d88d4f04
	[ACCOUNT_EVENT.ACCOUNT_SUMMARY]: (
		[
			reqId,
			account,
			tag,
			value,
			currency
		]
	) => ({
		reqId,
		account,
		tag,
		value,
		currency
	}),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a12bf8483858526077140c950e80f2995
	[ACCOUNT_EVENT.ACCOUNT_SUMMARY_END]: reqIdMappingFunc,
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a1b767810613c700b5bb1056a836da0bc
	[MARKETDATA_EVENT.INSTRUMENT_DETAIL]: (
		[
			reqId,
			{ marketName, minTick, orderTypes, validExchanges, longName, industry, category, subcategory, tradingHours, issueDate }
		]
	) => ({
		reqId,
		marketName,
		minTick,
		orderTypes,
		validExchanges,
		longName,
		industry,
		category,
		subcategory,
		tradingHours,
		issueDate
	}),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a4e9466339bac7149c2fdb48cda0dd088
	[MARKETDATA_EVENT.INSTRUMENT_DETAIL_END]: reqIdMappingFunc
}

export const parseMessage = message => {
	assert(message, 'Message is undefined')

	const { event, data } = JSON.parse(message)

	const func = dataMapperFunc[event]

	if (!func) {
		return { event, data }
	}

	return {
		event,
		data: func(data)
	}
}
