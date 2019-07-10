import assert from 'assert'
export default class HistoricalNewsConfig {
	constructor (conId, providerCodes, startDateTime, endDateTime, totalResults) {
		assert(conId, 'conId must be defined')
		assert(providerCodes, 'providerCodes must be defined')

		this.conId = conId
		this.providerCodes = providerCodes.join('+')
		this.startDateTime = startDateTime
		this.endDateTime = endDateTime
		this.totalResults = totalResults
	}
	toCommandParams (reqId) {
		return [
			reqId,
			this.conId,
			this.providerCodes,
			this.startDateTime,
			this.endDateTime,
			this.totalResults
		]
	}
}
