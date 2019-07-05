// ref: http://interactivebrokers.github.io/tws-api/market_data_type.html
export const MARKET_DATA_TYPE = {
	LIVE: 1,
	FROZEN: 2,
	DELAYED: 3,
	DELAYED_FROZEN: 4
}

export const MARKETDATA_EVENT = {
	TICK_SIZE: 'tickSize',
	TICK_PRICE: 'tickPrice',
	TICK_STRING: 'tickString',
	ORDERBOOK: 'updateMktDepth',
	HISTORICAL_DATA: 'historicalData',
	HISTORICAL_DATA_UPDATE: 'historicalDataUpdate',
	HISTORICAL_DATA_END: 'historicalDataEnd',
	INSTRUMENT_DETAIL: 'contractDetails',
	INSTRUMENT_DETAIL_END: 'contractDetailsEnd',
	RECENT_TRADES: 'realtimeBar'
}
export const TRADE_EVENT = {
	ORDER_OPEN: 'openOrder',
	ORDER_OPEN_END: 'openOrderEnd',
	ORDER_STATUS: 'orderStatus',
	POSITION: 'position',
	POSITION_END: 'positionEnd',
	NEXT_ORDER_ID: 'nextValidId'
}

export const ACCOUNT_EVENT = {
	ACCOUNT_SUMMARY: 'accountSummary',
	ACCOUNT_SUMMARY_END: 'accountSummaryEnd',
	UPDATE_ACCOUNT_TIMESTAMP: 'updateAccountTime',
	UPDATE_ACCOUNT_VALUE: 'updateAccountValue',
	UPDATE_PORTFOLIO: 'updatePortfolio',
	ACCOUNT_DOWNLOAD_END: 'accountDownloadEnd'
}

export const EVENT = {
	OPEN: 'open',
	CLOSE: 'close',
	ERROR: 'error',
	MESSAGE: 'message',
	DATA: 'data',
	READY: 'managedAccounts',
	COMMAND_SEND: 'command'
}

export const INTENT = {
	RECENT_TRADES: 'recent_trades',
	ORDERBOOK: 'orderbook',
	WATCHLIST: 'watchlist',
	OPEN_ORDERS: 'subscribe_open_orders',
	POSITIONS: 'subscribe_closed_positions',
	ACCOUNT_SUMMARY: 'account_summary',
	INSTRUMENT_DETAIL: 'contract_detail',
	HISTORICAL_DATA: 'historical_data',
	PORTFOLIO: 'portfolio'
}

export const SUBSCRIPTION_TYPE = {
	[INTENT.WATCHLIST]: 'MktData',
	[INTENT.ORDERBOOK]: 'MktDepth',
	[INTENT.OPEN_ORDERS]: 'OpenOrders',
	[INTENT.RECENT_TRADES]: 'RealTimeBars',
	[INTENT.HISTORICAL_DATA]: 'HistoricalData',
	[INTENT.POSITIONS]: 'Positions',
	[INTENT.ACCOUNT_SUMMARY]: 'AccountSummary',
	[INTENT.INSTRUMENT_DETAIL]: 'ContractDetails',
	[INTENT.PORTFOLIO]: 'AccountUpdates'
}

export const SECURITY_TYPE = {
	COMBO: 'combo',
	FOREX: 'forex',
	FUTURE: 'future',
	STOCK: 'stock',
	OPTION: 'option',
	IND: 'ind',
	CFD: 'cfd',
	FOP: 'fop'
}

// ref: https://interactivebrokers.github.io/tws-api/classIBApi_1_1EClient.html#a7a19258a3a2087c07c1c57b93f659b63
export const GENERIC_TICK = {
	VOLUME: 100, // Option Volume (currently for stocks)
	OPEN_INTEREST: 101, // Option Open Interest (currently for stocks)
	HISTORICAL_VOLATILITY: 104, // Historical Volatility (currently for stocks)
	AVERAGE_VOLUME: 105, // Average Option Volume (currently for stocks)
	IMPLIED_VOLATILITY: 106, // Option Implied Volatility (currently for stocks)
	INDEX_FUTURE_PREMIUM: 162, // Index Future Premium
	MISCELLANEOUS_STATS: 165, // Miscellaneous Stats
	MARKET_PRICE: 221, // Mark Price (used in TWS P&L computations)
	AUCTION_VALUES: 225, // Auction values (volume, price and imbalance)
	RTVOLUME: 233, // RTVolume - contains the last trade price, last trade size, last trade time, total volume, VWAP, and single trade flag.
	SHORTABLE: 236, // Shortable
	INVENTORY: 256, // Inventory
	Fundamental_Ratios: 258, // Fundamental Ratios
	REALTIME_HISTORICAL_VOLATILITY: 411, // Realtime Historical Volatility
	IBDividends: 456, // IBDividends
	DEFAULT: ''
}

// ref: https://interactivebrokers.github.io/tws-api/tick_types.html
export const TICK_SIZE_FIELD = {
	BID: 0,
	ASK: 3,
	LAST: 5,
	AVERAGE_VOLUME_100: 21,
	AUCTION_VOLUME: 34,
	AUCTION_IMBALANCE: 36,
	DELAYED_BID_SIZE: 69,
	DELAYED_ASK_SIZE: 70,
	DELAYED_LAST_SIZE: 71,
	DELAYED_VOLUME: 74,
	VOLUME: 77
}

export const TICK_PRICE_FIELD = {
	BID: 1,
	ASK: 2,
	LAST: 4,
	HIGH: 6,
	LOW: 7,
	VOLUME: 8,
	CLOSE: 9,
	OPEN: 14,
	LOW_13W: 15,
	HIGH_13W: 16,
	LOW_26W: 17,
	HIGH_26W: 18,
	LOW_52W: 19,
	HIGH_52W: 20,
	AUCTION_PRICE: 35,
	DELAYED_BID: 66,
	DELAYED_ASK: 67,
	DELAYED_LAST: 68,
	DELAYED_HIGH: 72,
	DELAYED_LOW: 73,
	DELAYED_CLOSE: 75,
	DELAYED_OPEN: 76
}

export const TICK_STRING_FIELD = {
	LAST_TRADED_TIMESTAMP: 45,
	DELAYED_LAST_TRADED_TIMESTAMP: 88
}

export const ORDER_TYPE = {
	LIMIT: 'limit',
	MARKET: 'market',
	MARKET_CLOSE: 'marketClose',
	STOP: 'stop',
	STOP_LIMIT: 'stopLimit',
	TRAILING_STOP: 'trailingStop'
}

export const ORDER_ACTION = {
	BUY: 'BUY',
	SELL: 'SELL'
}

export const ORDERBOOK_OPERATION = {
	INSERT: 0,
	UPDATE: 1,
	DELETE: 2
}

// ref: https://interactivebrokers.github.io/tws-api/historical_bars.html#hd_what_to_show
export const DATA_TO_SHOW = {
	TRADES: 'TRADES',
	MIDPOINT: 'MIDPOINT',
	BID: 'BID',
	ASK: 'ASK'
}

// ref: https://interactivebrokers.github.io/tws-api/classIBApi_1_1EClient.html#a3e0d55d36cd416639b97ee6e47a86fe9
export const ACCOUNT_TAG = {
	AccountType: 'AccountType',
	NetLiquidation: 'NetLiquidation',
	TotalCashValue: 'TotalCashValue',
	SettledCash: 'SettledCash',
	AccruedCash: 'AccruedCash',
	BuyingPower: 'BuyingPower',
	EquityWithLoanValue: 'EquityWithLoanValue'
	// PreviousEquityWithLoanValue: '',
	// GrossPositionValue: '',
	// RegTEquity: '',
	// RegTMargin: '',
	// SMA: '',
	// InitMarginReq: '',
	// MaintMarginReq: '',
	// AvailableFunds: '',
	// ExcessLiquidity: '',
	// Cushion: '',
	// FullInitMarginReq: '',
	// FullMaintMarginReq: '',
	// FullAvailableFunds: '',
	// FullExcessLiquidity: '',
	// LookAheadNextChange: '',
	// LookAheadInitMarginReq: '',
	// LookAheadMaintMarginReq: '',
	// LookAheadAvailableFunds: '',
	// LookAheadExcessLiquidity: '',
	// HighestSeverity: '',
	// DayTradesRemaining: '',
	// Leverage: ''
}
