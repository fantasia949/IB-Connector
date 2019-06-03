import websocket_connection_manager from './websocket_connection_manager'
import _ from 'lodash'

const orderBookDepth = 500;

export default class hitbtc_connector {
    constructor(){
        this.exchange_name = "hitbtc";
        // Websocket Endpoint
        this.stream_end_point = "wss://api.hitbtc.com/api/2/ws"

        this.websocket_connection_manager = new websocket_connection_manager()

        this.orderbook = {};
        this.watchlist = {};
        this.recent_trades = {};
    }



    subscribe(intent, uuid, info){
        let symbol = info['symbol']

        var socket = this.websocket_connection_manager.subscribe(
            uuid,
            [
                this.get_stream(intent, info),
                {}
            ],
            () => {
                socket.send(this.get_subscribe_info(intent, info))
            },
            (event) => {
                try{
                    let data =  this.parse_data(intent, uuid, info, event.data)
                    console.log(data)
                    if (data !== "NONE")
                        console.log(data)
                } catch (error) {
                    console.log(error)
                }
            },
            ()=>{console.log('Disconnected: ', uuid)},
            (e)=>{'Error: '+ uuid +'\n' + console.log(e)}
        )
    }

    unsubscribe(uuid, intent){
        // Undefine data values 
        switch(intent){
            case 'orderbook':
                this.orderbook[symbol] = undefined
                break
            case 'watchlist':
                this.watchlist[symbol] = undefined
                break
            case 'recent_trades':
                this.recent_trades[symbol] = undefined
                break
        }
        
        return this.websocket_connection_manager.unsubscribe(uuid)
    }

    parse_symbol(intent, full_instrument){
        switch(intent){
            case 'api':
                return full_instrument.toLowerCase().split(':')[1]
            case 'exchange':
                return full_instrument.replace('/', '').toUpperCase().split(':')[1]
            case 'ccxt':   
                return full_instrument.toUpperCase().split(':')[1]
        }
    }

    get_stream(intent, symbol){
        switch(intent){
            case 'recent_trades':
                return this.stream_end_point;
            case 'orderbook':
                return this.stream_end_point;            
            case 'watchlist':
                return this.stream_end_point;            
        }
    }

    get_subscribe_info(intent, symbol){
        symbol = this.parse_symbol('exchange', symbol)
        switch(intent){
            case 'recent_trades':
                return JSON.stringify({
                    method: 'subscribeTrades',
                    params: { symbol: symbol},
                    id: '50'
                });
            case 'orderbook':
                return JSON.stringify({
                    method: 'subscribeOrderbook',
                    params: { symbol: symbol},
                    id: '50'
                });
            case 'watchlist':
                return JSON.stringify({
                    method: 'subscribeOrderbook',
                    params: { symbol: symbol},
                    id: '50'
                });
        }
    }

    parse_data(intent, uuid, full_instrument, data){
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

    parse_recent_trades(full_instrument, djson,uuid){
        let symbol = this.parse_symbol('api',full_instrument)
        if (djson.method == "snapshotTrades"){
            if(this.recent_trades[symbol] === undefined) this.recent_trades[symbol] = []
            if(djson.params && djson.params.data){
                for (let d of djson.params.data){
                    let side = (d.side === 'buy')? true : false
                    this.recent_trades[symbol].unshift({
                        time: new Date(d.timestamp).getTime(),
                        price: d.price,
                        quantity: d.quantity, 
                        is_buy: side
                    })
                }    
                return {
                    exchange: full_instrument.split(':')[0],
                    symbol: symbol,
                    trades: this.recent_trades[symbol].slice(0,30),
                }
            }
        }
        if(djson.method == "updateTrades" ){
            if(djson.params && djson.params.data && this.recent_trades[symbol]!==undefined){
                var timestr = djson.params.data[0].timestamp;
                var dot = timestr.indexOf(".");
                timestr = timestr.substring(0,dot)+"Z";
                var dateObj = new Date(timestr);
                var isbuy = (djson.params.data[0].side == "sell") ? false : true
                try {
                    this.recent_trades[symbol].unshift({
                        time: dateObj.getTime(),
                        price: djson.params.data[0].price,
                        quantity: djson.params.data[0].quantity,
                        is_buy: isbuy
                    })
                    return {
                        exchange: this.exchange_name,
                        symbol: this.parse_symbol('api', full_instrument),
                        trades: this.recent_trades[symbol].slice(0,30),
                    }
                } catch(e) {
                    return 'NONE'
                } 
            } else {
                return "NONE"
            }            
        }
       
    }
    
    parse_orderbook(full_instrument, djson){
        let symbol = this.parse_symbol('api',full_instrument)
        var buyArray = [];
        var askArray = [];
        if(djson.params !== undefined){
            for(var i=0; i < djson.params.ask.length && i < orderBookDepth; i++){
                askArray.push({
                    price: +djson.params.ask[i].price,
                    quantity: +djson.params.ask[i].size
                });    
            }
            for(var i=0; i < djson.params.bid.length && i < orderBookDepth; i++){
                buyArray.push({
                    price: +djson.params.bid[i].price,
                    quantity: +djson.params.bid[i].size
                });  
            }

            if(djson.method === 'snapshotOrderbook') {
                if(this.orderbook[symbol] === undefined) this.orderbook[symbol] = {bid: [], ask:[]}

                this.orderbook[symbol].bid = buyArray;
                this.orderbook[symbol].ask = askArray
                return {
                    exchange: this.exchange_name,
                    symbol: symbol,
                    bid: this.orderbook[symbol].bid.slice(0,30),
                    ask: this.orderbook[symbol].ask.slice(0,30),
                }
            } else if(this.orderbook[symbol] !== undefined){
                try{
                    this.orderbook[symbol] = this.update_orderbook(askArray, buyArray,this.orderbook[symbol])
                    return {
                        exchange: this.exchange_name,
                        symbol: symbol,
                        bid: this.orderbook[symbol].bid.slice(0,30),
                        ask: this.orderbook[symbol].ask.slice(0,30),
                    }
                } catch(e) {
                    return 'NONE'
                }
                
            }
        }
        return "NONE"
    }



    parse_watchlist(full_instrument, djson){
        let symbol = this.parse_symbol('api',full_instrument)
        var buyArray = [];
        var askArray = [];
        if(djson.params !== undefined){
            for(var i=0; i < djson.params.ask.length && i < orderBookDepth; i++){
                askArray.push({
                    price: +djson.params.ask[i].price,
                    quantity: +djson.params.ask[i].size
                });    
            }
            for(var i=0; i < djson.params.bid.length && i < orderBookDepth; i++){
                buyArray.push({
                    price: +djson.params.bid[i].price,
                    quantity: +djson.params.bid[i].size
                });  
            }

            if(djson.method === 'snapshotOrderbook') {
                if(this.watchlist[symbol] === undefined) this.watchlist[symbol] = {bid: [], ask:[]}
                this.watchlist[symbol].bid = buyArray.slice(0,25);
                this.watchlist[symbol].ask = askArray.slice(0,25)
                return {
                    exchange: this.exchange_name,
                    symbol: symbol,
                    bid: this.watchlist[symbol].bid[0].price,
                    ask: this.watchlist[symbol].ask[0].price
                }
            } else if(this.watchlist[symbol] !== undefined) {
                try{ 
                    this.watchlist[symbol] = this.update_orderbook(askArray, buyArray,this.watchlist[symbol])
                    return {
                        exchange: this.exchange_name,
                        symbol: symbol,
                        bid: this.watchlist[symbol].bid[0].price,
                        ask: this.watchlist[symbol].ask[0].price
                }
                } catch(e) {
                    console.log(e)
                    return 'NONE'
                }
            }
        }
        return "NONE"
    }



    update_orderbook(ask_array, bid_array, book) {
        //   console.log(JSON.stringify(book))
        let updated_orderbook = book
        if(ask_array.length>0) {
            for(let aa of ask_array){
                if(aa.quantity === 0) {
                    let index = updated_orderbook.ask.findIndex(row =>row.price === aa.price )
                    updated_orderbook.ask.splice(index,1)
                } else {
                    let index = updated_orderbook.ask.findIndex(row =>row.price === aa.price )
                    if(index !== -1) {
                        updated_orderbook.ask[index].quantity = aa.quantity
                    } else {
                        updated_orderbook.ask.push(aa)
                    }
                }
            }
        } 
        if (bid_array.length > 0) {
            for(let bb of bid_array){
                if(bb.quantity === 0) {
                    let index = updated_orderbook.bid.findIndex(row =>row.price ===bb.price )
                    updated_orderbook.bid.splice(index,1)
                } else {
                let index = updated_orderbook.bid.findIndex(row =>row.price ===bb.price )
                    if(index !== -1) {
                        updated_orderbook.bid[index].quantity = bb.quantity
                    } else {
                        updated_orderbook.bid.push(bb)
                        // update rrtrackign odne on client side
                    }
                }
            }
        }
    
        updated_orderbook.bid=_.orderBy(updated_orderbook.bid, "price","desc");
        updated_orderbook.ask=_.orderBy(updated_orderbook.ask, "price");
    
        return updated_orderbook
    }

}