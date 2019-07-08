import {
	TICK_PRICE_FIELD,
	TICK_SIZE_FIELD,
	TICK_STRING_FIELD,
	MARKETDATA_EVENT,
	TRADE_EVENT,
	ACCOUNT_EVENT,
	INTENT,
	NEWS_EVENT
} from './constants'
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
	[TICK_STRING_FIELD.DELAYED_LAST_TRADED_TIMESTAMP]: 'lastTraded',
	[TICK_STRING_FIELD.NEW_FEED]: 'newFeed'
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
	) => ({ reqId, [tickPriceField[field]]: price, _origField: field, attribs }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a19cb7c5bbd4ab05ccc5f9e686ed07a9e
	[MARKETDATA_EVENT.TICK_STRING]: (
		[
			reqId,
			field,
			value
		]
	) => {
		const result = { reqId, _origField: field }

		if (field === TICK_STRING_FIELD.NEW_FEED) {
			const [articleId, time, providerCode, ...content] = value.split(' ')
			Object.assign(result, { articleId, time, providerCode, content: content.join(' ') })
		} else {
			result[tickStringField[field]] = +value
		}

		return result
	},

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ac2cf5a12822959fb0ce7e9f816157ea8
	// [MARKETDATA_EVENT.TICK_NEWS]: (
	// 	[
	// 		reqId,
	// 		timeStamp,
	// 		providerCode,
	// 		articleId,
	// 		headline,
	// 		extraData
	// 	]
	// ) => ({ reqId, timeStamp, providerCode, articleId, headline, extraData }),

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
	) => ({ reqId, position, operation, side, price, size }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ac943e5b81f6de111ddf71a1f05ab6282
	[MARKETDATA_EVENT.HISTORICAL_DATA]: (
		[
			reqId,
			date,
			open,
			high,
			low,
			close,
			volume,
			barCount,
			WAP,
			hasGaps
		]
	) => ({ reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a8c168da3a812b667421bec4e6e2a5b2d
	[MARKETDATA_EVENT.HISTORICAL_DATA_UPDATE]: (
		[
			reqId,
			date,
			open,
			high,
			low,
			close,
			volume,
			barCount,
			WAP,
			hasGaps
		]
	) => ({ reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a715bb6750de66a0e072a910e697e20cf
	[MARKETDATA_EVENT.HISTORICAL_DATA_END]: (
		[
			reqId,
			start,
			end
		]
	) => ({ reqId, start, end }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#aa05258f1d005accd3efc0d60bc151407
	[TRADE_EVENT.ORDER_OPEN]: (
		[
			orderId,
			contract,
			order,
			orderState
		]
	) => ({ orderId, contract, order, orderState, intent: INTENT.OPEN_ORDERS }),
	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ab86caf7ed61e14d9b5609e8dd60b93e1
	[TRADE_EVENT.ORDER_OPEN_END]: () => ({ intent: INTENT.OPEN_ORDERS }),

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
	) => ({ orderId, status, filled, remaining, avgFillPrice, permId, parentId, lastFillPrice, clientId, whyHeld, mktCapPrice }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#af4105e2dae9efd6f6bb56f706374c9d6
	[TRADE_EVENT.POSITION]: (
		[
			account,
			{ symbol, exchange, currency },
			pos,
			avgCost
		]
	) => ({ account, symbol, exchange, currency, pos, avgCost, intent: INTENT.POSITIONS }),
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
	) => ({ reqId, account, tag, value, currency }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a12bf8483858526077140c950e80f2995
	[ACCOUNT_EVENT.ACCOUNT_SUMMARY_END]: reqIdMappingFunc,

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a1b767810613c700b5bb1056a836da0bc
	[MARKETDATA_EVENT.INSTRUMENT_DETAIL]: (
		[
			reqId,
			{
				summary,
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
			}
		]
	) => ({
		reqId,
		conId: summary.conId,
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
	[MARKETDATA_EVENT.INSTRUMENT_DETAIL_END]: reqIdMappingFunc,

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ae39d414ee5868751ffdd318c4673b63f
	[MARKETDATA_EVENT.RECENT_TRADES]: (
		[
			reqId,
			date,
			open,
			high,
			low,
			close,
			volume,
			WAP,
			count
		]
	) => ({ reqId, date, open, high, low, close, volume, WAP, count }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a790ccbe25033df73996f36a79ce2ce5a
	[ACCOUNT_EVENT.UPDATE_PORTFOLIO]: (
		[
			{ conId, symbol, exchange },
			position,
			marketPrice,
			marketValue,
			averageCost,
			unrealizedPNL,
			realizedPNL,
			accountName
		]
	) => ({
		intent: INTENT.PORTFOLIO,
		conId,
		symbol,
		exchange,
		position,
		marketPrice,
		marketValue,
		averageCost,
		unrealizedPNL,
		realizedPNL,
		accountName
	}),

	// https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a0f2fa798304a0cf101d57453f48c55f0
	[ACCOUNT_EVENT.UPDATE_ACCOUNT_TIMESTAMP]: (
		[
			timestamp
		]
	) => ({ intent: INTENT.PORTFOLIO, timestamp }),

	// https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#ae15a34084d9f26f279abd0bdeab1b9b5
	[ACCOUNT_EVENT.UPDATE_ACCOUNT_VALUE]: (
		[
			key,
			value,
			currency,
			accountName
		]
	) => ({ intent: INTENT.PORTFOLIO, key, value, currency, accountName }),

	// https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a05f35c1d896eeee696487d483110354f
	[ACCOUNT_EVENT.ACCOUNT_DOWNLOAD_END]: (
		[
			account
		]
	) => ({ account, intent: INTENT.PORTFOLIO }),

	[NEWS_EVENT.NEWS_BULLETIN]: (
		[
			msgId,
			msgType,
			message,
			origExchange
		]
	) => ({ msgId, msgType, message, origExchange, intent: INTENT.NEWS_BULLETINS }),

	// https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a95c50b5aa2d2a8ffd8592ccdeb28a6dd
	[NEWS_EVENT.NEWS_PROVIDERS]: entries => ({
		entries: entries.map(([ length, ...providers
		]) =>
			Array.from({ length }, (_, i) => [
				providers[i * 2],
				providers[i * 2 + 1]
			])
		),
		intent: INTENT.NEWS_PROVIDERS
	}),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a4d87a50aa3a688d0e2a48519a369f962
	[NEWS_EVENT.HISTORICAL_NEWS]: (
		[
			reqId,
			time,
			providerCode,
			articleId,
			headline
		]
	) => ({ reqId, time, providerCode, articleId, headline }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a64f8b7ff5e488ab1739323cbe87e1ec3
	[NEWS_EVENT.HISTORICAL_NEWS_END]: (
		[
			reqId,
			hasMore
		]
	) => ({ reqId, hasMore }),

	// ref: https://interactivebrokers.github.io/tws-api/interfaceIBApi_1_1EWrapper.html#a0338a042127bcd160d5f272991ac7e52
	[NEWS_EVENT.NEWS_ARTICLE]: (
		[
			reqId,
			articleType,
			articleText
		]
	) => ({ reqId, articleType, articleText })
}

export const parseMessage = message => {
	assert(message, 'Message is undefined')
	const { event, data } = typeof message === 'string' ? JSON.parse(message) : message

	const func = dataMapperFunc[event]

	if (!func) {
		return { event, data }
	}

	return {
		event,
		data: func(data)
	}
}
