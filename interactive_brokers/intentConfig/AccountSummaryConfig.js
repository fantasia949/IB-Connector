export default class AccountSummaryConfig {
	/**
	 *Creates an instance of AccountSummaryConfig.
	 * @param {string} group
	 * @param {string} tags
	 */
	constructor (group, tags) {
		this.tags = tags
		this.group = group
	}
	toCommandParams (reqId) {
		return [
			reqId,
			this.group,
			this.tags
		]
	}
}
