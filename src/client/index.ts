;(function() {
	let webSocket: WebSocket
	const $playground = document.querySelector('.js-playground') as HTMLElement
	const $reflector = document.querySelector('.js-reflector') as HTMLElement
	const $background = document.querySelector('.js-background') as HTMLElement

	let moveTimer: null | number = null
	const backgroundSize = {
		width: 1200,
		height: 1920,
	}
	const maxSpeed = 4
	const speedDumper = 50

	function range(min: number, value: number, max: number) {
		return Math.max(min, Math.min(value, max))
	}

	function onMove(event: PointerEvent) {
		direction.x = range(
			-maxSpeed,
			(event.clientX - startPosition.x) / speedDumper,
			maxSpeed
		)
		direction.y = range(
			-maxSpeed,
			(event.clientY - startPosition.y) / speedDumper,
			maxSpeed
		)
	}

	const direction = { x: 0, y: 0 }
	const centerOffset = { x: 0, y: 0 }
	const startPosition = { x: 0, y: 0 }

	$playground.addEventListener('pointerdown', (event) => {
		$playground.addEventListener('pointermove', onMove)
		$playground.setPointerCapture(event.pointerId)
		startPosition.x = event.clientX
		startPosition.y = event.clientY
		onMove(event)
		move()
	})

	$playground.addEventListener('pointerup', (event) => {
		$playground.removeEventListener('pointermove', onMove)
		$playground.releasePointerCapture(event.pointerId)
		direction.x = 0
		direction.y = 0
		if (moveTimer) {
			window.cancelAnimationFrame(moveTimer)
		}
	})
	window.addEventListener('resize', move)

	function move() {
		moveTimer = requestAnimationFrame(() => {
			const viewRect = $playground.getBoundingClientRect()
			const viewSize = {
				width: viewRect.width,
				height: viewRect.height,
			}
			const overlapSize = {
				width: Math.max(0, backgroundSize.width - viewSize.width),
				height: Math.max(0, backgroundSize.height - viewSize.height),
			}
			centerOffset.x = range(
				-backgroundSize.width / 2,
				centerOffset.x - direction.x,
				backgroundSize.width / 2
			)
			centerOffset.y = range(
				-backgroundSize.height / 2,
				centerOffset.y - direction.y,
				backgroundSize.height / 2
			)
			const backgroundOffset = {
				x: range(-overlapSize.width / 2, centerOffset.x, overlapSize.width / 2),
				y: range(
					-overlapSize.height / 2,
					centerOffset.y,
					overlapSize.height / 2
				),
			}
			$background.style.transform = `translate(${backgroundOffset.x}px, ${backgroundOffset.y}px)`
			$reflector.style.transform = `translate(${backgroundOffset.x -
				centerOffset.x}px, ${backgroundOffset.y - centerOffset.y}px)`

			send({
				command: 'p',
				value: [
					backgroundSize.width / 2 - centerOffset.x,
					backgroundSize.height / 2 - centerOffset.y,
				],
			})
			move()
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
		webSocket.send(`${data.command}:${data.value.join(':')}`)
	}
})()
