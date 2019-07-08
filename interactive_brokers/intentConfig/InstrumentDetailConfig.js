import assert from 'assert'
import { makeContract } from '../utils'
export default class {
	/**
 *Creates an instance of InstrumentDetailConfig.
 * @param {string} exSymbol
 * @param {string} secType
 */
	constructor (exSymbol, secType) {
		assert(exSymbol, 'exSymbol must be defined')
		this.exSymbol = exSymbol
		this.secType = secType
	}
	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this)
		]
	}
}
