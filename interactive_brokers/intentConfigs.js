import assert from 'assert'
import { GENERIC_TICK, SECURITY_TYPE, ACCOUNT_TAG, DATA_TO_SHOW } from './constants'
import { makeContract } from './utils'

export const defaultIntentConfig = {
	toCommandParams: (...args) => [
		...args
	]
}

export class WatchlistConfig {
	/**
   * Creates an instance of WatchlistConfig.
   * @param {string} exSymbol
   * @param {string} secType
   * @param {string} [genericTickList=GENERIC_TICK.DEFAULT] - comma separated ids of the available generic ticks
   * @param {boolean} [snapshot=false] -  A true value will return a one-time snapshot, while a false value will provide streaming data.
   * @param {boolean} [regulatory=false] - snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription but not corresponding Network A, B, or C subscription necessary for streaming * market data.
   * @memberof WatchlistConfig
   */
	constructor (
		exSymbol,
		secType = SECURITY_TYPE.STOCK,
		genericTickList = GENERIC_TICK.DEFAULT,
		snapshot = false,
		regulatory = false
	) {
		this.exSymbol = exSymbol
		this.secType = secType
		this.genericTickList = genericTickList
		this.snapshot = snapshot
		this.regulatory = regulatory

		assert(exSymbol, 'exSymbol must be defined')
	}

	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this),
			this.genericTickList,
			this.snapshot,
			this.regulatory
		]
	}
}

export class OrderbookConfig {
	/**
   *Creates an instance of OrderbookConfig.
   * @param {string} exSymbol
   * @param {string} secType
   * @param {number} [numRows=1]
   * @memberof OrderbookConfig
   */
	constructor (exSymbol, secType = SECURITY_TYPE.STOCK, numRows = 1) {
		assert(exSymbol, 'exSymbol must be defined')

		this.exSymbol = exSymbol
		this.secType = secType
		this.numRows = numRows
	}

	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this),
			this.numRows
		]
	}
}

export class HistoricalDataConfig {
	/**
	 *Creates an instance of HistoricalDataConfig.
	 * @param {string} exSymbol
	 * @param {string} [secType=SECURITY_TYPE.STOCK]
	 * @param {string} [endDateTime='']
	 * @param {string} [durationString='1D']
	 * @param {string} [barSizeSetting='1 min']
	 * @param {string} [whatToShow='TRADES']
	 * @memberof HistoricalDataConfig
	 */
	constructor (
		exSymbol,
		secType = SECURITY_TYPE.STOCK,
		endDateTime = '',
		durationString = '1 M',
		barSizeSetting = '1 hour',
		whatToShow = DATA_TO_SHOW.MIDPOINT
	) {
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

export class RecentTradesConfig {
	/**
   *Creates an instance of RecentTradesConfig.
   * @param {string} exSymbol
   * @param {string} [secType=SECURITY_TYPE.STOCK]
	 * @param {string} [whatToShow=DATA_TO_SHOW.MIDPOINT]
   * @memberof RecentTradesConfig
   */
	constructor (exSymbol, secType = SECURITY_TYPE.STOCK, whatToShow = DATA_TO_SHOW.MIDPOINT) {
		assert(exSymbol, 'exSymbol must be defined')

		this.exSymbol = exSymbol
		this.secType = secType
		this.barSize = 5
		this.whatToShow = whatToShow
		this.useRTH = true
	}

	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this),
			this.barSize,
			this.whatToShow,
			this.useRTH
		]
	}
}

export class InstrumentDetailConfig {
	/**
   *Creates an instance of InstrumentDetailConfig.
   * @param {string} exSymbol
   * @param {string} secType
   * @memberof InstrumentDetailConfig
   */
	constructor (exSymbol, secType = SECURITY_TYPE.STOCK) {
		assert(exSymbol, 'exSymbol must be defined')

		this.exSymbol = exSymbol
		this.secType = secType
	}

	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this)
		]
	}
}

export class AccountSummaryConfig {
	/**
	 *Creates an instance of AccountSummaryConfig.
	 * @param {string} [group='All']
	 * @param {string [tag='All']
	 * @memberof AccountSummaryConfig
	 */
	constructor (group = 'All', tags = Object.values(ACCOUNT_TAG).join(',')) {
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

export class PortfolioConfig {
	/**
	 *Creates an instance of PortfolioConfig.
	 * @param {string} account
	 * @memberof PortfolioConfig
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
