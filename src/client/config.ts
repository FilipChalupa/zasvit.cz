;(function() {
	let webSocket: WebSocket

	function init() {
		webSocket = new WebSocket(
			`${location.protocol.replace('http', 'ws')}//${location.host}/config`
		)

		webSocket.onclose = function() {
			init()
		}
	}
	init()

	function send(data: any) {
		webSocket.send(JSON.stringify(data))
	}

	;['start', 'pause', 'stop'].forEach((name) => {
		document
			.querySelector(`.js-timer-${name}`)!
			.addEventListener('click', () => {
				send({
					command: `timer-${name}`,
				})
			})
	})

	document.querySelector('.js-timer-set')!.addEventListener('click', () => {
		send({
			command: 'timer-set',
			value:
				parseInt(
					(document.querySelector('.js-timer-input') as HTMLInputElement).value,
					10
				) || 0,
		})
	})
})()
