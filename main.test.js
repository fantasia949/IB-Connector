import { initIb } from './main'

const ib = initIb()

const facebookConId = 107113386
const facebookSymbol = 'fb'

describe('test IB connector\'s direct call', () => {
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
  
  test('getMarketdataSnapshot should have result', async () => {
		const entry = await ib.getMarketdataSnapshot(facebookSymbol)
		expect(entry).toBeDefined()
  }, 13 * 1000)

	afterAll(() => {
		ib.disconnect()
	})
})
