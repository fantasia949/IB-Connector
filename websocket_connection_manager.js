import WebSocket from 'ws'

export default class websocket_connection_manager {
	subscribe(uuid, url, on_open, on_message, on_close, on_error){
		// Initialize Socket
		let socket = Object.entries(url[1]).length === 0 ?  new WebSocket(url[0]) : new WebSocket(url[0], url[1])
		// Assign callback functions to socket methods
		socket.onopen = on_open
		socket.onmessage = on_message
		socket.onclose = on_close
		socket.onerror = on_error   

		return socket;
	}

	unsubscribe(socket){
		try{
			socket.close()
			return true
		} catch (e) {
			return false
		}
    }
}
    
