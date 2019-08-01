import { MARKET_DATA_TYPE, SERVER_LOG_LEVEL, RIGHT_TYPE } from './interactive_brokers/constants'
import IbConnector from './interactive_brokers'
import { EVENT } from './interactive_brokers/constants'
import { exchangeUtils, defer, orderUtils } from './interactive_brokers/utils'

describe('test utils', () => {
	test('transmit should be true by default', () => {
		expect(orderUtils.limit(1, 2, 3).transmit).toBeTruthy()
	})

	test('outsideRth should be true when the order is wrapped by orderUtils.allowOutsideRth()', () => {
		expect(orderUtils.allowOutsideRth(orderUtils.limit(1, 2, 3)).outsideRth).toBeTruthy()
	})
})

describe('test IB connector direct call', () => {
	const connectorConfig = {
		username: 'hxvn0001',
		password: 'Hydra2019',
		serverLogLevel: SERVER_LOG_LEVEL.DETAIL,
		// free user must set market data subscription to DELAYED in order to get market data
		marketDataType: MARKET_DATA_TYPE.DELAYED,
		isMaster: 0,
		endpoint: 'ws://127.0.0.1:3000'
	}

	const ib = new IbConnector(connectorConfig)
	ib.on(EVENT.ERROR, (uuid, err) => console.log(uuid, err))
	ib.on(EVENT.COMMAND_SEND, message => console.log(JSON.stringify(message)))

	const facebookSymbol = 'fb'

	beforeAll(async () => {
		await ib.connect({ uuid: 'fb' })
		await defer(300)
	})

	test('connected should be true', async () => {
		expect(ib.connected).toBeTruthy()
	})

	test('getMatchingSymbols should have result', async () => {
		const entry = await ib.getMatchingSymbols(facebookSymbol)
		expect(entry).toHaveLength(17)
	})

	test('getNewsArticle should have result', async () => {
		const entry = await ib.getNewsArticle('BRFG', 'BRFG$0af99099')
		expect(entry).toBeDefined()
	})

	test('getNewsProviders should have result', async () => {
		const entry = await ib.getNewsProviders()
		expect(entry).toHaveLength(4)
	})

	test('getInstrumentFundamental should have result', async () => {
		const entry = await ib.getInstrumentFundamental(facebookSymbol)
		expect(entry.data).toBeDefined()
	})

	test(
		'getMarketdataSnapshot should have result',
		async () => {
			const entry = await ib.getMarketdataSnapshot(facebookSymbol)
			expect(entry).toBeDefined()
		},
		13 * 1000
	)

	test('getInstrumentDetails should have result', async () => {
		const entry = await ib.getInstrumentDetails(facebookSymbol)
		expect(entry).toHaveLength(1)
	})

	test("getInstrumentDetails using factory's contract.stock should have result", async () => {
		const entry = await ib.getInstrumentDetails(exchangeUtils.stock(facebookSymbol))
		expect(entry).toHaveLength(1)
	})

	test("getInstrumentDetails using factory's contract.forex should have result", async () => {
		const entry = await ib.getInstrumentDetails(exchangeUtils.forex('eur/usd'))
		expect(entry).toHaveLength(1)
	})

	test("getInstrumentDetails using factory's contract.index should have result", async () => {
		const entry = await ib.getInstrumentDetails(exchangeUtils.index('vix'))
		expect(entry).toHaveLength(1)
	})

	test("getInstrumentDetails using factory's contract.future should have result", async () => {
		const entry = await ib.getInstrumentDetails(exchangeUtils.future('globex:es', '20200918'))
		expect(entry).toHaveLength(1)
	})

	test("getInstrumentDetails using factory's contract.commodity should have result", async () => {
		const entry = await ib.getInstrumentDetails(exchangeUtils.commodity('XAUUSD'))
		expect(entry).toHaveLength(1)
	})

	test("getInstrumentDetails using factory's contract.option should have result", async () => {
		const entry = await ib.getInstrumentDetails(exchangeUtils.option(facebookSymbol, RIGHT_TYPE.CALL, '20190830', 150))
		expect(entry).toHaveLength(1)
	})

	test("getInstrumentDetails using factory's contract.futureOption should have result", async () => {
		const entry = await ib.getInstrumentDetails(exchangeUtils.futureOption('es', RIGHT_TYPE.PUT, '20200320', 1600))
		expect(entry).toHaveLength(1)
	})

	test('getSupportedExchanges should have result', async () => {
		const entry = await ib.getSupportedExchanges()
		expect(entry.length > 0).toBeTruthy()
	})

	test('getAccountBalance should have result', async () => {
		const entry = await ib.getAccountBalance()
		expect(entry).toBeDefined()
	})

	afterAll(() => ib.disconnect())
})
