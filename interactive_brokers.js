import websocket_connection_manager from './websocket_connection_manager'

export default class ib_connector {
    constructor(){
        this.exchange_name = "ib";

        // Websocket Endpoint
        this.stream_end_point = "";  //IB server 

        this.websocket_connection_manager = new websocket_connection_manager();

        this.orderbook = {} 
        this.watchlist = {} 
        this.recent_trades = {} 


        // // Credentials, depend of exchange credential requirements
        // this.username = ''
        // this.password= ''
        // this.token = ''
    }


    subscribe(intent, uuid, info){
    
        var socket  = this.websocket_connection_manager.subscribe(uuid, 
            [ 
                this.get_stream(intent, info),
                {}
            ],
            () => {
                socket.send(this.get_subscribe_info(intent, info)) //on_open()
            },
            (event) => {
                try{
                    let data =  this.parse_data(intent, uuid, info, event.data)
                    if (data !== "NONE")
                        console.log(data)
                } catch (error) {
                    console.log(error)
                }
            },
            ()=>{'Disconnected: ', uuid},
            (e)=>{'Error: '+ uuid +'\n' + console.log(e)}
        )
        
          
        
    }
    unsubscribe(socket){
        return this.websocket_connection_manager.unsubscribe(socket)
    }

    get_stream(intent, symbol){
        switch(intent){
            default:
                return this.stream_end_point;
        }
    }

    parse_symbol(intent, symbol){
        switch(intent){
            case 'api': 
                return symbol.replace('/', '').toLowerCase().split(':')[1]
            case 'exchange':
                return symbol.toUpperCase().split(':')[1];
        }
    }
    async place_order(full_instrument, order_info){
        await this.subscribe('place_order', order_info.uuid, order_info)
    }
    async close_position(full_instrument, order_info){
        order_info.type='closing'
        order_info.symbol = this.parse_symbol('exchange', full_instrument)
        await this.subscribe('close_position', order_info.uuid, order_info)
    }
    async cancel_order(full_instrument, order_info){
        order_info.type='cancel'
        order_info.symbol = this.parse_symbol('exchange', full_instrument)
        await this.subscribe('cancel_order', order_info.uuid, order_info)
    }
    async subscribe_open_orders(socket_id){
        await this.subscribe('subscribe_open_orders', socket_id, '')
    }
    async subscribe_open_positions(socket_id){
        await this.subscribe('subscribe_open_positions', socket_id, '')
    }
    async subscribe_closed_positions(socket_id){
        await this.subscribe('subscribe_closed_positions', socket_id, '')
    }
    async subscibe_margin(socket_id){
        await this.subscribe('subscribe_balance', socket_id, '')
    }
    async fetch_order_history(socket_id){
        await this.subscribe('subscribe_order_history', socket_id, '')
    }
    async fetch_symbols(full_instrument, socket_id){
        await this.subscribe('fetch_symbols', socket_id, '')
    }
    async fetch_api_symbols(full_instrument, socket_id){
        await this.subscribe('fetch_symbols', socket_id, '')
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
            case 'recent_trades':
                return
            case 'orderbook':
                return JSON.stringify({
                    type: 'subscribeOrderBook',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: { symbol: symbol}
                });
            case 'watchlist':
                return JSON.stringify({
                    type: 'subscribeWatchList',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: { symbol: symbol}
                });
            case 'fetch_symbols': 
                return JSON.stringify({
                    type: 'getSymbols',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {}
                });
            case 'fetch_api_symbols': 
                return JSON.stringify({
                    type: 'getSymbols',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {}
                });
            case 'subscribe_open_orders': 
                return JSON.stringify({
                    type: 'subscribeOpenOrder',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {}
                });
            case 'subscribe_open_positions':
                return JSON.stringify({
                    type: 'subscribeOpenPosition',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {}
                });
            case 'fetch_balance':
                return JSON.stringify({
                    type: 'subscribeAccount',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {}
                });
            case 'check_authenticate': //get balances/margin to check if the credential is correct
            case 'subscribe_margin':
                return JSON.stringify({
                    type: 'subscribeAccount',
                    exchange: this.exchange_name,
                    username: this.exchange_username,
                    password: this.exchange_password,
                    data: {}
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
                stop_loss = ('stopLoss' in order_info) ?  order_info.stop_loss.toString() : '0'
                profit_target = ('profitTarget' in order_info) ?  order_info.profitTarget.toString() : '0'
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
                        timeInForce:order_info.time_in_force //check format order_info
                    }
                })
            case 'limit':
            stop_loss = ('stopLoss' in order_info) ?  order_info.stop_loss.toString() : '0'
            profit_target = ('profitTarget' in order_info) ?  order_info.profitTarget.toString() : '0'
            orderquantity = (order_info.side == 'buy') ? order_info.quantity.toString() : (order_info.quantity * -1).toString()
            return JSON.stringify({
                type: 'placeLimitOrder',
                exchange: this.exchange_name,
                username: this.exchange_username,
                password: this.exchange_password,
                data: { 
                    symbol: order_info.symbol,
                    price:order_info.price,
                    quantity:orderquantity,
                    stopLoss:stop_loss,
                    profitTarget:profit_target,
                    timeInForce:order_info.time_in_force //check format order_info
                }
            })
            case 'stop':
            stop_loss = ('stopLoss' in order_info) ?  order_info.stop_loss.toString() : '0'
            profit_target = ('profitTarget' in order_info) ?  order_info.profitTarget.toString() : '0'
            orderquantity = (order_info.side == 'buy') ? order_info.quantity.toString() : (order_info.quantity * -1).toString()
            return JSON.stringify({
                type: 'placeStopOrder',
                exchange: this.exchange_name,
                username: this.exchange_username,
                password: this.exchange_password,
                data: { 
                    symbol: order_info.symbol,
                    price:order_info.price,
                    quantity:orderquantity,
                    stopLoss:stop_loss,
                    profitTarget:profit_target,
                    timeInForce:order_info.time_in_force //check format order_info
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
                    originalInstructionId:order_info.order_id //check format order_info
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

    /**
     * @deprecated LMAX doesn't provide latest trades data
     */
    parse_recent_trades(symbol, djson) {

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
            symbol = this.parse_symbol('api', symbol);
            
            return {
                exchange: this.exchange_name,
                symbol: symbol,
                bid: +djson.data.bid,
                ask: +djson.data.ask,
                socket_id: uuid
            }
        }
        return "NONE"
    }

}