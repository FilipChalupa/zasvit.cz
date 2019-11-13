import * as WebSocket from 'ws'
import { Countdown } from './Countdown'
import { ConfigHandler } from './ConfigHandler'
import { ScreenHandler } from './ScreenHandler'
import { ClientHandler } from './ClientHandler'

export class App {
	protected countdown: Countdown
	protected configHandler: ConfigHandler
	protected screenHandler: ScreenHandler
	protected clientHandler: ClientHandler

	constructor(
		wsClient: WebSocket.Server,
		wsScreen: WebSocket.Server,
		wsConfig: WebSocket.Server
	) {
		this.countdown = new Countdown(this.onCountdownUpdate)
		this.screenHandler = new ScreenHandler(wsScreen)
		this.clientHandler = new ClientHandler(wsClient, this.screenHandler)
		this.configHandler = new ConfigHandler(
			wsConfig,
			this.countdown,
			this.screenHandler.updateInvolvedDuration,
			this.screenHandler,
			wsScreen,
			wsClient
		)
	}

	protected onCountdownUpdate = (countdown: number) => {
		this.screenHandler.updateCountdown(countdown)
	}
}
