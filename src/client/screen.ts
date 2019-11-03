function formatTimer(countdown: number) {
	const seconds = countdown % 60
	const minutes = Math.floor(countdown / 60)
	return `${minutes}:${seconds > 9 ? seconds : `0${seconds}`}`
}

;(function() {
	let webSocket: WebSocket
	const $timer = document.querySelector('.js-timer') as HTMLElement
	const $reflectors = document.querySelector('.js-reflectors') as HTMLElement

	function init() {
		webSocket = new WebSocket(`ws://${location.host}/screen`)

		webSocket.onclose = function() {
			init()
		}

		const reflectors: {
			[key: number]: {
				id: number
				$reflector: HTMLDivElement
				x: number
				y: number
			}
		} = {}
		function addReflector(id: number) {
			const $reflector = document.createElement('div')
			$reflectors.appendChild($reflector)
			requestAnimationFrame(() => {
				$reflector.classList.add('is-active')
			})
			reflectors[id] = {
				id,
				$reflector,
				x: 0,
				y: 0,
			}
		}
		function updateReflector(id: number, x: number, y: number) {
			if (!(id in reflectors)) {
				addReflector(id)
			}

			reflectors[id].x = x
			reflectors[id].y = y
			reflectors[id].$reflector.style.transform = `translate(${x}px, ${y}px)`
		}
		function removeReflector(id: number) {
			const { $reflector } = reflectors[id]
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
					updateReflector(id, x, y)
					break
				case 'reflector-remove':
					removeReflector(data.value)
					break
			}
		}
	}
	init()
})()
