;(function() {
	let webSocket: WebSocket
	const backgroundSize = {
		width: 1200,
		height: 1920,
	}
	const position = { x: 600, y: 1560 }
	const direction = { x: 0, y: -1 }
	const positionUploadInterval = 1000 / 10
	const maxSpeed = 4

	const $body = document.querySelector('body') as HTMLElement

	function range(min: number, value: number, max: number) {
		return Math.max(min, Math.min(value, max))
	}

	const sendPosition = (x: number, y: number) => {
		send({
			command: 'p',
			value: [Math.round(x), Math.round(y)],
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

	function loop() {
		setTimeout(loop, positionUploadInterval)
		const maxDiff = (1000 / positionUploadInterval) * maxSpeed
		position.x += direction.x * maxDiff
		position.y += direction.y * maxDiff
		if (position.x > backgroundSize.width) {
			direction.x = -1
			direction.y = Math.random() < 0.5 ? 1 : -1
		} else if (position.x < 0) {
			direction.x = 1
			direction.y = Math.random() < 0.5 ? 1 : -1
		} else if (position.y > backgroundSize.height) {
			direction.y = -1
			direction.x = 0
		} else if (position.y < 0) {
			direction.y = 1
			direction.x = Math.random() < 0.5 ? 1 : -1
		}
		position.x = range(0, position.x, backgroundSize.width)
		position.y = range(0, position.y, backgroundSize.height)
		sendPosition(position.x, position.y)

		$body.innerText = `x: ${position.x}, y: ${position.y}`
	}
	loop()
})()
