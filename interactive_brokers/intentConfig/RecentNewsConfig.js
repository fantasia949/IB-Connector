import assert from 'assert'
import { GENERIC_TICK } from '../constants'
import MarketDataConfig from './MarketDataConfig'

export default class RecentNewsConfig extends MarketDataConfig {
	/**
   * Creates an instance of RecentNewsConfig.
   * @param {string} exSymbol
   * @param {string} providerCode
   */
	constructor (exSymbol, providerCode) {
		assert(providerCode, 'providerCode is required')
		super(exSymbol, `mdoff,${GENERIC_TICK.NEWS}:${providerCode}`, false, false)
	}
}
