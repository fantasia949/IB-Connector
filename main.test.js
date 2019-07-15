import { MARKET_DATA_TYPE, SERVER_LOG_LEVEL } from './interactive_brokers/constants'
import IbConnector from './interactive_brokers'

const connectorConfig = {
	username: 'hxvn0001',
	password: 'Hydra2019',
	serverLogLevel: SERVER_LOG_LEVEL.DETAIL,
	// free user must set market data subscription to DELAYED in order to get market data
	marketDataType: MARKET_DATA_TYPE.DELAYED
}

const ib = new IbConnector(connectorConfig)

const facebookConId = 107113386
const facebookSymbol = 'fb'

describe("test IB connector's direct call", () => {
	beforeAll(async done => {
		await ib.connect({ uuid: 'fb' })
		done()
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

	test('getInstrumentDetails should have result', async () => {
		const entry = await ib.getInstrumentDetails(facebookSymbol)
		expect(entry).toHaveLength(1)
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

	afterAll(() => {
		ib.disconnect()
	})
})
