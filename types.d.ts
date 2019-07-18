// Type definitions for ./interactive_brokers/index.js
// Project: [LIBRARY_URL_HERE]
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module '@fantasia949/ib-connector/interactive_brokers'
declare module '@fantasia949/ib-connector/interactive_brokers/constants'
declare module '@fantasia949/ib-connector/interactive_brokers/intentConfig/factory'
declare module '@fantasia949/ib-connector/interactive_brokers/utils'

/**
 * 
 */
interface IbConnector {
	/**
	 * 
	 * @param config? 
	 */
	new (config?: any)

	/**
	 * 
	 * @param marketDataType 
	 */
	setMarketDataType(marketDataType: any): void

	/**
	 * 
	 * @param serverLogLevel 
	 */
	setServerLogLevel(serverLogLevel: any): void

	/**
	 * 
	 */
	connected: boolean

	/**
	 * Start listening an instrument
	 * 
	 * @param {string} intent
	 * @param {object} config - instance of intentConfig
	 * @param {subscriptionCallback=} cb
	 * @returns {number} request ID
	 * @memberof IbConnector
	 * @param intent 
	 * @param config 
	 * @param cb? 
	 * @return  
	 */
	subscribe(intent: string, config: any, cb?: any): number

	/**
	 * Stop listening an instrument
	 * 
	 * @param {string} intent
	 * @param {number} reqId
	 * @memberof IbConnector
	 * @param intent 
	 * @param reqId 
	 */
	unsubscribe(intent: string, reqId: number): void

	/**
	 * 
	 */
	getNewsProviders(): void

	/**
	 * 
	 * @param pattern 
	 */
	getMatchingSymbols(pattern: any): void

	/**
	 * 
	 * @param providerCode 
	 * @param articleId 
	 */
	getNewsArticle(providerCode: any, articleId: any): void

	/**
	 * 
	 * @param exSymbol 
	 */
	getInstrumentDetails(exSymbol: any): void

	/**
	 * 
	 * @param exSymbol 
	 */
	getInstrumentFundamental(exSymbol: any): void

	/**
	 * 
	 * @param exSymbol 
	 */
	getMarketdataSnapshot(exSymbol: any): void

	/**
	 * 
	 */
	getScannerParameters(): void

	/**
	 * 
	 * @param all 
	 */
	getOpenOrders(all: any): void

	/**
	 * 
	 */
	getCompletedOrders(): void

	/**
	 * Place an order
	 * 
	 * @param {string} exSymbol
	 * @param {OrderConfig} orderConfig
	 * @returns {number} orderId
	 * @memberof IbConnector
	 * @param exSymbol 
	 * @param orderConfig 
	 * @return  
	 */
	placeOrder(exSymbol: string, orderConfig: any): number

	/**
	 * Cancel an order
	 * 
	 * @param {string} orderId
	 * @param orderId 
	 */
	cancelOrder(orderId: string): void

	/**
	 * Connect to IB proxy
	 * 
	 * @param { ConnectConfig } config
	 * @returns {Promise<IbConnector>} promise of IBConnector
	 * @memberof IbConnector
	 * @param config 
	 * @return  
	 */
	connect(config: any): /* IbConnector.prototype.+Promise */ any

	/**
	 * disconnect from IB proxy and release related resources
	 * 
	 * @returns {Promise}
	 * @memberof IbConnector
	 * @return  
	 */
	disconnect(): any

	/**
	 * 
	 * @param errCb 
	 */
	_checkConnected(errCb: () => void): void

	/**
	 * 
	 */
	_checkDisconnected(): void

	/**
	 * 
	 * @param command 
	 * @param completeEvent 
	 * @param acumulateEvents 
	 * @param onAcumulate 
	 * @param undefined 
	 * @param initialAcumulatedData 
	 * @return  
	 */
	_getData(
		command: /* IbConnector.prototype._getData0 */ any,
		completeEvent: any,
		acumulateEvents: /* IbConnector.prototype._getData2 */ any,
		onAcumulate: /* IbConnector.prototype._getData3 */ any,
		param5: /* ?] */ any,
		initialAcumulatedData: Array<any> | {}
	): /* IbConnector.prototype.+Promise */ any

	/**
	 * 
	 * @param message 
	 * @param {uuid} 
	 */
	_onMessage(message: any, { uuid }: any): void

	/**
	 * 
	 * @param config 
	 */
	_initConnection(config: any): void

	/**
	 * 
	 * @param message 
	 */
	_sendCommand(message: /* IbConnector.prototype._sendCommand0 */ any): void

	/**
	 * 
	 * @param eventName 
	 * @param cb 
	 * @return  
	 */
	_onMessageEvent(eventName: any, cb: any): /* IbConnector.prototype._onMessageEventRet */ any

	/**
	 * 
	 * @param eventName 
	 * @param cb 
	 */
	_onceMessageEvent(eventName: any, cb: /* IbConnector.prototype._onceMessageEvent1 */ any): void

	/**
	 * 
	 * @return  
	 */
	_getStream(): /* !this._config.endpoint */ any
}

// Type definitions for ./interactive_brokers/constants.js
// Project: [LIBRARY_URL_HERE]
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/**
 * 
 */
declare var MARKET_DATA_TYPE: {
	/**
	 * 
	 */
	LIVE: number

	/**
	 * 
	 */
	FROZEN: number

	/**
	 * 
	 */
	DELAYED: number

	/**
	 * 
	 */
	DELAYED_FROZEN: number
}

/**
 * 
 */
declare var SERVER_LOG_LEVEL: {
	/**
	 * 
	 */
	SYSTEM: number

	/**
	 * 
	 */
	ERROR: number

	/**
	 * 
	 */
	WARNING: number

	/**
	 * 
	 */
	INFORMATION: number

	/**
	 * 
	 */
	DETAIL: number
}

/**
 * 
 */
declare var MARKETDATA_EVENT: {
	/**
	 * 
	 */
	TICK_SIZE: string

	/**
	 * 
	 */
	TICK_PRICE: string

	/**
	 * 
	 */
	TICK_STRING: string

	/**
	 * 
	 */
	TICK_SNAPSHOT_END: string

	/**
	 * 
	 */
	ORDERBOOK: string

	/**
	 * 
	 */
	HISTORICAL_DATA: string

	/**
	 * 
	 */
	HISTORICAL_DATA_UPDATE: string

	/**
	 * 
	 */
	HISTORICAL_DATA_END: string

	/**
	 * 
	 */
	INSTRUMENT_DETAIL: string

	/**
	 * 
	 */
	INSTRUMENT_DETAIL_END: string

	/**
	 * 
	 */
	RECENT_TRADES: string

	/**
	 * 
	 */
	SYMBOL_SAMPLES: string

	/**
	 * 
	 */
	FUNDAMENTAL_DATA: string

	/**
	 * 
	 */
	SCANNER_PARAMETERS: string

	/**
	 * 
	 */
	SCANNER_DATA: string

	/**
	 * 
	 */
	SCANNER_DATA_END: string
}

/**
 * 
 */
declare var TRADE_EVENT: {
	/**
	 * 
	 */
	ORDER_OPEN: string

	/**
	 * 
	 */
	ORDER_OPEN_END: string

	/**
	 * 
	 */
	ORDER_COMPLETED: string

	/**
	 * 
	 */
	ORDER_COMPLETED_END: string

	/**
	 * 
	 */
	ORDER_STATUS: string

	/**
	 * 
	 */
	POSITION: string

	/**
	 * 
	 */
	POSITION_END: string

	/**
	 * 
	 */
	NEXT_ORDER_ID: string
}

/**
 * 
 */
declare var ACCOUNT_EVENT: {
	/**
	 * 
	 */
	ACCOUNT_SUMMARY: string

	/**
	 * 
	 */
	ACCOUNT_SUMMARY_END: string

	/**
	 * 
	 */
	UPDATE_ACCOUNT_TIMESTAMP: string

	/**
	 * 
	 */
	UPDATE_ACCOUNT_VALUE: string

	/**
	 * 
	 */
	UPDATE_PORTFOLIO: string

	/**
	 * 
	 */
	ACCOUNT_DOWNLOAD_END: string
}

/**
 * 
 */
declare var FUNDAMENTAL_REPORT_TYPE: {
	/**
	 * 
	 */
	COMPANY_OVERVIEW: string

	/**
	 * 
	 */
	FINANCIAL_SUMMARY: string

	/**
	 * 
	 */
	FINANCIAL_RATIOS: string

	/**
	 * 
	 */
	FINANCIAL_STATEMENTS: string

	/**
	 * 
	 */
	ANALYST_ESTIMATES: string

	/**
	 * 
	 */
	COMPANY_CALENDAR: string
}

/**
 * 
 */
declare var NEWS_EVENT: {
	/**
	 * 
	 */
	NEWS_PROVIDERS: string

	/**
	 * 
	 */
	HISTORICAL_NEWS: string

	/**
	 * 
	 */
	HISTORICAL_NEWS_END: string

	/**
	 * 
	 */
	NEWS_ARTICLE: string
}

/**
 * 
 */
declare var EVENT: {
	/**
	 * 
	 */
	OPEN: string

	/**
	 * 
	 */
	CLOSE: string

	/**
	 * 
	 */
	ERROR: string

	/**
	 * 
	 */
	MESSAGE: string

	/**
	 * 
	 */
	DATA: string

	/**
	 * 
	 */
	READY: string

	/**
	 * 
	 */
	COMMAND_SEND: string
}

/**
 * 
 */
declare var INTENT: {
	/**
	 * 
	 */
	LIVE_TRADES: string

	/**
	 * 
	 */
	LIVE_ORDERBOOK: string

	/**
	 * 
	 */
	LIVE_MARKET_DATA: string

	/**
	 * 
	 */
	LIVE_NEWS: string

	/**
	 * 
	 */
	LIVE_OPEN_POSITIONS: string

	/**
	 * 
	 */
	LIVE_ACCOUNT_SUMMARY: string

	/**
	 * 
	 */
	LIVE_PORTFOLIO: string

	/**
	 * 
	 */
	LIVE_BAR: string

	/**
	 * 
	 */
	OPEN_ORDERS: string

	/**
	 * 
	 */
	ALL_OPEN_ORDERS: string

	/**
	 * 
	 */
	COMPLETED_ORDERS: string

	/**
	 * 
	 */
	HISTORICAL_BAR: string

	/**
	 * 
	 */
	INSTRUMENT_DETAILS: string

	/**
	 * 
	 */
	INSTRUMENT_FUNDAMENTAL: string

	/**
	 * 
	 */
	NEWS_ARTICLE: string

	/**
	 * 
	 */
	NEWS_PROVIDERS: string

	/**
	 * 
	 */
	HISTORICAL_NEWS: string

	/**
	 * 
	 */
	MATCHING_SYMBOLS: string

	/**
	 * 
	 */
	SCANNER_PARAMTERS: string

	/**
	 * 
	 */
	SCANNER_SUBSCRIPTION: string
}

/**
 * 
 */
export declare var CURRENCIES: Array<string>

/**
 * 
 */
declare var SECURITY_TYPE: {
	/**
	 * 
	 */
	FOREX: string

	/**
	 * 
	 */
	FUTURE: string

	/**
	 * 
	 */
	STOCK: string

	/**
	 * 
	 */
	OPTION: string

	/**
	 * 
	 */
	INDEX: string

	/**
	 * 
	 */
	FOP: string

	/**
	 * 
	 */
	COMMODITY: string
}

/**
 * 
 */
declare var RIGHT_TYPE: {
	/**
	 * 
	 */
	PUT: string

	/**
	 * 
	 */
	CALL: string
}

/**
 * 
 */
declare var GENERIC_TICK: {
	/**
	 * 
	 */
	VOLUME: number

	/**
	 * 
	 */
	OPEN_INTEREST: number

	/**
	 * 
	 */
	HISTORICAL_VOLATILITY: number

	/**
	 * 
	 */
	AVERAGE_VOLUME: number

	/**
	 * 
	 */
	IMPLIED_VOLATILITY: number

	/**
	 * 
	 */
	INDEX_FUTURE_PREMIUM: number

	/**
	 * 
	 */
	MISCELLANEOUS_STATS: number

	/**
	 * 
	 */
	MARKET_PRICE: number

	/**
	 * 
	 */
	AUCTION_VALUES: number

	/**
	 * 
	 */
	RT_VOLUME: number

	/**
	 * 
	 */
	SHORTABLE: number

	/**
	 * 
	 */
	INVENTORY: number

	/**
	 * 
	 */
	Fundamental_Ratios: number

	/**
	 * 
	 */
	REALTIME_HISTORICAL_VOLATILITY: number

	/**
	 * 
	 */
	IBDividends: number

	/**
	 * 
	 */
	NEWS: number

	/**
	 * 
	 */
	RT_TRADE_VOLUME: number

	/**
	 * 
	 */
	DEFAULT: string
}

/**
 * 
 */
declare var TICK_SIZE_FIELD: {
	/**
	 * 
	 */
	BID: number

	/**
	 * 
	 */
	ASK: number

	/**
	 * 
	 */
	LAST: number

	/**
	 * 
	 */
	AVERAGE_VOLUME_100: number

	/**
	 * 
	 */
	AUCTION_VOLUME: number

	/**
	 * 
	 */
	AUCTION_IMBALANCE: number

	/**
	 * 
	 */
	DELAYED_BID_SIZE: number

	/**
	 * 
	 */
	DELAYED_ASK_SIZE: number

	/**
	 * 
	 */
	DELAYED_LAST_SIZE: number

	/**
	 * 
	 */
	DELAYED_VOLUME: number

	/**
	 * 
	 */
	VOLUME: number
}

/**
 * 
 */
declare var TICK_PRICE_FIELD: {
	/**
	 * 
	 */
	BID: number

	/**
	 * 
	 */
	ASK: number

	/**
	 * 
	 */
	LAST: number

	/**
	 * 
	 */
	HIGH: number

	/**
	 * 
	 */
	LOW: number

	/**
	 * 
	 */
	VOLUME: number

	/**
	 * 
	 */
	CLOSE: number

	/**
	 * 
	 */
	OPEN: number

	/**
	 * 
	 */
	LOW_13W: number

	/**
	 * 
	 */
	HIGH_13W: number

	/**
	 * 
	 */
	LOW_26W: number

	/**
	 * 
	 */
	HIGH_26W: number

	/**
	 * 
	 */
	LOW_52W: number

	/**
	 * 
	 */
	HIGH_52W: number

	/**
	 * 
	 */
	AUCTION_PRICE: number

	/**
	 * 
	 */
	DELAYED_BID: number

	/**
	 * 
	 */
	DELAYED_ASK: number

	/**
	 * 
	 */
	DELAYED_LAST: number

	/**
	 * 
	 */
	DELAYED_HIGH: number

	/**
	 * 
	 */
	DELAYED_LOW: number

	/**
	 * 
	 */
	DELAYED_CLOSE: number

	/**
	 * 
	 */
	DELAYED_OPEN: number
}

/**
 * 
 */
declare var TICK_STRING_FIELD: {
	/**
	 * 
	 */
	LAST_TRADED_TIMESTAMP: number

	/**
	 * 
	 */
	RT_VOLUME: number

	/**
	 * 
	 */
	NEW_FEED: number

	/**
	 * 
	 */
	DELAYED_LAST_TRADED_TIMESTAMP: number

	/**
	 * 
	 */
	RT_TRADE: number
}

/**
 * 
 */
declare var ORDER_TYPE: {
	/**
	 * 
	 */
	LIMIT: string

	/**
	 * 
	 */
	MARKET: string

	/**
	 * 
	 */
	MARKET_CLOSE: string

	/**
	 * 
	 */
	STOP: string

	/**
	 * 
	 */
	STOP_LIMIT: string

	/**
	 * 
	 */
	TRAILING_STOP: string
}

/**
 * 
 */
declare var ORDER_ACTION: {
	/**
	 * 
	 */
	BUY: string

	/**
	 * 
	 */
	SELL: string
}

/**
 * 
 */
declare var ORDERBOOK_OPERATION: {
	/**
	 * 
	 */
	INSERT: number

	/**
	 * 
	 */
	UPDATE: number

	/**
	 * 
	 */
	DELETE: number
}

/**
 * 
 */
declare var DATA_TO_SHOW: {
	/**
	 * 
	 */
	TRADES: string

	/**
	 * 
	 */
	MIDPOINT: string

	/**
	 * 
	 */
	BID: string

	/**
	 * 
	 */
	ASK: string
}

/**
 * 
 */
declare var ACCOUNT_TAG: {
	/**
	 * 
	 */
	AccountType: string

	/**
	 * 
	 */
	NetLiquidation: string

	/**
	 * 
	 */
	TotalCashValue: string

	/**
	 * 
	 */
	SettledCash: string

	/**
	 * 
	 */
	AccruedCash: string

	/**
	 * 
	 */
	BuyingPower: string

	/**
	 * 
	 */
	EquityWithLoanValue: string
}

/**
 * 
 */
declare var SCANNER_SUBSCRIPTION_FILTER: {
	/**
	 * 
	 */
	NUMBER_OF_ROWS: string

	/**
	 * 
	 */
	INSTRUMENT: string

	/**
	 * 
	 */
	LOCATION_CODE: string

	/**
	 * 
	 */
	SCAN_CODE: string

	/**
	 * 
	 */
	ABOVE_PRICE: string

	/**
	 * 
	 */
	BELOW_PRICE: string

	/**
	 * 
	 */
	ABOVE_VOLUME: string

	/**
	 * 
	 */
	AVERAGE_OPTION_VOLUME_ABOVE: string

	/**
	 * 
	 */
	MARKET_CAP_ABOVE: string

	/**
	 * 
	 */
	MARKET_CAP_BELOW: string

	/**
	 * 
	 */
	MOODY_RATING_ABOVE: string

	/**
	 * 
	 */
	MOODY_RATING_BELOW: string

	/**
	 * 
	 */
	SP_RATING_ABOVE: string

	/**
	 * 
	 */
	SP_RATING_BELOW: string

	/**
	 * 
	 */
	MATURITY_DATE_ABOVE: string

	/**
	 * 
	 */
	MATURITY_DATE_BELOW: string

	/**
	 * 
	 */
	COUPON_RATE_ABOVE: string

	/**
	 * 
	 */
	COUPON_RATE_BELOW: string

	/**
	 * 
	 */
	EXCLUDE_CONVERTIBLE: string

	/**
	 * 
	 */
	SCANNER_SETTING_PAIRS: string

	/**
	 * 
	 */
	STOCK_TYPE_FILTER: string
}


// Type definitions for ./interactive_brokers/intentConfig/factory.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare namespace _defaultIntentConfig{
	// _defaultIntentConfig.toCommandParams.!ret
	type ToCommandParamsRet = Array<any>;
}

/**
 * 
 */
declare namespace _defaultIntentConfig{
		
	/**
	 * 
	 * @param ...args 
	 * @return  
	 */
	function toCommandParams(...args : any): _defaultIntentConfig.ToCommandParamsRet;
}

/**
 * 
 * @param group 
 * @param tags 
 */
declare function accountSummaryConfig(group : any, tags : any): void;

/**
 * 
 * @param exSymbol 
 * @param endDateTime 
 * @param durationString 
 * @param barSizeSetting 
 * @param whatToShow 
 */
declare function historicalDataConfig(exSymbol : any, endDateTime : any, durationString : any, barSizeSetting : any, whatToShow : any): void;

/**
 * 
 * @param exSymbol 
 * @param whatToShow 
 */
declare function realtimeBarConfig(exSymbol : any, whatToShow : any): void;

/**
 * 
 * @param exSymbol 
 */
declare function recentTradesConfig(exSymbol : any): void;

/**
 * 
 * @param exSymbol 
 */
declare function instrumentDetailsConfig(exSymbol : any): void;

/**
 * 
 * @param exSymbol 
 * @param reportType 
 */
declare function instrumentFundamentalConfig(exSymbol : any, reportType : any): void;

/**
 * 
 * @param exSymbol 
 * @param numRows 
 */
declare function orderbookConfig(exSymbol : any, numRows : any): void;

/**
 * 
 * @param exSymbol 
 * @param genericTickList 
 * @param snapshot 
 * @param regulatory 
 */
declare function marketDataConfig(exSymbol : any, genericTickList : any, snapshot : any, regulatory : any): void;

/**
 * 
 * @param account 
 */
declare function portfolioConfig(account : any): void;

/**
 * 
 * @param conId 
 * @param providerCodes 
 * @param startDateTime 
 * @param endDateTime 
 * @param totalResults 
 */
declare function historicalNewsConfig(conId : any, providerCodes : any, startDateTime : any, endDateTime : any, totalResults : any): void;

/**
 * 
 * @param providerCode 
 * @param articleId 
 */
declare function newsArticleConfig(providerCode : any, articleId : any): void;

/**
 * 
 * @param exSymbol 
 * @param providerCode 
 */
declare function recentNewsConfig(exSymbol : any, providerCode : any): void;

/**
 * 
 * @param pattern 
 */
declare function matchingSymbolsConfig(pattern : any): void;

/**
 * 
 * @param filters 
 */
declare function scannerSubscriptionConfig(filters : any): void;

/**
 * 
 * @return  
 */
declare function defaultIntentConfig(): /* _defaultIntentConfig */ any;
