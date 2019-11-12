import * as WebSocket from 'ws'
import { Countdown } from './Countdown'
import { ScreenHandler } from './ScreenHandler'

export class ConfigHandler {
	constructor(
		wsServer: WebSocket.Server,
		countdown: Countdown,
		updateInvolvedDuration: (duration: number) => void,
		screenHandler: ScreenHandler
	) {
		wsServer.on('connection', (ws: WebSocket) => {
			ws.on('message', (message) => {
				const data = JSON.parse(message.toString())
				switch (data.command) {
					case 'timer-set':
						countdown.set(data.value)
						break
					case 'timer-start':
						countdown.start()
						break
					case 'timer-pause':
						countdown.pause()
						break
					case 'timer-stop':
						countdown.stop()
						break
					case 'involved-duration':
						updateInvolvedDuration(data.value)
						break
					case 'building-visible':
						if (data.value) {
							screenHandler.showBuilding()
						} else {
							screenHandler.hideBuilding()
						}
						break
					case 'building-only':
						if (data.value) {
							screenHandler.showBuildingOnly()
						} else {
							screenHandler.hideBuildingOnly()
						}
						break
				}
			})
		})
	}
}
