const dbus = require('dbus-next');

(async () => {
  try {
    // Connect to the session bus.
    const bus = dbus.sessionBus();
    // Spotify's MPRIS service name and object path.
    const serviceName = 'org.mpris.MediaPlayer2.spotify';
    const objectPath = '/org/mpris/MediaPlayer2';
    //https://open.spotify.com/track/2v4bGopODBEOQqWzg31R2s?si=cba39106c9e243c8
    
    // Get the proxy object for Spotify.
    const proxyObject = await bus.getProxyObject(serviceName, objectPath);
    // Get the Player interface.
    const player = proxyObject.getInterface('org.mpris.MediaPlayer2.Player');

    // Build the Spotify URI you want to play.
    const spotifyUri = 'spotify:track:2v4bGopODBEOQqWzg31R2s';
    
    // Call the OpenUri method to play the track.
    await player.OpenUri(spotifyUri);
    console.log(`Playing track: ${spotifyUri}`);
  } catch (err) {
    console.error('Error playing track:', err);
  }
})();

