import assert from 'assert'
import { makeContract } from '../utils'

export default class MarketDataConfig {
	/**
   * Creates an instance of MarketDataConfig.
   * @param {string} exSymbol
   * @param {string} genericTickList - comma separated ids of the available generic ticks
   * @param {boolean} snapshot -  A true value will return a one-time snapshot, while a false value will provide streaming data.
   * @param {boolean} regulatory - snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription but not corresponding Network A, B, or C subscription necessary for streaming * market data.
   */
	constructor (exSymbol, genericTickList, snapshot, regulatory) {
		assert(exSymbol, 'exSymbol is required')
		
		this.exSymbol = exSymbol
		this.genericTickList = genericTickList
		this.snapshot = snapshot
		this.regulatory = regulatory

	}

	toCommandParams (reqId) {
		return [
			reqId,
			makeContract(this.exSymbol),
			this.genericTickList,
			this.snapshot,
			this.regulatory
		]
	}
}
