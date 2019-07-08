import assert from 'assert'
import { makeContract } from '../utils'
export default class {
	/**
	 *Creates an instance of HistoricalDataConfig.
	 * @param {string} exSymbol
	 * @param {string} secType
	 * @param {string} endDateTime
	 * @param {string} durationString
	 * @param {string} barSizeSetting
	 * @param {string} whatToShow
	 */
	constructor (exSymbol, secType, endDateTime, durationString, barSizeSetting, whatToShow) {
		assert(exSymbol, 'exSymbol must be defined')
		this.exSymbol = exSymbol
		this.secType = secType
		this.endDateTime = endDateTime
		this.durationString = durationString
		this.barSizeSetting = barSizeSetting
		this.whatToShow = whatToShow
		this.useRTH = 1
		this.formatDate = 2
		this.keepUpToDate = false
	}
	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this),
			this.endDateTime,
			this.durationString,
			this.barSizeSetting,
			this.whatToShow,
			this.useRTH,
			this.formatDate,
			this.keepUpToDate
		]
	}
}
