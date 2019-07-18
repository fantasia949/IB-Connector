import * as configs from './'
import { ACCOUNT_TAG, DATA_TO_SHOW, GENERIC_TICK, FUNDAMENTAL_REPORT_TYPE } from '../constants'

const _defaultIntentConfig = {
	toCommandParams: (...args) => [ ...args ]
}

/**
* Creates an instance of AccountSummaryConfig.
* @param {string} [group='All']
* @param {string} [tags= 'All']
*/
export const accountSummaryConfig = (group = 'All', tags = Object.values(ACCOUNT_TAG).join(',')) =>
	new configs.AccountSummaryConfig(group, tags)

/**
* Creates an instance of HistoricalDataConfig.
* @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]"
* @param {string} [endDateTime='']
* @param {string} [durationString='1D']
* @param {string} [barSizeSetting='1 min']
* @param {string} [whatToShow='TRADES']
*/
export const historicalDataConfig = (
	exSymbol,
	endDateTime = '',
	durationString = '1 M',
	barSizeSetting = '1 hour',
	whatToShow = DATA_TO_SHOW.MIDPOINT
) => new configs.HistoricalDataConfig(exSymbol, endDateTime, durationString, barSizeSetting, whatToShow)

/**
* Creates an instance of RealtimeBarConfig.
* @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]"
* @param {string} [whatToShow=DATA_TO_SHOW.MIDPOINT]
*/
export const realtimeBarConfig = (exSymbol, whatToShow = DATA_TO_SHOW.MIDPOINT) =>
	new configs.RealtimeBarConfig(exSymbol, whatToShow)

/**
* Creates an instance of RecentTradesConfig.
* @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]"
*/
export const recentTradesConfig = exSymbol => new configs.RecentTradesConfig(exSymbol)

/**
 * Creates an instance of InstrumentDetailConfig.
 * @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]" 
 */
export const instrumentDetailsConfig = exSymbol => new configs.InstrumentDetailsConfig(exSymbol)

/**
 * Creates an instance of InstrumentFundamentalConfig.
 * @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]" 
 * @param {FUNDAMENTAL_REPORT_TYPE} [reportType=FUNDAMENTAL_REPORT_TYPE.COMPANY_OVERVIEW]
 */
export const instrumentFundamentalConfig = (exSymbol, reportType = FUNDAMENTAL_REPORT_TYPE.COMPANY_OVERVIEW) =>
	new configs.InstrumentFundamentalConfig(exSymbol, reportType)

/**
 *Creates an instance of OrderbookConfig.
 * @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]"
 * @param {number} [numRows=1]
 */
export const orderbookConfig = (exSymbol, numRows = 1) => new configs.OrderbookConfig(exSymbol, numRows)

/**
 * Creates an instance of MarketDataConfig.
 * @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]"
 * @param {string} [genericTickList=GENERIC_TICK.DEFAULT] - comma separated ids of the available generic ticks
 * @param {boolean} [snapshot=false] -  A true value will return a one-time snapshot, while a false value will provide streaming data.
 * @param {boolean} [regulatory=false] - snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription but not corresponding Network A, B, or C subscription necessary for streaming * market data.
 */
export const marketDataConfig = (exSymbol, genericTickList = GENERIC_TICK.DEFAULT, snapshot = false, regulatory = false) =>
	new configs.MarketDataConfig(exSymbol, genericTickList, snapshot, regulatory)

/**
 * Creates an instance of PortfolioConfig.
* @param {string} account
*/
export const portfolioConfig = account => new configs.PortfolioConfig(account)

/**
 *
 * Creates an instance of HistoricalNews.
 * @param {number} conId
 * @param {string[]} providerCodes
 * @param {string} [startDateTime='']
 * @param {string} [endDateTime='']
 * @param {number} [totalResults=10]
 */
export const historicalNewsConfig = (conId, providerCodes, startDateTime = '', endDateTime = '', totalResults = 10) =>
	new configs.HistoricalNewsConfig(conId, providerCodes, startDateTime, endDateTime, totalResults)

/**
 *
 * Creates an instance of NewsArticleConfig.
 * @param {string} providerCode
 * @param {string} articleId
 */
export const newsArticleConfig = (providerCode, articleId) => new configs.NewsArticleConfig(providerCode, articleId)

/**
 *
 * Creates an instance of RecentNewsConfig.
 * @param {string} exSymbol - has this format "[secType=stk]&#64;[exchange=smart]:[symbol]/[currency=usd]"
 * @param {string} providerCode
 */
export const recentNewsConfig = (exSymbol, providerCode) => new configs.RecentNewsConfig(exSymbol, providerCode)

/**
 *
 * Creates an instance of MatchingSymbolsConfig.
 * @param {string} pattern
 */
export const matchingSymbolsConfig = pattern => new configs.MatchingSymbolsConfig(pattern)

/**
 *
 * Creates an instance of ScannerSubscriptionConfig.
 * @param {Object} filters
 */
export const scannerSubscriptionConfig = filters => new configs.ScannerSubscriptionConfig(filters)

export const defaultIntentConfig = () => _defaultIntentConfig