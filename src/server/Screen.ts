import * as WebSocket from 'ws'
import { Countdown } from './Countdown'
import { ConfigHandler } from './ConfigHandler'

export class Screen {
	protected countdown: Countdown
	protected configHandler: ConfigHandler

	constructor(
		wsClient: WebSocket.Server,
		wsScreen: WebSocket.Server,
		wsConfig: WebSocket.Server
	) {
		this.countdown = new Countdown(this.onCountdownUpdate)
		this.configHandler = new ConfigHandler(wsConfig, this.countdown)
	}

	protected onCountdownUpdate = (countdown: number) => {
		console.log('c', countdown)
	}
}
