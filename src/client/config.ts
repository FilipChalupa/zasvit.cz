;(function() {
	let webSocket: WebSocket

	const $connectedClients = document.querySelector(
		'.js-connected-clients'
	) as HTMLElement
	const $connectedScreens = document.querySelector(
		'.js-connected-screens'
	) as HTMLElement
	const $connectedConfigs = document.querySelector(
		'.js-connected-configs'
	) as HTMLElement

	function updateCounter($holder: HTMLElement, newValue: number) {
		const oldValue = parseInt($holder.innerText, 10) || 0
		$holder.innerText = newValue.toString()
		$holder.classList.remove('badge-light')
		$holder.classList.remove('badge-success')
		$holder.classList.remove('badge-danger')
		if (newValue < oldValue) {
			$holder.classList.add('badge-danger')
		} else {
			$holder.classList.add('badge-success')
		}
	}

	function init() {
		webSocket = new WebSocket(
			`${location.protocol.replace('http', 'ws')}//${location.host}/config`
		)

		webSocket.onclose = function() {
			init()
		}

		webSocket.onmessage = (event) => {
			const data = JSON.parse(event.data)
			switch (data.command) {
				case 'connected-clients':
					updateCounter($connectedClients, data.value)
					break
				case 'connected-screens':
					updateCounter($connectedScreens, data.value)
					break
				case 'connected-configs':
					updateCounter($connectedConfigs, data.value)
					break
			}
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

	document
		.querySelector('.js-involved-duration-set')!
		.addEventListener('click', () => {
			send({
				command: 'involved-duration',
				value:
					parseInt(
						(document.querySelector(
							'.js-involved-duration-input'
						) as HTMLInputElement).value,
						10
					) || 40,
			})
		})

	document
		.querySelector('.js-building-visible')!
		.addEventListener('change', (event) => {
			// @ts-ignore
			const checked: boolean = event.target.checked
			send({
				command: 'building-visible',
				value: checked,
			})
		})

	document
		.querySelector('.js-building-only')!
		.addEventListener('change', (event) => {
			// @ts-ignore
			const checked: boolean = event.target.checked
			send({
				command: 'building-only',
				value: checked,
			})
		})

	document
		.querySelector('.js-entrance-visible')!
		.addEventListener('change', (event) => {
			// @ts-ignore
			const checked: boolean = event.target.checked
			send({
				command: 'entrance-visible',
				value: checked,
			})
		})
})()
