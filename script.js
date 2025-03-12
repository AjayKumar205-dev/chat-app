//const socket = new WebSocket('ws://localhost:3000');
const socket = new WebSocket('wss://chat-app-production-1d3f.up.railway.app');
const roomsList = document.getElementById('rooms');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message');
const createRoomButton = document.getElementById('create-room');
const newRoomInput = document.getElementById('new-room');

let currentRoom = 'General';
let username = prompt("Enter your username:");

socket.onopen = () => {
    console.log('Connected to the server');
    socket.send(JSON.stringify({ type: 'join', room: currentRoom, username }));
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
        displayMessage(data);
    } else if (data.type === 'roomList') {
        updateRoomList(data.rooms);
    }
};

sendMessageButton.onclick = () => {
    const message = messageInput.value;
    if (message) {
        socket.send(JSON.stringify({ type: 'message', room: currentRoom, username, message }));
        messageInput.value = '';
    }
};

createRoomButton.onclick = () => {
    const newRoom = newRoomInput.value;
    if (newRoom) {
        socket.send(JSON.stringify({ type: 'createRoom', room: newRoom }));
        newRoomInput.value = '';
    }
};

function displayMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.username}: ${data.message} (${data.timestamp})`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the bottom
}

function updateRoomList(rooms) {
    roomsList.innerHTML = '';
    rooms.forEach(room => {
        const roomElement = document.createElement('li');
        roomElement.textContent = room;
        roomElement.onclick = () => {
            currentRoom = room;
            socket.send(JSON.stringify({ type: 'join', room, username }));
        };
        roomsList.appendChild(roomElement);
    });
}