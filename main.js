import lmaxlondon_connector from './lmaxlondon'
import hitbtc_connector from './hitbtc'
import IbConnector from './interactive_brokers'
import { MARKET_DATA_TYPE, INTENT, EVENT, SECURITY_TYPE, ORDER_TYPE } from './interactive_brokers/constants'

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

	const symbolConfig2 = {
		secType: SECURITY_TYPE.FOREX
	}

	const eurToUsdSymbol = 'eur/usd'

	const ib = new IbConnector(credentials)

	ib.on(EVENT.ERROR, (uuid, err) => console.log(uuid, err))
	ib.on(EVENT.CLOSE, uuid => console.log(uuid, 'disconnected'))
	ib.on(EVENT.DATA, (uuid, data, event) => console.log(uuid, 'global', data, event))

	ib.subscribe(INTENT.WATCHLIST, uuid, facebookSymbol, symbolConfig, (uuid, data, event) => console.log(uuid, facebookSymbol, data, event))
	// ib.subscribe(INTENT.ORDERBOOK, uuid, eurToUsdSymbol, symbolConfig2, (uuid, data, event) => console.log(uuid, eurToUsdSymbol, data, event))
	// ib.subscribe(INTENT.RECENT_TRADES, uuid, facebookSymbol, {}, (uuid, data, event) => console.log(uuid, facebookSymbol, data, event))
	// ib.subscribe(INTENT.POSITIONS, uuid, undefined, undefined, (uuid, data, event) => console.log(uuid, data, event))
	// ib.subscribe(INTENT.OPEN_ORDERS, uuid, undefined, undefined, (uuid, data, event) => console.log(uuid, data, event))

	// test order
	// await ib.connect({ uuid })
	// const orderId = await ib.placeOrder(facebookSymbol, ORDER_TYPE.LIMIT, 1000, { price: 13 })
	// ib.cancelOrder(orderId)

	setTimeout(() => ib.unsubscribe(), 20 * 1000)
})()

//lmaxlondon.subscribe('watchlist', 'socket_id', 'lmaxlondon:eur/usd');
//hitbtc.subscribe('watchlist', 'socket','hitbtc:ltc/btc')
