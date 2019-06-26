import store from '../../../redux/store'
import {socket_update, add_user} from '../../../redux/actions';
import hxt_exchange from '../hxt_exchange'
import websocket_connection_manager from '../../connection_managers/websocket_connection_manager'
import { OpsLog } from '../../../utilities/logger'

export default class lmaxlondon_connector extends hxt_exchange {
    constructor(){
        super()
        this.exchange_name = "lmaxlondon";

        // Rest Endpoint
        this.api_end_point = "";

        // Websocket Endpoint
        this.stream_end_point = "wss://jxws.hydrax.io/";
        this.fix_stream_end_point = "wss://javafix.hydrax.io/";
        this.trading_is_demo = process.env.LMAX_TRADING_IS_DEMO;

        this.websocket_connection_manager = new websocket_connection_manager();

        this.trading_session = false;

        this.orderbook = {} //not used
        this.w_orderbook = {} //not used

        this.no_instruction_reject = true;

        this.client_order_info = {}

        this.current_watchlist_data = undefined

        this.demo_username = 'hydraxdemo';
        this.demo_password = 'hailHydracq%f';

        this.recent_trades = {}

        this.getCircularReplacer = () => {
          const seen = new WeakSet();
          return (key, value) => {
            if (typeof value === "object" && value !== null) {
              if (seen.has(value)) {
                return;
              }
              seen.add(value);
            }
            return value;
          };
        };

    }

    set_auth_info(info){
        this.exchange_username = info["username"]
        this.exchange_password = info["password"]
    }

    async check_authenticate(socket_id, user_id){
        await this.subscribe('check_authenticate', socket_id, user_id, '')
    }
    
    subscribe(intent, uuid, user_id, info){
        // We put it here so it can handle in the instance of snapshot but socket not initialized yet.
        store.dispatch(add_user(uuid, user_id))

        switch(intent){
            case 'cancel_order':
            case 'close_position':
            case 'place_order':
                var socket  = this.websocket_connection_manager.subscribe(uuid, 
                    [ 
                        this.get_stream(intent, info),
                        {}
                    ],
                    () => {
                        try {
                            this.client_order_info = info
                            socket.send(this.get_place_order_request(info))
                        } catch (error) {
                           OpsLog(this.exchange_name + " Subscribe Place Order Error [" + uuid + "] -> " + JSON.stringify(error, this.getCircularReplacer()))
                            // store.dispatch(socket_update(uuid, {error_message: error.message}))
                        }
                    },

                    (event) => {
                        try{
                            let data =  this.parse_data(intent, uuid, info, event.data)
                            if (data !== "NONE"){
                                /**
                                 *  For every response from placing order, wait for 200 ms for any instruction reject from lmax.
                                 * */
                                setTimeout(() => {
                                    if((data.success) && !this.no_instruction_reject){
                                        //if this is an orderPlaced message but followed by instruction reject, don't send anything
                                    }
                                    else{
                                        store.dispatch(socket_update(uuid, data))
                                    }
                                }, 250)
                            }
                        } catch (error) {
                           OpsLog(this.exchange_name + " Subscribe Place Order Error  [" + uuid + "] -> " + JSON.stringify(error, this.getCircularReplacer()))
                            // store.dispatch(socket_update(uuid, {error_message: error.message}))
                        }
                    },
                    ()=>{},
                    (error)=>{
                       OpsLog(this.exchange_name + " Subscribe Place Order Error  [" + uuid + "] -> " + JSON.stringify(error, this.getCircularReplacer()))
                    }
                )
                break
            default:
                var socket  = this.websocket_connection_manager.subscribe(uuid, 
                    [ 
                        this.get_stream(intent, info),
                        {}
                    ],
                    () => {
                        try {
                            socket.send(this.get_subscribe_info(intent, info))
                        } catch (error) {
                               OpsLog(this.exchange_name + " Subscribe Default Error  [" + uuid + "] -> " + JSON.stringify(error, this.getCircularReplacer()))

                            // store.dispatch(socket_update(uuid, {error_message: error.message}))
                        }
                    },
                    (event) => {
                        try {
                            let data =  this.parse_data(intent, uuid, info, event.data)
                            if (data !== "NONE"){
                                store.dispatch(socket_update(uuid, data))
                            }
                        } catch (error) {
                            OpsLog(this.exchange_name + " Subscribe Default Error  [" + uuid + "] -> " + JSON.stringify(error))
                        }
                    },
                    ()=>{OpsLog(this.exchange_name + " Watchlist Subscription Disconnected -> " + JSON.stringify(uuid))},
                    (e)=>{OpsLog(this.exchange_name + " Subscribe Default Error  [" + uuid + "] -> " + JSON.stringify(e, this.getCircularReplacer()))
}
                )
                
                
                break
        }
        
    }

    unsubscribe(uuid){
        return this.websocket_connection_manager.unsubscribe(uuid)
    }

    get_stream(intent, symbol){
        switch(intent){
            case 'check_authenticate':
            case 'place_order':
            case 'cancel_order':
            case 'close_position':
            case 'orderbook':
            case 'watchlist':
            case 'fetch_close_price':
            case 'recent_trades':
            case 'fetch_symbols':
            case 'fetch_api_symbols':
            case 'subscribe_open_orders':
            case 'subscribe_open_positions':
            case 'fetch_balance':
            case 'subscribe_margin':
                return this.stream_end_point;

            case 'subscribe_closed_positions':
            case 'subscribe_order_history':
                return this.fix_stream_end_point;
        }
    }

    parse_symbol(intent, symbol){
        switch(intent){
            case 'api':
                return symbol.toLowerCase().split(':')[1];
            case 'exchange':
                var symbol = symbol.toUpperCase().split(':')[1];
                switch(symbol){
                    case 'NDXM':
                        return 'NDXm';
                    case 'GDAXIM':
                        return 'GDAXIm';
                    case 'SPXM':
                        return 'SPXm';
                    default:
                        return symbol
                }
        }
    }

    async place_order(full_instrument, order_info){
        await this.subscribe('place_order', order_info.uuid, '', order_info)
    }

    async close_position(full_instrument, order_info){
        order_info.type='closing'
        order_info.symbol = this.parse_symbol('exchange', full_instrument)
        await this.subscribe('close_position', order_info.uuid, '', order_info)
    }

    async cancel_order(full_instrument, order_info){
        order_info.type='cancel'
        order_info.symbol = this.parse_symbol('exchange', full_instrument)
        await this.subscribe('cancel_order', order_info.uuid, '', order_info)
    }

    async fetch_open_orders(socket_id, user_id){
        await this.subscribe('subscribe_open_orders', socket_id, user_id, '')
    }

    async fetch_open_positions(socket_id, user_id){
        await this.subscribe('subscribe_open_positions', socket_id, user_id, '')
    }

    async fetch_closed_positions(socket_id){
        await this.subscribe('subscribe_closed_positions', socket_id, '', '')
    }

    async fetch_balance(socket_id, user_id){
        await this.subscribe('fetch_balance', socket_id, user_id, '')
    }

    async fetch_order_history(socket_id){
        await this.subscribe('subscribe_order_history', socket_id, '', '')
    }

    async fetch_symbols(full_instrument, socket_id){
        await this.subscribe('fetch_symbols', socket_id, '', '')
    }

    async fetch_api_symbols(full_instrument, socket_id){
        await this.subscribe('fetch_symbols', socket_id, '', '')
    }

    async get_close_price(full_instrument, socket_id){
        await this.subscribe('fetch_close_price', socket_id, '', full_instrument)
    }

    /**
     * Every request sends to Java server has to be a JSON string in this
     * format:
     * 
     * {
     *  "type": "",     <--- string - to describe what type of request is this
     *  "exchange": "", <--- string - name of the exchange
     *  "username": "", <--- string - LMAX account username
     *  "password": "", <--- string - LMAX account password
     *  "data": {}      <--- object - every parameter/payload for this request
     * }
     */
    get_subscribe_info(intent, symbol){
        symbol = this. parse_symbol('exchange', symbol)
        switch(intent){
            case 'orderbook':
                return JSON.stringify({
                    type: 'subscribeOrderBook',
                    exchange: this.exchange_name,
                    username: this.demo_username,
                    password: this.demo_password,
                    data: { 
                        isDemo: true, //always request the market data from demo (because we share data with all users using demo account)
                        symbol: symbol
                    }
                });
            case 'recent_trades':
            case 'fetch_close_price':
            case 'watchlist':
                return JSON.stringify({
                    type: 'subscribeWatchList',
                    exchange: this.exchange_name,
                    username: this.demo_username,
                    password: this.demo_password,
                    data: { 
                        isDemo: true, //always request the market data from demo (because we share data with all users using demo account)
                        symbol: symbol
                    }
                });
            case 'fetch_symbols': 
                return JSON.stringify({
                    type: 'getSymbols',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: { isDemo: true }
                });
            case 'fetch_api_symbols': 
                return JSON.stringify({
                    type: 'getSymbols',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: { isDemo: true }
                });
            case 'subscribe_open_orders': 
                return JSON.stringify({
                    type: 'subscribeOpenOrder',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {
                        isDemo: this.trading_is_demo
                    }
                });
            case 'subscribe_open_positions':
                return JSON.stringify({
                    type: 'subscribeOpenPosition',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {
                        isDemo: this.trading_is_demo
                    }
                });
            case 'fetch_balance':
            case 'check_authenticate': //get balances/margin to check if the credential is correct
            case 'subscribe_margin':
                return JSON.stringify({
                    type: 'subscribeAccount',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {
                        isDemo: this.trading_is_demo
                    }
                });
            case 'subscribe_closed_positions':
            case 'subscribe_order_history':
                return JSON.stringify({
                    type: 'subscribeOrderHistory',
                    exchange: this.exchange_name,
                    data: {
                        username: this.exchange_username,
                        password: this.exchange_password
                    }
                });
        }
    }

    //if qunatity < 0 its sell 
    get_place_order_request(order_info) {
        let orderquantity = 0
        let profit_target = '0'
        let stop_loss = '0'
        switch (order_info.type) {
            case 'market':
                stop_loss = ('stop_loss' in order_info) ?  order_info.stop_loss.toString() : '0'
                profit_target = ('profit_target' in order_info) ?  order_info.profitTarget.toString() : '0'
                orderquantity = (order_info.side == 'buy') ? order_info.quantity.toString() : (order_info.quantity * -1).toString()
                return JSON.stringify({
                    type: 'placeMarketOrder',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: { 
                        symbol: order_info.symbol,
                        quantity:orderquantity,
                        stopLoss:stop_loss,
                        profitTarget:profit_target,
                        isDemo: this.trading_is_demo,
                        timeInForce:order_info.time_in_force //check format order_info
                    }
                })
            case 'limit':
            stop_loss = ('stop_loss' in order_info) ?  order_info.stop_loss.toString() : '0'
            profit_target = ('profit_target' in order_info) ?  order_info.profit_target.toString() : '0'
            orderquantity = (order_info.side == 'buy') ? order_info.quantity.toString() : (order_info.quantity * -1).toString()
            return JSON.stringify({
                type: 'placeLimitOrder',
                exchange: this.exchange_name,
                username: this.exchange_username,
                password: this.exchange_password,
                data: { 
                    symbol: order_info.symbol,
                    price:order_info.price.toString(),
                    quantity:orderquantity,
                    stopLoss:stop_loss,
                    profitTarget:profit_target,
                    isDemo: this.trading_is_demo,
                    timeInForce:order_info.time_in_force
                }
            })
            case 'stop':
            stop_loss = ('stop_loss' in order_info) ?  order_info.stop_loss.toString() : '0'
            profit_target = ('profit_target' in order_info) ?  order_info.profitTarget.toString() : '0'
            orderquantity = (order_info.side == 'buy') ? order_info.quantity.toString() : (order_info.quantity * -1).toString()
            return JSON.stringify({
                type: 'placeStopOrder',
                exchange: this.exchange_name,
                username: this.exchange_username,
                password: this.exchange_password,
                data: { 
                    symbol: order_info.symbol,
                    price:order_info.price.toString(),
                    quantity:orderquantity,
                    stopLoss:stop_loss,
                    profitTarget:profit_target,
                    isDemo: this.trading_is_demo,
                    timeInForce:order_info.time_in_force
                }
            })
            case 'cancel':
            return JSON.stringify({
                type: 'placeCancelOrder',
                exchange: this.exchange_name,
                username: this.exchange_username,
                password: this.exchange_password,
                data: { 
                    symbol: order_info.symbol,
                    isDemo: this.trading_is_demo,
                    originalInstructionId:order_info.order_id
                }
            })
            case 'closing':
            //need to reverse the quantity by multiplying it with -1
            let closing_quantity = parseFloat(order_info.quantity)*-1
            return JSON.stringify({
                type: 'placeClosingOrder',
                exchange: this.exchange_name,
                username: this.exchange_username,
                password: this.exchange_password,
                data: { 
                    symbol: order_info.symbol,
                    originalInstructionId:order_info.position_id,
                    isDemo: this.trading_is_demo,
                    quantity:closing_quantity.toString()
                }
            })
        }
    }


    /**
     * Java server will always sends JSON string response in this format:
     *  
     * {
     *  "type": "",     <--- string - to describe what type of response is this
     *  "exchange": "", <--- string - name of the exchange
     *  "data": {}      <--- object - every parameter/payload for this response
     * }
     */
    parse_data(intent, uuid, symbol, message){
        var djson = JSON.parse(message)
        switch(intent+':'+djson.type){
            case 'check_authenticate:accountData':
                return true

            case 'check_authenticate:error':
                return false

            case 'orderbook:orderBookData':
                return this.parse_orderbook(symbol, uuid, djson)
                
            case 'watchlist:watchListData':
                return this.parse_watchlist(symbol, uuid, djson)

            case 'recent_trades:watchListData':
                    return this.parse_recent_trades(symbol, uuid, djson)

            case 'fetch_close_price:watchListData':
                return this.parse_close_price(symbol, uuid, djson)

            case 'fetch_symbols:getSymbols':
            case 'fetch_api_symbols:getSymbols':
                return this.parse_symbol_list(intent, uuid, djson.data)

            case 'subscribe_open_orders:executionData':
            case 'subscribe_open_positions:executionData':
            case 'subscribe_closed_positions:executionData':            
            case 'subscribe_open_orders:orderData':
            case 'subscribe_open_positions:positionaData':
            case 'subscribe_margin:accountData':
            case 'fetch_balance:accountData':
                return this.parse_all_data(intent, uuid, djson.data)

            case 'subscribe_closed_positions:orderHistoryData':
            case 'subscribe_order_history:orderHistoryData':
                return this.parse_trades_history(intent, uuid, djson.data)

            case 'place_order:orderPlaced':
            case 'close_position:orderPlaced':
            case 'cancel_order:orderPlaced':
                return this.parse_order(intent, djson)

            case 'orderbook:error':
            case 'orderbook:error':
            case 'watchlist:error':
            case 'recent_trades:error':
            case 'fetch_close_price:error':
            case 'place_order:error':
            case 'close_position:error':
            case 'cancel_order:error':
            case 'fetch_symbols:error':
            case 'fetch_api_symbols:error':
            case 'subscribe_open_orders:error':
            case 'subscribe_open_positions:error':
            case 'subscribe_closed_positions:error':
            case 'subscribe_margin:error':
            case 'fetch_balance:error':
            case 'subscribe_order_history:error':
            case 'place_order:error':
                return this.parse_error(intent, djson)
        }
    }

    parse_error(intent, djson){
        if(intent == 'place_order' || intent == 'cancel_order' || intent == 'close_position'){
            this.no_instruction_reject = false;

            return {
                success: false,
                error: djson.data.message,
                order_info: this.client_order_info
            }
        }
        return djson
    }

    parse_trades_history(intent, uuid,  djson) {
        switch (intent) {
            case 'subscribe_closed_positions':
                let today_midnight = new Date();
                today_midnight.setHours(0,0,0,0);
                let orders = djson.orders;

                let trades = []
                for(let i = orders.length-1; i >= 0; i--){
                    let trade_datetime = new Date(orders[i].transactTime)
                     if(trade_datetime > today_midnight){
                        trades.push(orders[i])
                     }
                }
                return {
                    trades: trades,
                    socket_id: uuid
                }
            case 'subscribe_order_history':
                return {
                    trades: djson.orders.reverse(), //changing the name from orders to trades
                    socket_id: uuid
                }
        }
    }
    
    parse_all_data(intent, uuid,  djson){
        let result = {}
        result.socket_id = uuid;
        if(intent.includes('open_positions') &&  Array.isArray(djson[Object.keys(djson)[0]])){
            result['open_positions'] = djson[Object.keys(djson)[0]]
            return result
        }            
        if(intent.includes('open_orders') &&  Array.isArray(djson[Object.keys(djson)[0]])) {
            result['orders'] = djson[Object.keys(djson)[0]]
            return result
        }
        if(intent.includes('closed_positions') &&  Array.isArray(djson[Object.keys(djson)[0]])) {
            result['closed_positions'] = djson[Object.keys(djson)[0]]
            return result
        }
        if(intent.includes('margin')){
            result['margin'] = djson
            return result
        }
        return 'NONE'
    }

    /**
     * Parse symbols list
     * @param {*} djson 
     */
    parse_symbol_list(intent, uuid, djson){
        let symbolsArray = [];
        switch (intent){
            case 'fetch_symbols':
                symbolsArray = [];
                djson.symbols.forEach(symbol => {
                    symbolsArray.push(symbol.name);
                });
                return symbolsArray
            case 'fetch_api_symbols':
                symbolsArray = [];
                djson.symbols.forEach(symbol => {
                    symbolsArray.push(symbol.symbol.toLowerCase());
                });
                return symbolsArray
        }
    }


    parse_order(intent, order_response) {
        switch (intent) {
            case 'cancel_order':
                return {
                    success: true,
                    order_id: this.client_order_info.order_id
                }
            case 'close_position':
                return {
                    success: true,
                    position_id: this.client_order_info.position_id
                }
            case 'place_order':
                return {
                    success: true,
                    order_id: order_response.data.instructionId,
                    order_info: this.client_order_info
                }
        }
        
    }

    parse_orderbook(symbol, uuid, djson){
        /**
         * sometimes LMAX gives an empty array for bid and ask
         * that's why the length of bid and ask array needs to be checked 
         * */
        if(djson !== undefined && djson.data.bid.length > 0 && djson.data.ask.length > 0 ){
            var bidArray = [];
            var askArray = [];

            symbol = this.parse_symbol('api', symbol);

            djson.data.bid.forEach(bid => {
                bidArray.push({
                    price: +bid[0],
                    quantity: +bid[1],
                })
            });
            djson.data.ask.forEach(ask => {
                askArray.push({
                    price: +ask[0],
                    quantity: +ask[1],
                })
            });
            return {
                exchange: this.exchange_name,
                symbol: symbol,
                bid: bidArray,
                ask: askArray,
                socket_id: uuid
            }
        }
        return "NONE";
    }


    parse_watchlist(symbol, uuid, djson){
        /**
         * sometimes LMAX gives null for bid and ask to Java server
         * and null object wouldn't be parsed to JSON by Java
         * that's why bid and ask needs to be checked
         * */
        if(djson !== undefined && djson.data.bid !== undefined && djson.data.ask !== undefined){
            if(this.current_watchlist_data == undefined){
                symbol = this.parse_symbol('api', symbol);
                this.current_watchlist_data = {
                    bid: djson.data.bid,
                    ask: djson.data.ask
                }
                return {
                    exchange: this.exchange_name,
                    symbol: symbol,
                    bid: +djson.data.bid,
                    ask: +djson.data.ask,
                    socket_id: uuid
                }
            }
            else{
                if(this.current_watchlist_data.bid != djson.data.bid || this.current_watchlist_data.ask != djson.data.ask){
                    symbol = this.parse_symbol('api', symbol);
                    this.current_watchlist_data = {
                        bid: djson.data.bid,
                        ask: djson.data.ask
                    }
                    return {
                        exchange: this.exchange_name,
                        symbol: symbol,
                        bid: +djson.data.bid,
                        ask: +djson.data.ask,
                        socket_id: uuid
                    }
                }
            }
            
        }
        return "NONE"
    }

    parse_recent_trades(symbol, uuid, djson) {
        if(djson !== undefined && djson.data.lastTradedPrice !== undefined ){

            if(this.recent_trades[symbol] === undefined){
                this.recent_trades[symbol] = [{
                    time: djson.data.time,
                    price: +djson.data.lastTradedPrice,
                    quantity: '-',
                    is_buy: null,
                }]

                return {
                    exchange: this.exchange_name,
                    symbol: symbol,
                    trades: this.recent_trades[symbol],
                    socket_id: uuid
                }
            }
            else {
                this.recent_trades[symbol].unshift({
                    time: djson.data.time,
                    price: +djson.data.lastTradedPrice,
                    quantity: '-',
                    is_buy: null,

                })

                if(this.recent_trades[symbol].length > 30){
                    this.recent_trades[symbol].splice(30, this.recent_trades[symbol].length - 30)
                }

                return {
                    exchange: this.exchange_name,
                    symbol: symbol,
                    trades: this.recent_trades[symbol],
                    socket_id: uuid
                }
            }
        }
        return "NONE"
    }

    parse_close_price(symbol, uuid, djson){
        let data = djson.data
        if(data !== undefined){
            return +data.marketClose
        }
    }
}