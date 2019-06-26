import websocket_connection_manager from './websocket_connection_manager'

export default class lmaxlondon_connector {
    constructor(){
        this.exchange_name = "lmaxlondon";

        // Websocket Endpoint
        this.stream_end_point = "wss://websockettest.hydrax.io/";  //Java LMAX server
        this.fix_stream_end_point = "wss://javafix.hydrax.io/"; //FIX server

        this.websocket_connection_manager = new websocket_connection_manager();

        this.orderbook = {} 
        this.watchlist= {} 
        this.recent_trades = {} //not supported by LMAX


        this.exchange_username = "hydraxdemo";
        this.exchange_password = "hailHydracq%f";
    }

    subscribe(intent, uuid, info){
        switch(intent){
            case 'watchlist':
            case 'orderbook':
            case 'recent_trades':
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
                break
        }
        
    }
    unsubscribe(uuid, intent){
          // Undefine data values 
        switch(intent){
            case 'orderbook':
                this.orderbook[symbol] = undefined
                break
            case 'watchlist':
                this.w_orderbook[symbol] = undefined
                break
        }
        return this.websocket_connection_manager.unsubscribe(uuid)
    }

    get_stream(intent, symbol){
        switch(intent){
            case 'orderbook':
            case 'watchlist':
                return this.stream_end_point;
            case 'recent_trades':
                return 'Error: LMAX API does not provide these data'
        }
    }

    parse_symbol(intent, symbol){
        switch(intent){
            case 'api':
                return symbol.toLowerCase().split(':')[1]
            case 'exchange':
                return symbol.toUpperCase().split(':')[1];
        }
    }

    /*
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
            case 'orderbook:orderBookData':
                return this.parse_orderbook(symbol, uuid, djson)
            case 'watchlist:watchListData':
                return this.parse_watchlist(symbol, uuid, djson)
           case 'orderbook:error':
            case 'watchlist:error':
                return this.parse_error(intent, djson)
        }
    }

    parse_error(intent, djson){
        return djson
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
            this.orderbook[symbol] = {
                bid:bidArray,
                ask:askArray
            }
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
            this.watchlist[symbol] = {
                bid:+djson.data.bid,
                ask:+djson.data.ask
            }
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
