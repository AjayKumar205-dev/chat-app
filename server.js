const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let rooms = ['General'];
let users = {};

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            users[socket] = { username: data.username, room: data.room };
            socket.room = data.room;
            broadcastRoomList();
        } else if (data.type === 'message') {
            const timestamp = new Date().toLocaleTimeString();
            const msgData = { type: 'message', username: data.username, message: data.message, timestamp };
            broadcastToRoom(socket.room, msgData);
        } else if (data.type === 'createRoom') {
            rooms.push(data.room);
            broadcastRoomList();
        }
    });

    socket.on('close', () => {
        delete users[socket];
        broadcastRoomList();
    });
});

function broadcastRoomList() {
    const roomListData = { type: 'roomList', rooms };
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(roomListData));
        }
    });
}

function broadcastToRoom(room, msgData) {
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.room === room) {
            client.send(JSON.stringify(msgData));
        }
    });
}