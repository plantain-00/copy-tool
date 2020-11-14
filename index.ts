import express from 'express'
import { Server, Socket } from 'socket.io'
import minimist from 'minimist'
import debounce from 'lodash.debounce'
import * as types from './types'

const app = express()
const argv = minimist(process.argv.slice(2)) as unknown as {
  p: number
  h: string
}
const port = argv.p || 8000
const host = argv.h || 'localhost'

app.use(express.static(__dirname + '/static'))

const server = app.listen(port, host, () => {
  console.log(`api Server is listening: ${host}:${port}`)
})

const io = new Server(server)

/**
 * for all sockets, if it joined the room, count it, minus current socket itself
 */
function getClientCount(room: string) {
  let clientCount = 0
  for (const socket of io.sockets.sockets.values()) {
    if (socket.rooms.has(room)) {
      clientCount++
    }
  }
  return clientCount - 1
}

io.on('connection', (socket: Socket) => {
  const room = (socket.handshake.query as { [key: string]: string }).room
  if (!room) {
    socket.disconnect(true)
  } else {
    socket.join(room)

    const sendClientCount: () => void = debounce(() => {
      io.in(room).emit('client_count', {
        clientCount: getClientCount(room)
      })
    }, 300)

    // when a client connected, client count changed, and should broadcast it to all clients in the room.
    sendClientCount()

    socket.on('copy', (data: types.CopyData) => {
      // for all sockets, if it joined the room and not current socket, send the message
      for (const [socketId, s] of io.sockets.sockets.entries()) {
        if (s.rooms.has(room) && socketId !== socket.id) {
          io.in(socketId).emit('copy', data)
        }
      }
      // notify to sender if message is sent successfully
      socket.emit('message_sent', {
        kind: data.kind
      })
    })

    socket.on('offer', (data: types.Description) => {
      const json = {
        sid: socket.id,
        offer: data
      }
      // for all sockets, if it joined the room and not current socket, send the offer
      for (const [socketId, s] of io.sockets.sockets.entries()) {
        if (s.rooms.has(room) && socketId !== socket.id) {
          io.in(socketId).emit('offer', json)
        }
      }
    })

    socket.on('answer', (data: { sid: string; answer: types.Description }) => {
      io.in(data.sid).emit('answer', {
        sid: socket.id,
        answer: data.answer
      })
    })

    // when a client disconnected, client count changed, and should broadcast it to all clients in the room.
    socket.on('disconnect', () => {
      sendClientCount()
    })
  }
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
