import * as WebSocket from 'ws'

export class ScreenHandler {
	protected wsServer: WebSocket.Server

	constructor(wsServer: WebSocket.Server) {
		this.wsServer = wsServer

		wsServer.on('connection', (ws: WebSocket) => {
			console.log('new screen connection')
		})
	}

	public updateCountdown(countdown: number) {
		this.wsServer.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				this.sendData(client, {
					command: 'timer-update',
					value: countdown,
				})
			}
		})
	}

	protected sendData(client: WebSocket, data: object) {
		client.send(JSON.stringify(data))
	}
}
