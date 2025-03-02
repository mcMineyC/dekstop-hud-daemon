import { WebSocketServer } from 'ws';

// Create WebSocket server on port 3000
const wss = new WebSocketServer({ port: 3000 });

// Handle incoming connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');

  // Handle messages received from the client
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Echo the message back to the client
    ws.send(`You said: ${message}`);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:3000');

