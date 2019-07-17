import assert from 'assert'
import { SCANNER_SUBSCRIPTION_FILTER, SCANNER_SUBSCRIPTION_FILTERS } from '../constants'

export default class ScannerSubscriptionConfig {
	/**
	 *Creates an instance of ScannerSubscriptionConfig.
	 * @param {Object} filters - each filter criteria is defined in SCANNER_SUBSCRIPTION_FILTER
	 */
	constructor (filters) {
		assert(filters, 'filter is required')
		assert(!Object.keys(filters).some(key => !SCANNER_SUBSCRIPTION_FILTERS.includes(key)), 'Some filters are invalid')
		assert(filters[SCANNER_SUBSCRIPTION_FILTER.NUMBER_OF_ROWS], 'NumberOfRows is required')
		assert(filters[SCANNER_SUBSCRIPTION_FILTER.SCAN_CODE], 'ScanCode is required')
		this.filters = filters
	}
	toCommandParams (reqId) {
		return [
			reqId,
			this.filters
		]
	}
}
