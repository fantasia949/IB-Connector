import { GENERIC_TICK } from '../constants'
import MarketDataConfig from './MarketDataConfig'

export default class RecentTradesConfig extends MarketDataConfig {
	/**
 *Creates an instance of RecentTradesConfig.
 * @param {string} exSymbol
 */
	constructor (exSymbol) {
		super(exSymbol, [ 'mdoff', GENERIC_TICK.RT_VOLUME, GENERIC_TICK.RT_TRADE_VOLUME ].join(','), false, false)
	}
}
