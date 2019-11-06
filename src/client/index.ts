;(function() {
	let webSocket: WebSocket
	const $playground = document.querySelector('.js-playground') as HTMLElement
	const $reflector = document.querySelector('.js-reflector') as HTMLElement

	function onMove(event: PointerEvent) {
		const [x, y] = [
			event.clientX - window.innerWidth / 2,
			event.clientY - window.innerHeight / 2,
		]
		$reflector.style.transform = `translate(${x}px, ${y}px)`
		send({
			command: 'p',
			value: [x + 600, y + 960],
		})
	}

	$playground.addEventListener('pointerdown', (event) => {
		$playground.addEventListener('pointermove', onMove)
		$playground.setPointerCapture(event.pointerId)
		onMove(event)
	})

	$playground.addEventListener('pointerup', (event) => {
		$playground.removeEventListener('pointermove', onMove)
		$playground.releasePointerCapture(event.pointerId)
	})

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
		webSocket.send(`${data.command}:${data.value.join(':')}`)
	}
})()
