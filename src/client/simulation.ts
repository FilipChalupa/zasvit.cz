;(function() {
	let webSocket: WebSocket
	const backgroundSize = {
		width: 1200,
		height: 1920,
	}
	const positionUploadInterval = 1000 / 30

	const sendPosition = (x: number, y: number) => {
		send({
			command: 'p',
			value: [x, y],
		})
	}

	function init() {
		webSocket = new WebSocket(
			`${location.protocol.replace('http', 'ws')}//${location.host}/client`
		)

		webSocket.onclose = function() {
			init()
		}
	}
	init()

	function send(data: any) {
		const parts = [data.command, ...(data.value || [])]
		webSocket.send(parts.join(':'))
	}

	const loop = () => {
		setTimeout(loop, positionUploadInterval)
		sendPosition(
			Math.round(Math.random() * backgroundSize.width),
			Math.round(Math.random() * backgroundSize.height)
		)
	}
	loop()
})()
