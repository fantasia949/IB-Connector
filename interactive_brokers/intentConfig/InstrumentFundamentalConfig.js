import assert from 'assert'
import { makeContract } from '../utils'
export default class InstrumentFundamentalConfig {
	/**
 *Creates an instance of InstrumentFundamentalConfig.
 * @param {string} exSymbol
 * @param {FUNDAMENTAL_REPORT_TYPE} reportType
 */
	constructor (exSymbol, reportType) {
    assert(exSymbol, 'exSymbol is required')
    assert(reportType, 'reportType is required')
		this.exSymbol = exSymbol
		this.reportType = reportType
	}
	toCommandParams (reqId) {
		return [
			reqId,
      makeContract(this.exSymbol),
      this.reportType
		]
	}
}
