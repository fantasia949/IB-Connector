import assert from 'assert'
import { GENERIC_TICK, SECURITY_TYPE, ACCOUNT_TAG } from './constants'
import { makeContract, makeOrder } from './utils'

export const intentConfig = {
	toCommandParams: () => []
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

export class RecentTradesConfig {
	/**
   *Creates an instance of RecentTradesConfig.
   * @param {string} exSymbol
   * @param {string} [secType=SECURITY_TYPE.STOCK]
   * @memberof RecentTradesConfig
   */
	constructor (exSymbol, secType = SECURITY_TYPE.STOCK) {
		assert(exSymbol, 'exSymbol must be defined')

		this.exSymbol = exSymbol
		this.secType = secType
		this.endDateTime = ''
		this.durationString = '1 D'
		this.barSizeSetting = '1 min'
		this.whatToShow = 'TRADES'
		this.useRTH = 1
		this.formatDate = 1
		this.keepUpToDate = true
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
