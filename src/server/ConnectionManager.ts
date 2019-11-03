import * as WebSocket from 'ws'

export class ConnectionManager {
	constructor(wsServer: WebSocket.Server) {
		wsServer.on('connection', (ws: WebSocket) => {
			console.log('New connection')

			// @TODO: ping in interval (https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4)

			ws.on('message', (message: string) => {
				console.log('new message', message)
			})
		})
	}
}
