import assert from 'assert'
import { makeContract } from '../utils'

export default class OrderbookConfig {
	/**
 *Creates an instance of OrderbookConfig.
 * @param {string} exSymbol
 * @param {number} [numRows=1]
 */
	constructor (exSymbol, numRows = 1) {
		assert(exSymbol, 'exSymbol is required')
		this.exSymbol = exSymbol
		this.numRows = numRows
	}
	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this.exSymbol),
			this.numRows
		]
	}
}
