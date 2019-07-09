import assert from 'assert'
export default class {
	/**
	 *Creates an instance of MatchingSymbolsConfig.
	 * @param {string} pattern
	 */
	constructor (pattern) {
		assert(pattern && pattern.length, 'pattern must be non-empty string')
		this.pattern = pattern
	}

	toCommandParams (reqId) {
		return [
			reqId,
			this.pattern
		]
	}
}
