import assert from 'assert'
export default class NewsArticleConfig {
	/**
	 *Creates an instance of NewsArticleConfig.
	 * @param {string} providerCode
	 * @param {string} articleId
	 */
	constructor (providerCode, articleId) {
		assert(articleId, 'articleId must be defined')
		assert(providerCode, 'providerCodes must be defined')
		this.providerCode = providerCode
		this.articleId = articleId
	}

	toCommandParams (reqId) {
		return [
			reqId,
			this.providerCode,
			this.articleId
		]
	}
}
