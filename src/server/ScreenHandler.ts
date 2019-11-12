import * as WebSocket from 'ws'

export class ScreenHandler {
	protected wsServer: WebSocket.Server
	protected reflectors: {
		[key: number]: {
			id: number
			x: number
			y: number
		}
	} = {}

	constructor(wsServer: WebSocket.Server) {
		this.wsServer = wsServer

		wsServer.on('connection', (ws: WebSocket) => {
			console.log('new screen connection')
		})
	}

	public flashReflector = (id: number) => {
		this.broadcast({
			command: 'flash',
			value: id,
		})
	}

	public updateInvolvedDuration = (duration: number) => {
		this.broadcast({
			command: 'involved-duration',
			value: duration,
		})
	}

	public updateCountdown(countdown: number) {
		this.broadcast({
			command: 'timer-update',
			value: countdown,
		})
	}

	public removeReflector(id: number) {
		this.broadcast({
			command: 'reflector-remove',
			value: id,
		})
		delete this.reflectors[id]
	}

	public updateReflector(id: number, x: number, y: number) {
		if (!(id in this.reflectors)) {
			this.addReflector(id)
		}

		this.reflectors[id].x = x
		this.reflectors[id].y = y
		this.broadcast({
			command: 'position',
			value: [id, x, y].join(':'),
		})
	}

	protected addReflector(id: number) {
		this.reflectors[id] = {
			id,
			x: 0,
			y: 0,
		}
	}

	protected broadcast(data: any) {
		this.wsServer.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				this.sendData(client, data)
			}
		})
	}

	protected sendData(client: WebSocket, data: any) {
		client.send(JSON.stringify(data))
	}
}
