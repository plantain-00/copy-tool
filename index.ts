import * as express from "express";
import * as socketIO from "socket.io";
import * as minimist from "minimist";
import * as debounce from "lodash.debounce";
import * as types from "./types";

const app = express();
const argv = minimist(process.argv.slice(2));
const port = argv.p || 8000;
const host = argv.h || "localhost";

app.use(express.static(__dirname + "/static"));

const server = app.listen(port, host, () => {
    // tslint:disable-next-line:no-console
    console.log(`api Server is listening: ${host}:${port}`);
});

const io = socketIO(server);

/**
 * for all sockets, if it joined the room, count it, minus current socket itself
 */
function getClientCount(room: string) {
    let clientCount = 0;
    for (const socketId in io.sockets.sockets) {
        if (io.sockets.sockets.hasOwnProperty(socketId)) {
            const rooms = io.sockets.sockets[socketId].rooms;
            if (rooms[room] !== undefined) {
                clientCount++;
            }
        }
    }
    return clientCount - 1;
}

io.on("connection", socket => {
    const room = socket.handshake.query.room;
    if (!room) {
        socket.disconnect(true);
    } else {
        socket.join(room);

        const sendClientCount: () => void = debounce(() => {
            io.in(room).emit("client_count", {
                clientCount: getClientCount(room),
            });
        }, 300);

        // when a client connected, client count changed, and should broadcast it to all clients in the room.
        sendClientCount();

        socket.on("copy", (data: types.CopyData) => {
            // for all sockets, if it joined the room and not current socket, send the message
            for (const socketId in io.sockets.sockets) {
                if (io.sockets.sockets.hasOwnProperty(socketId)) {
                    const rooms = io.sockets.sockets[socketId].rooms;
                    if (rooms[room] !== undefined
                        && socketId !== socket.id) {
                        io.in(socketId).emit("copy", data);
                    }
                }
            }
            // notify to sender if message is sent successfully
            socket.emit("message_sent", {
                kind: data.kind,
            });
        });

        socket.on("offer", (data: types.Desciprtion) => {
            const json = {
                sid: socket.id,
                offer: data,
            };
            // for all sockets, if it joined the room and not current socket, send the offer
            for (const socketId in io.sockets.sockets) {
                if (io.sockets.sockets.hasOwnProperty(socketId)) {
                    const rooms = io.sockets.sockets[socketId].rooms;
                    if (rooms[room] !== undefined
                        && socketId !== socket.id) {
                        io.in(socketId).emit("offer", json);
                    }
                }
            }
        });

        socket.on("answer", (data: { sid: string; answer: types.Desciprtion }) => {
            io.in(data.sid).emit("answer", {
                sid: socket.id,
                answer: data.answer,
            });
        });

        // when a client disconnected, client count changed, and should broadcast it to all clients in the room.
        socket.on("disconnect", () => {
            sendClientCount();
        });
    }
});
