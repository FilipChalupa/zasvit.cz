;(function() {
	function formatTimer(countdown: number) {
		const seconds = countdown % 60
		const minutes = Math.floor(countdown / 60)
		return `${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}

	let webSocket: WebSocket
	const $timer = document.querySelector('.js-timer') as HTMLElement
	const $reflectors = document.querySelector('.js-reflectors') as HTMLElement
	const $body = document.querySelector('body') as HTMLElement

	function init() {
		webSocket = new WebSocket(
			`${location.protocol.replace('http', 'ws')}//${location.host}/screen`
		)

		webSocket.onclose = function() {
			init()
		}

		function ease(current: number, target: number) {
			return current + (target - current) / 20 // @TODO: based on speed
		}

		const reflectors: {
			[key: number]: {
				id: number
				$reflector: HTMLDivElement
				x: number
				y: number
				angle: number
				color: number
				rendered: {
					x: number
					y: number
					angle: number
				}
				loopTimer: number
			}
		} = {}

		function addReflector(id: number, x: number, y: number) {
			const $reflector = document.createElement('div')
			const $reflectorIn = document.createElement('div')
			$reflectors.appendChild($reflector)
			$reflector.appendChild($reflectorIn)
			$reflector.clientHeight // Force reflow
			$reflector.classList.add('is-active')
			$reflector.addEventListener('transitionend', () => {
				$reflector.classList.remove('is-flashing')
			})
			reflectors[id] = {
				id,
				$reflector,
				x,
				y,
				angle: -90,
				rendered: { x, y, angle: -90 },
				loopTimer: 0,
				color: 0,
			}
			const loop = () => {
				reflectors[id].rendered.angle = ease(
					reflectors[id].rendered.angle,
					reflectors[id].angle
				)
				reflectors[id].rendered.x = ease(
					reflectors[id].rendered.x,
					reflectors[id].x
				)
				reflectors[id].rendered.y = ease(
					reflectors[id].rendered.y,
					reflectors[id].y
				)
				reflectors[id].$reflector.style.transform = `translate(${
					reflectors[id].rendered.x
				}px, ${reflectors[id].rendered.y}px) rotate(${reflectors[id].rendered
					.angle + 90}deg)`
				reflectors[id].loopTimer = requestAnimationFrame(loop)
			}
			loop()
		}
		function createIfNewReflector(id: number, x = 0, y = 0) {
			if (!(id in reflectors)) {
				addReflector(id, x, y)
			}
		}

		function updateReflector(id: number, x: number, y: number) {
			createIfNewReflector(id, x, y)

			if (
				Math.abs(reflectors[id].x - x) > 1 ||
				Math.abs(reflectors[id].y - y) > 1
			) {
				reflectors[id].angle =
					(Math.atan2(y - reflectors[id].y, x - reflectors[id].x) * 180) /
					Math.PI
				const angleDifference =
					reflectors[id].rendered.angle - reflectors[id].angle
				if (Math.abs(angleDifference) > 180) {
					reflectors[id].angle += 360 * Math.round(angleDifference / 360)
				}
			}

			reflectors[id].x = x
			reflectors[id].y = y
		}
		function removeReflector(id: number) {
			if (!(id in reflectors)) {
				return
			}
			const { $reflector } = reflectors[id]
			cancelAnimationFrame(reflectors[id].loopTimer)
			$reflector.classList.remove('is-active')
			setTimeout(() => {
				$reflector.remove()
			}, 10000)
			delete reflectors[id]
		}

		function flashReflector(id: number) {
			createIfNewReflector(id)
			if (!reflectors[id].$reflector.classList.contains('is-flashing')) {
				reflectors[id].$reflector.classList.add('is-flashing')
			}
		}

		function setColor(id: number, color: number) {
			createIfNewReflector(id)
			reflectors[id].color = color
			reflectors[id].$reflector.style.setProperty('--hue-rotate', `${color}deg`)
		}

		webSocket.onmessage = (event) => {
			const data = JSON.parse(event.data)
			switch (data.command) {
				case 'timer-update':
					$timer.classList.toggle('is-active', data.value > 0)
					$timer.innerText = formatTimer(data.value)
					break
				case 'position': {
					const [id, x, y] = data.value.split(':')
					updateReflector(id, parseInt(x, 10), parseInt(y, 10))
					break
				}
				case 'color': {
					const [id, color] = data.value.split(':')
					setColor(id, parseInt(color))
					break
				}
				case 'flash':
					flashReflector(data.value)
					break
				case 'reflector-remove':
					removeReflector(data.value)
					break
				case 'involved-duration':
					$body.style.setProperty('--involved-duration', `${data.value}s`)
					break
				case 'building-show':
					$body.classList.add('is-buildingVisible')
					break
				case 'building-hide':
					$body.classList.remove('is-buildingVisible')
					break
				case 'entrance-show':
					$body.classList.add('is-entranceVisible')
					break
				case 'entrance-hide':
					$body.classList.remove('is-entranceVisible')
					break
				case 'building-only':
					if (data.value) {
						$body.classList.add('is-buildingOnly')
					} else {
						$body.classList.remove('is-buildingOnly')
					}
					break
				case 'involved-restart':
					$body.classList.toggle('is-involvedRestart')
					break
			}
		}
	}
	init()

	const toggleFlashWarning = () => {
		if ($body.classList.contains('is-flashWarning')) {
			setTimeout(() => {
				$body.classList.remove('is-flashWarning')
				toggleFlashWarning()
			}, 5000)
		} else {
			setTimeout(() => {
				$body.classList.add('is-flashWarning')
				toggleFlashWarning()
			}, 14000)
		}
	}
	toggleFlashWarning()
})()
