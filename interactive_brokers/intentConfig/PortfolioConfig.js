export default class {
	/**
	 *Creates an instance of PortfolioConfig.
	 * @param {string} account
	 */
	constructor (account) {
		this.account = account
	}
	toCommandParams (subscribe) {
		return [
			subscribe,
			this.account
		]
	}
}
