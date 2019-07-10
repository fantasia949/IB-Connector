import assert from 'assert'
import { makeContract } from '../utils'
import { GENERIC_TICK } from '../constants'

export default class RecentNewsConfig{
	/**
   * Creates an instance of RecentNewsConfig.
   * @param {string} exSymbol
   * @param {string} secType
   * @param {string} providerCode
   */
	constructor (exSymbol, secType, providerCode) {
		assert(exSymbol, 'exSymbol must be defined')
		assert(providerCode, 'providerCode must be defined')

		this.exSymbol = exSymbol
		this.secType = secType
		this.genericTickList = `mdoff,${GENERIC_TICK.NEWS}:${providerCode}`
	}

	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this),
			this.genericTickList,
			false,
			false
		]
	}
}
