import assert from 'assert'
import { GENERIC_TICK } from '../constants'
import MarketDataConfig from './MarketDataConfig'

export default class RecentNewsConfig extends MarketDataConfig {
	/**
   * Creates an instance of RecentNewsConfig.
   * @param {string} exSymbol
   * @param {string} secType
   * @param {string} providerCode
   */
	constructor (exSymbol, secType, providerCode) {
		assert(providerCode, 'providerCode must be defined')
		super(exSymbol, secType, `mdoff,${GENERIC_TICK.NEWS}:${providerCode}`, false, false)
	}
}
