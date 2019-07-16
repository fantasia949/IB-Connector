import assert from 'assert'
import { makeContract } from '../utils'
export default class RealtimeBarConfig {
	/**
 *Creates an instance of RealtimeBarConfig.
 * @param {string} exSymbol
	 @param {string} whatToShow
 */
	constructor (exSymbol, whatToShow) {
		assert(exSymbol, 'exSymbol is required')
		this.exSymbol = exSymbol
		this.barSize = 5
		this.whatToShow = whatToShow
		this.useRTH = true
	}
	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this.exSymbol),
			this.barSize,
			this.whatToShow,
			this.useRTH
		]
	}
}
