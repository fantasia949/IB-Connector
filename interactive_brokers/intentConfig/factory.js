import * as configs from './'
import { ACCOUNT_TAG, SECURITY_TYPE, DATA_TO_SHOW, GENERIC_TICK, FUNDAMENTAL_REPORT_TYPE } from '../constants'

const _defaultIntentConfig = {
	toCommandParams: (...args) => [
		...args
	]
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
* @param {string} exSymbol
* @param {string} [secType=SECURITY_TYPE.STOCK]
* @param {string} [endDateTime='']
* @param {string} [durationString='1D']
* @param {string} [barSizeSetting='1 min']
* @param {string} [whatToShow='TRADES']
*/
export const historicalDataConfig = (
	exSymbol,
	secType = SECURITY_TYPE.STOCK,
	endDateTime = '',
	durationString = '1 M',
	barSizeSetting = '1 hour',
	whatToShow = DATA_TO_SHOW.MIDPOINT
) => new configs.HistoricalDataConfig(exSymbol, secType, endDateTime, durationString, barSizeSetting, whatToShow)

/**
* Creates an instance of RecentTradesConfig.
* @param {string} exSymbol
* @param {string} [secType=SECURITY_TYPE.STOCK]
* @param {string} [whatToShow=DATA_TO_SHOW.MIDPOINT]
*/
export const recentTradesConfig = (exSymbol, secType = SECURITY_TYPE.STOCK, whatToShow = DATA_TO_SHOW.MIDPOINT) =>
	new configs.RecentTradesConfig(exSymbol, secType, whatToShow)

/**
 * Creates an instance of InstrumentDetailConfig.
 * @param {string} exSymbol 
 * @param {string} [secType=SECURITY_TYPE.STOCK]
 */
export const instrumentDetailsConfig = (exSymbol, secType = SECURITY_TYPE.STOCK) =>
	new configs.InstrumentDetailsConfig(exSymbol, secType)

/**
 * Creates an instance of InstrumentFundamentalConfig.
 * @param {string} exSymbol 
 * @param {string} [secType=SECURITY_TYPE.STOCK]
 * @param {FUNDAMENTAL_REPORT_TYPE} [reportType=FUNDAMENTAL_REPORT_TYPE.COMPANY_OVERVIEW]
 */
export const instrumentFundamentalConfig = (
	exSymbol,
	secType = SECURITY_TYPE.STOCK,
	reportType = FUNDAMENTAL_REPORT_TYPE.COMPANY_OVERVIEW
) => new configs.InstrumentFundamentalConfig(exSymbol, secType, reportType)

/**
 *Creates an instance of OrderbookConfig.
 * @param {string} exSymbol
 * @param {string} [secType=SECURITY_TYPE.STOCK]
 * @param {number} [numRows=1]
 */
export const orderbookConfig = (exSymbol, secType = SECURITY_TYPE.STOCK, numRows = 1) =>
	new configs.OrderbookConfig(exSymbol, secType, numRows)

/**
 * Creates an instance of MarketDataConfig.
 * @param {string} exSymbol
 * @param {string} [secType=SECURITY_TYPE.STOCK]
 * @param {string} [genericTickList=GENERIC_TICK.DEFAULT] - comma separated ids of the available generic ticks
 * @param {boolean} [snapshot=false] -  A true value will return a one-time snapshot, while a false value will provide streaming data.
 * @param {boolean} [regulatory=false] - snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription but not corresponding Network A, B, or C subscription necessary for streaming * market data.
 */
export const marketDataConfig = (
	exSymbol,
	secType = SECURITY_TYPE.STOCK,
	genericTickList = GENERIC_TICK.DEFAULT,
	snapshot = false,
	regulatory = false
) => new configs.MarketDataConfig(exSymbol, secType, genericTickList, snapshot, regulatory)

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
 * @param {string} exSymbol
 * @param {string} [secType=SECURITY_TYPE.STOCK]
 * @param {string} providerCode
 */
export const recentNewsConfig = (exSymbol, secType = SECURITY_TYPE.STOCK, providerCode) =>
	new configs.RecentNewsConfig(exSymbol, secType, providerCode)

export const matchingSymbolsConfig = pattern => new configs.MatchingSymbolsConfig(pattern)

export const defaultIntentConfig = () => _defaultIntentConfig
