import assert from 'assert'
import { makeContract } from '../utils'
export default class InstrumentDetailsConfig {
	/**
 *Creates an instance of InstrumentDetailConfig.
 * @param {string} exSymbol
 */
	constructor (exSymbol) {
		assert(exSymbol, 'exSymbol is required')
		this.exSymbol = exSymbol
	}
	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this.exSymbol)
		]
	}
}
