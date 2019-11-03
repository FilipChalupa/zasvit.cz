import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'

const app = express()

app.use(express.static('dist/client'))
app.use(express.static('src/client'))

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws: WebSocket) => {
	ws.on('message', (message: string) => {
		console.log('received: %s', message)
		ws.send(`Hello, you sent -> ${message}`)
	})

	ws.send('Hi there, I am a WebSocket server')
})

server.listen(process.env.PORT || 8999, () => {
	console.log(
		// @ts-ignore
		`Server started on port ${server.address().port}`
	)
})
