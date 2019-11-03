import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
import * as url from 'url'
import { Screen } from './Screen'

console.log('Starting server')

const app = express()

app.use(express.static('dist/client'))
app.use(express.static('src/client'))

const server = http.createServer(app)

const wsClient = new WebSocket.Server({ noServer: true })
const wsScreen = new WebSocket.Server({ noServer: true })
const wsConfig = new WebSocket.Server({ noServer: true })

new Screen(wsClient, wsScreen, wsConfig)

server.on('upgrade', (request, socket, head) => {
	const pathname = url.parse(request.url).pathname

	if (pathname === '/client') {
		wsClient.handleUpgrade(request, socket, head, function done(ws) {
			wsClient.emit('connection', ws, request)
		})
	} else if (pathname === '/screen') {
		wsScreen.handleUpgrade(request, socket, head, function done(ws) {
			wsScreen.emit('connection', ws, request)
		})
	} else if (pathname === '/config') {
		wsConfig.handleUpgrade(request, socket, head, function done(ws) {
			wsConfig.emit('connection', ws, request)
		})
	} else {
		socket.destroy()
	}
})

server.listen(process.env.PORT || 8999, () => {
	console.log(
		// @ts-ignore
		`Server started on port ${server.address().port}`
	)
})
