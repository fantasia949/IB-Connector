# IB integration
Interactive brokers integration to sigma exchange API  
This repository is made to test the connection between a nodeJS IB object and Interactive Borkers API.
We want to test if we can send and receive message to IB using a WebSocket connection. 

The files which need to be updated are:  
`main.js`  
 `interactive_brokers.js`

In `interactive_brokers.js`, the goal is to writte the code to create the connection to an HydraX_IB server, where we will handle users requests
`main.js` is the testing file to run so as to test the exchange connector object. 

**The flux is the following:**

1. Create of a nodeJS `ib_connector` object following `lmaxlondon_connector` & `hitbtc_connector` architecture  
2. Create connection between nodeJS exchange object and the HydraX_IB server using WebSocket  
3. NodeJS IB object sends request messages to HydraX_IB server through WebSocket  
4. HydraX_IB server manages messages   
5. HydraX_IB server sends and receives messages to/from IB server (must handle authentication process)
6. HydraX_IB server sends messages back to nodeJS IB object
7. NodeJS IB object parse the result following our format policy and display it in the console

**How to run?**  
When all modification are done, save files then:  

`npm install`  
`npm run start`


### Other info
* **full_intrument**  
*Format:* exchange_name:instrument, in lower case   
Intrument can be a pair: eur/usd, or just an index, a stock, a commodity...  
*Example:* fxcm:eur/usd, lmaxlondon:spx, bitfinex:btc/usd

**Symbol**  
* API: the sigma symnol format  
*Example:* eur/usd, lmaxlondon:spx, bitfinex:btc/usd  
* Exchange: the exchange/broker symbol format  
*Example:* EUR/USD, EUR_USD, SPX, 

**NB:**  
On LMAXLondon example, the watchlist and the orderbook are updated directly in the JAVA server so the answer we got from JAVA server is already updated and can be send to sthe client. The use on this.orderbook and this.watchlist object is not very usefull. 
However for HitBTC example, we only receive updates from the exchange so we need to store the data to be able to update them and after that, send them to client (here display in the console)
