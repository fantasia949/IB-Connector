import lmaxlondon_connector from './lmaxlondon'
import hitbtc_connector from './hitbtc'
import ib_connector from './interactive_brokers'


let lmaxlondon = new lmaxlondon_connector();
let hitbtc = new hitbtc_connector()
let ib = new ib_connector();


//lmaxlondon.subscribe('watchlist', 'socket_id', 'lmaxlondon:eur/usd');
//hitbtc.subscribe('watchlist', 'socket','hitbtc:ltc/btc')


