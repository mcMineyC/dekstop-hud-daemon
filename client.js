const socket = new WebSocket('ws://localhost:3000');

// On successful connection
socket.onopen = () => {
  console.log('Connected to server');
  socket.send('Hello, server!');
};

// On receiving a message
socket.onmessage = (event) => {
  console.log('Received from server:', event.data);
};

