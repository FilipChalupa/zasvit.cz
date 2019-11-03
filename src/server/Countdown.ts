export class Countdown {
	protected elapsedTime = 0
	protected startTime = 0
	protected duration = 0
	protected running = false
	protected timer: NodeJS.Timeout | null = null
	protected onUpdate: (countdown: number) => void

	constructor(onUpdate: (countdown: number) => void) {
		this.onUpdate = onUpdate
	}

	public set(time: number) {
		this.duration = time

		if (this.running === true) {
			this.startTime = new Date().getTime()
			this.elapsedTime = 0
		}
	}

	public stop() {
		if (this.running === false || this.timer === null) {
			return
		}
		clearTimeout(this.timer)
		this.running = false
		this.duration = 0
		this.onUpdate(0)
	}

	public pause() {
		if (this.running === false || this.timer === null) {
			return
		}
		clearTimeout(this.timer)
		this.duration -= this.elapsedTime + 1
		this.running = false
	}

	public start() {
		if (this.running === true || this.duration === 0) {
			return
		}

		this.startTime = new Date().getTime()
		this.elapsedTime = 0
		this.running = true
		this.loop()
	}

	protected loop() {
		const currentTime = new Date().getTime()

		this.elapsedTime = Math.floor((currentTime - this.startTime) / 1000)

		const countdown = this.duration - this.elapsedTime
		if (countdown === 0) {
			this.stop()
		} else {
			this.onUpdate(countdown)
			this.timer = setTimeout(() => {
				this.loop()
			}, 1000 - ((currentTime - this.startTime) % 1000))
		}
	}
}
