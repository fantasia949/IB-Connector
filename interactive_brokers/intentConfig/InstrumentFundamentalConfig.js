import assert from 'assert'
import { makeContract } from '../utils'
export default class InstrumentFundamentalConfig {
	/**
 *Creates an instance of InstrumentFundamentalConfig.
 * @param {string} exSymbol
 * @param {string} secType
 * @param {FUNDAMENTAL_REPORT_TYPE} reportType
 */
	constructor (exSymbol, secType, reportType) {
    assert(exSymbol, 'exSymbol must be defined')
    assert(reportType, 'reportType must be defined')
		this.exSymbol = exSymbol
		this.secType = secType
		this.reportType = reportType
	}
	toCommandParams (reqId) {
		return [
			reqId,
      makeContract(this),
      this.reportType
		]
	}
}
