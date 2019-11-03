function formatTimer(countdown: number) {
	const seconds = countdown % 60
	const minutes = Math.floor(countdown / 60)
	return `${minutes}:${seconds > 9 ? seconds : `0${seconds}`}`
}

;(function() {
	let webSocket: WebSocket
	const timer = document.querySelector('.js-timer') as HTMLElement

	function init() {
		webSocket = new WebSocket(`ws://${location.host}/screen`)

		webSocket.onclose = function() {
			init()
		}

		webSocket.onmessage = (event) => {
			const data = JSON.parse(event.data)
			switch (data.command) {
				case 'timer-update':
					timer.innerText = formatTimer(data.value)
					break
			}
		}
	}
	init()
})()
