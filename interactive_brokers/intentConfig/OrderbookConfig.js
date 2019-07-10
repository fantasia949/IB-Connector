import assert from 'assert'
import { SECURITY_TYPE } from '../constants'
import { makeContract } from '../utils'

export default class OrderbookConfig {
	/**
 *Creates an instance of OrderbookConfig.
 * @param {string} exSymbol
 * @param {string} secType
 * @param {number} [numRows=1]
 */
	constructor (exSymbol, secType = SECURITY_TYPE.STOCK, numRows = 1) {
		assert(exSymbol, 'exSymbol must be defined')
		this.exSymbol = exSymbol
		this.secType = secType
		this.numRows = numRows
	}
	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this),
			this.numRows
		]
	}
}
