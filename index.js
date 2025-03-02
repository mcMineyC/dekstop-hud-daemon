import MprisPlayer2 from "./MprisPlayer2.js"; // Adjust the path as needed
import { Server } from "socket.io";
const io = new Server({});

const player = new MprisPlayer2('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2');

// Listen for position changes
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
    socket.emit('playbackState', state);
  };
  //
  //Listen for position changes
  player.on('positionChanged', positionChanged);
  // Listen for metadata changes
  player.on('metadataChanged', metadataChanged);
  // Listen for playback state changes
  player.on('playbackStateChanged', playbackStateChanged);

  socket.on('disconnect', () => {
    player.off('positionChanged', positionChanged);
    player.off('metadataChanged', metadataChanged);
    player.off('playbackStateChanged', playbackStateChanged);
  });
});


// Control playback
  await player.init();
  await player.play();
  await player.getMetadata();
  console.log("Starting server")
  io.listen(3000);
  // Wait a moment, then seek to 30 seconds (30000 ms) and pause
  //setTimeout(async () => {
  //  await player.seek(30000);
  //  await player.pause();
  //}, 5000);

