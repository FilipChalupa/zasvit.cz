;(function() {
	function formatTimer(countdown: number) {
		const seconds = countdown % 60
		const minutes = Math.floor(countdown / 60)
		return `${minutes}:${seconds > 9 ? seconds : `0${seconds}`}`
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
				rendered: {
					x: number
					y: number
				}
				loopTimer: number
			}
		} = {}
		function addReflector(id: number, x: number, y: number) {
			const $reflector = document.createElement('div')
			$reflectors.appendChild($reflector)
			$reflector.clientHeight // Force reflow
			$reflector.classList.add('is-active')
			reflectors[id] = {
				id,
				$reflector,
				x,
				y,
				rendered: { x, y },
				loopTimer: 0,
			}
			const loop = () => {
				reflectors[id].rendered.x = ease(
					reflectors[id].rendered.x,
					reflectors[id].x
				)
				reflectors[id].rendered.y = ease(
					reflectors[id].rendered.y,
					reflectors[id].y
				)
				reflectors[
					id
				].$reflector.style.transform = `translate(${reflectors[id].rendered.x}px, ${reflectors[id].rendered.y}px)`
				reflectors[id].loopTimer = requestAnimationFrame(loop)
			}
			loop()
		}
		function updateReflector(id: number, x: number, y: number) {
			if (!(id in reflectors)) {
				addReflector(id, x, y)
			} else {
				reflectors[id].x = x
				reflectors[id].y = y
			}
		}
		function removeReflector(id: number) {
			const { $reflector } = reflectors[id]
			cancelAnimationFrame(reflectors[id].loopTimer)
			$reflector.classList.remove('is-active')
			setTimeout(() => {
				$reflector.remove()
			}, 10000)
			delete reflectors[id]
		}

		webSocket.onmessage = (event) => {
			const data = JSON.parse(event.data)
			switch (data.command) {
				case 'timer-update':
					$timer.classList.toggle('is-active', data.value > 0)
					$timer.innerText = formatTimer(data.value)
					break
				case 'reflector-position':
					const [id, x, y] = data.value.split(':')
					updateReflector(id, parseInt(x, 10), parseInt(y, 10))
					break
				case 'reflector-remove':
					removeReflector(data.value)
					break
				case 'involved-duration':
					$body.style.setProperty('--involved-duration', `${data.value}s`)
					break
			}
		}
	}
	init()
})()
