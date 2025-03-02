import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;

void main() {
  // Create a WebSocket client
  var socket = IO.io('http://localhost:3000', IO.OptionBuilder()
    .setTransports(['websocket']) // Use WebSocket transport
    .build());

  // Connect to the server
  socket.on('connect', (_) {
    print('Connected to WebSocket server');
  });

  // Listen for 'metadata' events from the server
  socket.on('metadata', (data) {
    print('Received Metadata: $data');
  });

  // Listen for 'position' events from the server
  socket.on('position', (data) {
    print('Received Position: $data ms');
  });

  // Listen for 'playbackState' events from the server
  socket.on('playbackState', (data) {
    print('Received Playback State: $data');
  });

  // Send a message back to the server (optional)
  socket.emit('message', 'Hello from Dart client!');

  // Handle WebSocket disconnect
  socket.on('disconnect', (_) {
    print('Disconnected from WebSocket server');
  });
}

