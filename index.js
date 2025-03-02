const MprisPlayer2 = require('./MprisPlayer2'); // Adjust the path as needed

const player = new MprisPlayer2('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2');

// Listen for position changes
player.on('positionChanged', (posMs) => {
  console.log('Current position (ms):', posMs);
});

// Listen for metadata changes
player.on('metadataChanged', (metadata) => {
  console.log('Metadata updated:', metadata);
});

// Listen for playback state changes
player.on('playbackStateChanged', (state) => {
  console.log('Playback state changed to:', state);
});

// Control playback
(async () => {
  await player.play();
  // Wait a moment, then seek to 30 seconds (30000 ms) and pause
  setTimeout(async () => {
    await player.seek(30000);
    await player.pause();
  }, 5000);
})();

