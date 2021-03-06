// ref: http://interactivebrokers.github.io/tws-api/market_data_type.html
export const MARKET_DATA_TYPE = {
	LIVE: 1,
	FROZEN: 2,
	DELAYED: 3,
	DELAYED_FROZEN: 4
}

export const SERVER_LOG_LEVEL = {
	SYSTEM: 1,
	ERROR: 2,
	WARNING: 3,
	INFORMATION: 4,
	DETAIL: 5
}

export const MARKETDATA_EVENT = {
	TICK_SIZE: 'tickSize',
	TICK_PRICE: 'tickPrice',
	TICK_STRING: 'tickString',
	TICK_SNAPSHOT_END: 'tickSnapshotEnd',
	ORDERBOOK: 'updateMktDepth',
	HISTORICAL_DATA: 'historicalData',
	HISTORICAL_DATA_UPDATE: 'historicalDataUpdate',
	HISTORICAL_DATA_END: 'historicalDataEnd',
	INSTRUMENT_DETAIL: 'contractDetails',
	INSTRUMENT_DETAIL_END: 'contractDetailsEnd',
	RECENT_TRADES: 'realtimeBar',
	SYMBOL_SAMPLES: 'symbolSamples',
	FUNDAMENTAL_DATA: 'fundamentalData',
	SCANNER_PARAMETERS: 'scannerParameters',
	SCANNER_DATA: 'scannerData',
	SCANNER_DATA_END: 'scannerDataEnd',
	EXCHANGES: 'mktDepthExchanges',
	MARKET_RULE: 'marketRule'
}
export const TRADE_EVENT = {
	ORDER_OPEN: 'openOrder',
	ORDER_OPEN_END: 'openOrderEnd',
	ORDER_COMPLETED: 'completedOrder',
	ORDER_COMPLETED_END: 'completedOrdersEnd',
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

export const FUNDAMENTAL_REPORT_TYPE = {
	COMPANY_OVERVIEW: 'ReportSnapshot',
	FINANCIAL_SUMMARY: 'ReportsFinSummary',
	FINANCIAL_RATIOS: 'ReportRatios',
	FINANCIAL_STATEMENTS: 'ReportsFinStatements',
	ANALYST_ESTIMATES: 'RESC',
	COMPANY_CALENDAR: 'CalendarReport'
}

export const NEWS_EVENT = {
	NEWS_PROVIDERS: 'newsProviders',
	HISTORICAL_NEWS: 'historicalNews',
	HISTORICAL_NEWS_END: 'historicalNewsEnd',
	NEWS_ARTICLE: 'newsArticle'
}

export const EVENT = {
	OPEN: 'connect',
	CLOSE: 'close',
	ERROR: 'error',
	MESSAGE: 'data',
	DATA: 'parsed_data',
	READY: 'ready',
	COMMAND_SEND: 'command',
	TIMEOUT: 'timeout'
}

export const INTENT = {
	LIVE_TRADES: 'recent_trades',
	LIVE_ORDERBOOK: 'orderbook',
	LIVE_MARKET_DATA: 'watchlist',
	LIVE_NEWS: 'recent_news',
	LIVE_OPEN_POSITIONS: 'subscribe_open_positions',
	LIVE_ACCOUNT_SUMMARY: 'account_summary',
	LIVE_PORTFOLIO: 'portfolio',
	LIVE_BAR: 'live_bar',
	OPEN_ORDERS: 'subscribe_open_orders',
	ALL_OPEN_ORDERS: 'subscribe_all_open_orders',
	COMPLETED_ORDERS: 'subscribe_completed_orders',
	HISTORICAL_BAR: 'historical_data',
	INSTRUMENT_DETAILS: 'contract_details',
	INSTRUMENT_FUNDAMENTAL: 'contract_fundamental',
	NEWS_ARTICLE: 'news_article',
	NEWS_PROVIDERS: 'news_providers',
	EXCHANGES: 'exchanges',
	HISTORICAL_NEWS: 'historical_news',
	MATCHING_SYMBOLS: 'matching_symbols',
	MARKET_RULE: 'market_rule',
	SCANNER_PARAMTERS: 'scanner_parameters',
	SCANNER_SUBSCRIPTION: 'scanner_subscription'
}

export const SUBSCRIPTION_TYPE = {
	[INTENT.LIVE_MARKET_DATA]: 'MktData',
	[INTENT.LIVE_NEWS]: 'MktData',
	[INTENT.LIVE_TRADES]: 'MktData',
	[INTENT.LIVE_ORDERBOOK]: 'MktDepth',
	[INTENT.LIVE_BAR]: 'RealTimeBars',
	[INTENT.LIVE_OPEN_POSITIONS]: 'Positions',
	[INTENT.LIVE_ACCOUNT_SUMMARY]: 'AccountSummary',
	[INTENT.LIVE_PORTFOLIO]: 'AccountUpdates',
	[INTENT.OPEN_ORDERS]: 'OpenOrders',
	[INTENT.ALL_OPEN_ORDERS]: 'AllOpenOrders',
	[INTENT.COMPLETED_ORDERS]: 'CompletedOrders',
	[INTENT.HISTORICAL_BAR]: 'HistoricalData',
	[INTENT.INSTRUMENT_DETAILS]: 'ContractDetails',
	[INTENT.INSTRUMENT_FUNDAMENTAL]: 'FundamentalData',
	[INTENT.NEWS_ARTICLE]: 'NewsArticle',
	[INTENT.HISTORICAL_NEWS]: 'HistoricalNews',
	[INTENT.NEWS_PROVIDERS]: 'NewsProviders',
	[INTENT.MATCHING_SYMBOLS]: 'MatchingSymbols',
	[INTENT.SCANNER_PARAMTERS]: 'ScannerParameters',
	[INTENT.SCANNER_SUBSCRIPTION]: 'ScannerSubscription',
	[INTENT.EXCHANGES]: 'MktDepthExchanges',
	[INTENT.MARKET_RULE]: 'MarketRule'
}

export const CURRENCIES = [
	'KRW',
	'EUR',
	'GBP',
	'AUD',
	'USD',
	'TRY',
	'ZAR',
	'CAD',
	'CHF',
	'MXN',
	'HKD',
	'JPY',
	'INR',
	'NOK',
	'SEK',
	'RUB'
]

export const SECURITY_TYPE = {
	FOREX: 'cash',
	FUTURE: 'fut',
	STOCK: 'stk',
	OPTION: 'opt',
	INDEX: 'ind',
	FOP: 'fop',
	COMMODITY: 'cmdty',
	WARRANT: 'war'
}

export const SECURITY_TYPES = Object.values(SECURITY_TYPE)

export const RIGHT_TYPE = {
	PUT: 'P',
	CALL: 'C'
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
	RT_VOLUME: 233, // RTVolume - contains the last trade price, last trade size, last trade time, total volume, VWAP, and single trade flag.
	SHORTABLE: 236, // Shortable
	INVENTORY: 256, // Inventory
	Fundamental_Ratios: 258, // Fundamental Ratios
	REALTIME_HISTORICAL_VOLATILITY: 411, // Realtime Historical Volatility
	IBDividends: 456, // IBDividends,
	NEWS: 292,
	RT_TRADE_VOLUME: 375,
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
	RT_VOLUME: 48,
	NEW_FEED: 62,
	DELAYED_LAST_TRADED_TIMESTAMP: 88,
	RT_TRADE: 77
}

export const ORDER_TYPE = {
	LIMIT: 'LMT',
	MARKET: 'MKT',
	MARKET_CLOSE: 'MOC',
	STOP: 'STP',
	STOP_LIMIT: 'STP LMT',
	TRAILING_STOP: 'TRAIL'
}

export const ORDER_TYPES = Object.values(ORDER_TYPE)

export const ORDER_ACTION = {
	BUY: 'BUY',
	SELL: 'SELL'
}

export const ORDER_ACTIONS = Object.values(ORDER_ACTION)

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

// ref: http://interactivebrokers.github.io/tws-api/classIBApi_1_1ScannerSubscription.html
export const SCANNER_SUBSCRIPTION_FILTER = {
	NUMBER_OF_ROWS: 'numberOfRows',
	INSTRUMENT: 'instrument',
	LOCATION_CODE: 'locationCode',
	SCAN_CODE: 'scanCode',
	ABOVE_PRICE: 'abovePrice',
	BELOW_PRICE: 'belowPrice',
	ABOVE_VOLUME: 'aboveVolume',
	AVERAGE_OPTION_VOLUME_ABOVE: 'averageOptionVolumeAbove',
	MARKET_CAP_ABOVE: 'marketCapAbove',
	MARKET_CAP_BELOW: 'marketCapBelow',
	MOODY_RATING_ABOVE: 'moodyRatingAbove',
	MOODY_RATING_BELOW: 'moodyRatingBelow',
	SP_RATING_ABOVE: 'spRatingAbove',
	SP_RATING_BELOW: 'spRatingBelow',
	MATURITY_DATE_ABOVE: 'maturityDateAbove',
	MATURITY_DATE_BELOW: 'maturityDateBelow',
	COUPON_RATE_ABOVE: 'couponRateAbove',
	COUPON_RATE_BELOW: 'couponRateBelow',
	EXCLUDE_CONVERTIBLE: 'excludeConvertible',
	SCANNER_SETTING_PAIRS: 'scannerSettingPairs',
	STOCK_TYPE_FILTER: 'stockTypeFilter'
}

export const SCANNER_SUBSCRIPTION_FILTERS = Object.values(SCANNER_SUBSCRIPTION_FILTER)
