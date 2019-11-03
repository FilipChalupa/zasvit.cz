import * as WebSocket from 'ws'
import { ScreenHandler } from './ScreenHandler'

export class ClientHandler {
	protected lastIdAssigned = 0

	constructor(wsServer: WebSocket.Server, screenHandler: ScreenHandler) {
		wsServer.on('connection', (ws: WebSocket) => {
			const id = ++this.lastIdAssigned

			ws.on('message', (message) => {
				const [command, ...value] = message.toString().split(':')
				console.log(message)
				switch (command) {
					case 'p':
						const [x, y] = value.map((k) => parseInt(k, 10))
						console.log(id, 'update position', x, y)
						screenHandler.updateReflector(id, x, y)
						break
				}
			})
		})
	}
}
