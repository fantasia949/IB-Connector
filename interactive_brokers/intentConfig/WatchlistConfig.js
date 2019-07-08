import assert from 'assert'
import { GENERIC_TICK, SECURITY_TYPE } from '../constants'
import { makeContract } from '../utils'

export default class {
	/**
   * Creates an instance of WatchlistConfig.
   * @param {string} exSymbol
   * @param {string} secType
   * @param {string} genericTickList - comma separated ids of the available generic ticks
   * @param {boolean} snapshot -  A true value will return a one-time snapshot, while a false value will provide streaming data.
   * @param {boolean} regulatory - snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription but not corresponding Network A, B, or C subscription necessary for streaming * market data.
   */
	constructor (exSymbol, secType, genericTickList, snapshot, regulatory) {
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
