;(function() {
	let webSocket: WebSocket
	const $body = document.querySelector('body') as HTMLElement
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
	const positionUploadInterval = 1000 / 30
	let hasMoved = false

	function range(min: number, value: number, max: number) {
		return Math.max(min, Math.min(value, max))
	}

	const throttle = (func: any, limit: number) => {
		let inThrottle: boolean
		return function() {
			const args = arguments
			if (!inThrottle) {
				func.apply(null, args)
				inThrottle = true
				setTimeout(() => (inThrottle = false), limit)
			}
		}
	}

	function onMove(event: PointerEvent) {
		hasMoved = true
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
	const centerOffset = { x: 5, y: -600 }
	const startPosition = { x: 0, y: 0 }

	$playground.addEventListener('pointerdown', (event) => {
		$playground.addEventListener('pointermove', onMove)
		$playground.setPointerCapture(event.pointerId)
		startPosition.x = event.clientX
		startPosition.y = event.clientY
		onMove(event)
		hasMoved = false
		move()
		$body.classList.add('has-interacted')
	})

	$playground.addEventListener('pointerup', (event) => {
		$playground.removeEventListener('pointermove', onMove)
		$playground.releasePointerCapture(event.pointerId)
		direction.x = 0
		direction.y = 0
		sendPosition()
		if (moveTimer) {
			cancelAnimationFrame(moveTimer)
		}
		if (hasMoved === false) {
			flash()
		}
	})
	window.addEventListener('resize', move)

	function sendPosition() {
		send({
			command: 'p',
			value: [
				Math.round(backgroundSize.width / 2 - centerOffset.x),
				Math.round(backgroundSize.height / 2 - centerOffset.y),
			],
		})
	}

	function sendFlash() {
		send({
			command: 'flash',
		})
	}

	function flash() {
		if (!$reflector.classList.contains('is-flashing')) {
			$reflector.classList.add('is-flashing')
			sendFlash()
		}
	}
	$reflector.addEventListener('transitionend', () => {
		$reflector.classList.remove('is-flashing')
	})

	const sendPositionThrottled = throttle(sendPosition, positionUploadInterval)

	function updatePosition() {
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
			y: range(-overlapSize.height / 2, centerOffset.y, overlapSize.height / 2),
		}
		$background.style.transform = `translate(${backgroundOffset.x}px, ${backgroundOffset.y}px)`
		$reflector.style.transform = `translate(${backgroundOffset.x -
			centerOffset.x}px, ${backgroundOffset.y - centerOffset.y}px)`
	}
	updatePosition()

	function move() {
		moveTimer = requestAnimationFrame(() => {
			updatePosition()
			sendPositionThrottled()
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
		const parts = [data.command, ...(data.value || [])]
		webSocket.send(parts.join(':'))
	}
})()
