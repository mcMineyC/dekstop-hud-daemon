import MprisPlayer2 from "./MprisPlayer2.js"; // Adjust the path as needed
import { Server } from "socket.io";
import http from 'http';

// Create an HTTP server (which will be used by Socket.io)
const server = http.createServer();
const io = new Server(server);

// Initialize MPRIS Player
const player = new MprisPlayer2('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2');

// Function to start the player and handle server
const startPlayer = async () => {
  await player.init();
  await player.play();
  await player.getMetadata();
  console.log("Starting server");

  // Listen for WebSocket connections
  io.on("connection", (socket) => {
    console.log('Client connected');
    socket.emit('metadata', player.metadata);
    
    const metadataChanged = (metadata) => {
      console.log('Metadata updated:', metadata);
      socket.emit('metadata', metadata);
    };
    
    const positionChanged = (posMs) => {
      console.log('Position updated:', posMs);
      socket.emit('position', posMs);
    };
    
    const playbackStateChanged = (state) => {
      console.log('Playback state updated:', state);
      socket.emit('playbackState', state.toString());
    };
    
    // Register event listeners for player updates
    player.on('positionChanged', positionChanged);
    player.on('metadataChanged', metadataChanged);
    player.on('playbackStateChanged', playbackStateChanged);
    
    // Clean up event listeners when client disconnects
    socket.on('disconnect', () => {
      player.off('positionChanged', positionChanged);
      player.off('metadataChanged', metadataChanged);
      player.off('playbackStateChanged', playbackStateChanged);
    });
  });

  // Start the server to listen on port 3000
  server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
};

// Start the player and server
startPlayer();

