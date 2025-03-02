const dbus = require("dbus-next");
const { default: SpotifyHandler } = require("./spotify.js");
var clientId = "66579ab838d143adb56a48bde515aca4";
var clientSecret = "4f9fdbead3904dd39e7d9b6dd1eee90c";

(async () => {
  try {
    console.log(SpotifyHandler);
    const spotifyApi = new SpotifyHandler(
      clientId,
      clientSecret,
      "http://localhost:8080/callback",
    );
    // Connect to the session bus.
    const bus = dbus.sessionBus();
    // Spotify's MPRIS service name and object path.
    const serviceName = "org.mpris.MediaPlayer2.spotify";
    const objectPath = "/org/mpris/MediaPlayer2";
    //https://open.spotify.com/track/2v4bGopODBEOQqWzg31R2s?si=cba39106c9e243c8

    // Get the proxy object for Spotify.
    const proxyObject = await bus.getProxyObject(serviceName, objectPath);
    // Get the Player interface.
    const player = proxyObject.getInterface("org.mpris.MediaPlayer2.Player");
    await spotifyApi.initialize();

    // Build the Spotify URI you want to play.
    const spotifyUri = "spotify:artist:2o5jDhtHVPhrJdv3cEQ99Z";

    // Call the OpenUri method to play the track.
    await player.OpenUri(spotifyUri);
    console.log(`Playing track: ${spotifyUri}`);
  } catch (err) {
    console.error("Error playing track:", err);
  }
})();
