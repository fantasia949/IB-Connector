import assert from 'assert'
import { makeContract } from '../utils'
export default class RealtimeBarConfig {
	/**
 *Creates an instance of RealtimeBarConfig.
 * @param {string} exSymbol
 * @param {string} secType
	 @param {string} whatToShow
 */
	constructor (exSymbol, secType, whatToShow) {
		assert(exSymbol, 'exSymbol must be defined')
		this.exSymbol = exSymbol
		this.secType = secType
		this.barSize = 5
		this.whatToShow = whatToShow
		this.useRTH = true
	}
	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this),
			this.barSize,
			this.whatToShow,
			this.useRTH
		]
	}
}
