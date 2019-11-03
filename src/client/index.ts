const $playground = document.querySelector('.js-playground') as HTMLElement
const $reflector = document.querySelector('.js-reflector') as HTMLElement

function onMove(event: PointerEvent) {
	const [x, y] = [event.clientX, event.clientY]
	$reflector.style.transform = `translate(${x}px, ${y}px)`
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
