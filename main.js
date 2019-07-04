import lmaxlondon_connector from './lmaxlondon'
import hitbtc_connector from './hitbtc'
import IbConnector from './interactive_brokers'
import { MARKET_DATA_TYPE, INTENT, EVENT, SECURITY_TYPE, ORDER_TYPE, ORDERBOOK_OPERATION } from './interactive_brokers/constants'

// let lmaxlondon = new lmaxlondon_connector();
// let hitbtc = new hitbtc_connector()
;(async () => {
	const credentials = {
		username: 'hxvn0002',
		password: 'Hydra2019'
	}

	const uuid = '<ib>'

	const symbolConfig = {
		marketDataType: MARKET_DATA_TYPE.DELAYED
	}
	const facebookSymbol = 'fb'

	const ib = new IbConnector(credentials)

	ib.on(EVENT.ERROR, (uuid, err) => console.log(uuid, err))
	ib.on(EVENT.CLOSE, uuid => console.log(uuid, 'disconnected'))
	ib.on(EVENT.COMMAND_SEND, message => console.log(JSON.stringify(message)))
	// ib.on(EVENT.DATA, (uuid, data, event) => console.log(uuid, 'global', data, event))

	// Test watchlist
	const watchlist = { bid: '-', ask: '-', last: '-', lastTraded: '-', volume: '-', close: '-', open: '-' }

	let watchlistTimeoutId = undefined
	ib.subscribe(INTENT.WATCHLIST, uuid, facebookSymbol, symbolConfig, (_, data) => {
		Object.keys(watchlist).filter(field => data[field] !== undefined).forEach(field => (watchlist[field] = data[field]))

		clearTimeout(watchlistTimeoutId)
		watchlistTimeoutId = setTimeout(() => console.log(watchlist), 300)
	})

	// Test Orderbook
	// const orderbookEntry = { price: '-', size: '-' }
	// const orderbook = Array.from({ length: 2 }).fill([
	// 	{ ...orderbookEntry },
	// 	{ ...orderbookEntry }
	// ])
	// let orderbookTimeoutId = undefined
	// ib.subscribe(
	// 	INTENT.ORDERBOOK,
	// 	uuid,
	// 	'eur/usd',
	// 	{
	// 		secType: SECURITY_TYPE.FOREX,
	// 		numRows: 2
	// 	},
	// 	(_, { position, operation, side, price, size }) => {
	// 		switch (operation) {
	// 			case ORDERBOOK_OPERATION.INSERT:
	// 				orderbook[position][side] = { price, size }
	// 				break
	// 			case ORDERBOOK_OPERATION.UPDATE:
	// 				Object.assign(orderbook[position][side], JSON.parse(JSON.stringify({ price, size })))
	// 				break
	// 			case ORDERBOOK_OPERATION.DELETE:
	// 				orderbook[position][side] = { ...orderbookEntry }
	// 				break
	// 		}

	// 		clearTimeout(orderbookTimeoutId)
	// 		orderbookTimeoutId = setTimeout(() => console.log(orderbook), 300)
	// 	}
	// )

	// Test trade - require historical data access
	// ib.subscribe(INTENT.RECENT_TRADES, uuid, facebookSymbol, {}, (uuid, data, event) => console.log(uuid, facebookSymbol, data, event))
	// ib.subscribe(INTENT.POSITIONS, uuid, undefined, undefined, (uuid, data, event) => console.log(uuid, data, event))
	// ib.subscribe(INTENT.OPEN_ORDERS, uuid, undefined, undefined, (uuid, data, event) => console.log(uuid, data, event))

	// test order
	// await ib.connect({ uuid })
	// const orderId = await ib.placeOrder(facebookSymbol, ORDER_TYPE.LIMIT, 1000, { price: 13 })
	// ib.cancelOrder(orderId)

	setTimeout(() => ib.unsubscribe(), 40 * 1000)
})()

//lmaxlondon.subscribe('watchlist', 'socket_id', 'lmaxlondon:eur/usd');
//hitbtc.subscribe('watchlist', 'socket','hitbtc:ltc/btc')
