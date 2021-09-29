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

	public setReflectorColor = (id: number, color: number) => {
		console.log('broadcast', id, color)
		this.broadcast({
			command: 'color',
			value: [id, color].join(':'),
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

	public showBuilding() {
		this.broadcast({
			command: 'building-show',
		})
	}

	public hideBuilding() {
		this.broadcast({
			command: 'building-hide',
		})
	}

	public showBuildingOnly() {
		this.broadcast({
			command: 'building-only',
			value: true,
		})
	}

	public hideBuildingOnly() {
		this.broadcast({
			command: 'building-only',
			value: false,
		})
	}

	public showEntrance() {
		this.broadcast({
			command: 'entrance-show',
		})
	}

	public hideEntrance() {
		this.broadcast({
			command: 'entrance-hide',
		})
	}

	public restartInvolved() {
		this.broadcast({
			command: 'involved-restart',
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
