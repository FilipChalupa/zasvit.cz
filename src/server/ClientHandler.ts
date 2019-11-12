import * as WebSocket from 'ws'
import { ScreenHandler } from './ScreenHandler'

export class ClientHandler {
	protected lastIdAssigned = 0

	constructor(wsServer: WebSocket.Server, screenHandler: ScreenHandler) {
		wsServer.on('connection', (ws: WebSocket) => {
			const id = ++this.lastIdAssigned

			ws.on('message', (message) => {
				const [command, ...value] = message.toString().split(':')
				switch (command) {
					case 'p':
						const [x, y] = value.map((k) => parseInt(k, 10))
						screenHandler.updateReflector(id, x, y)
						break
					case 'flash':
						screenHandler.flashReflector(id)
						break
				}
			})

			ws.on('close', () => {
				screenHandler.removeReflector(id)
			})
		})
	}
}
