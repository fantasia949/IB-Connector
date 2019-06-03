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
                return symbol.replace.toLowerCase().split(':')[1]
            case 'exchange':
                return symbol.toUpperCase().split(':')[1];
        }
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
                return 
            case 'watchlist':
                return
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
    parse_data(intent, uuid, symbol, message) {
        var djson = JSON.parse(data);
        switch(intent){
            case 'recent_trades':
                return this.parse_recent_trades(full_instrument, djson,uuid)
            case 'orderbook':
                return this.parse_orderbook(full_instrument, djson)
            case 'watchlist':
                return this.parse_watchlist(full_instrument, djson)
        }
    }


    parse_recent_trades(symbol, djson) {
        return 
    }

    parse_orderbook(symbol, uuid, djson){
      return
    }


    parse_watchlist(symbol, uuid, djson){
      return
    }

}