import * as WebSocket from 'ws'
import { Countdown } from './Countdown'
import { ConfigHandler } from './ConfigHandler'
import { ScreenHandler } from './ScreenHandler'

export class App {
	protected countdown: Countdown
	protected configHandler: ConfigHandler
	protected screenHandler: ScreenHandler

	constructor(
		wsClient: WebSocket.Server,
		wsScreen: WebSocket.Server,
		wsConfig: WebSocket.Server
	) {
		this.countdown = new Countdown(this.onCountdownUpdate)
		this.configHandler = new ConfigHandler(wsConfig, this.countdown)
		this.screenHandler = new ScreenHandler(wsScreen)
	}

	protected onCountdownUpdate = (countdown: number) => {
		this.screenHandler.updateCountdown(countdown)
		console.log('c', countdown)
	}
}
