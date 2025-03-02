const dbus = require('dbus-next');
const { EventEmitter } = require('events');

class MprisPlayer2 extends EventEmitter {
  /**
   * @param {string} [serviceName='org.mpris.MediaPlayer2.spotify'] - The DBus service name.
   * @param {string} [objectPath='/org/mpris/MediaPlayer2'] - The object path of the player.
   */
  constructor(serviceName = 'org.mpris.MediaPlayer2.spotify', objectPath = '/org/mpris/MediaPlayer2') {
    super();
    this.serviceName = serviceName;
    this.objectPath = objectPath;
    this.bus = dbus.sessionBus();
    this._initialized = false;
    this.metadata = {};         // Store the current metadata here.
    this.playbackStatus = '';    // Store the current playback state.
    this.init();
  }

  async init() {
    try {
      // Get the proxy object (this triggers introspection)
      this.proxyObject = await this.bus.getProxyObject(this.serviceName, this.objectPath);
      // Get the Player interface (for control methods) and the Properties interface (to read properties and watch changes)
      this.player = this.proxyObject.getInterface('org.mpris.MediaPlayer2.Player');
      this.properties = this.proxyObject.getInterface('org.freedesktop.DBus.Properties');

      // Listen for property changes; specifically, watch the "Position", "Metadata" and "PlaybackStatus" properties
      this.properties.on('PropertiesChanged', (iface, changed, invalidated) => {
        if (iface === 'org.mpris.MediaPlayer2.Player') {
          console.log(changed);
          // Update position
          if (changed.Position) {
            // MPRIS provides Position in microseconds, so convert to milliseconds.
            const positionMs = Number(changed.Position.value) / 1000;
            this.emit('positionChanged', positionMs);
          }
          // Update metadata if changed
          if (changed.Metadata) {
            // The Metadata property is a dictionary.
            this.metadata = changed.Metadata.value;
            let metadataObject = {
              title:
            }
            this.emit('metadataChanged', this.metadata);
          }
          // Update playback status if changed
          if (changed.PlaybackStatus) {
            this.playbackStatus = changed.PlaybackStatus.value;
            this.emit('playbackStateChanged', this.playbackStatus);
          }
        }
      });
      setInterval(async () => {
        try {
          const posVariant = await this.properties.Get('org.mpris.MediaPlayer2.Player', 'Position');
          const newPositionMs = Number(posVariant.value) / 1000;
          if (this.lastPosition !== newPositionMs) {
            this.lastPosition = newPositionMs;
            this.emit('positionChanged', newPositionMs);
          }
        } catch (err) {
          console.error('Error polling position:', err);
        }
      }, 1000);


      this._initialized = true;
      console.log(`MprisPlayer2 initialized for service: ${this.serviceName}`);
    } catch (err) {
      console.error('Failed to initialize MprisPlayer2:', err);
    }
  }

  async play() {
    if (!this._initialized) return;
    try {
      await this.player.Play();
    } catch (err) {
      console.error('Play error:', err);
    }
  }

  async pause() {
    if (!this._initialized) return;
    try {
      await this.player.Pause();
    } catch (err) {
      console.error('Pause error:', err);
    }
  }

  async next() {
    if (!this._initialized) return;
    try {
      await this.player.Next();
    } catch (err) {
      console.error('Next error:', err);
    }
  }

  async previous() {
    if (!this._initialized) return;
    try {
      await this.player.Previous();
    } catch (err) {
      console.error('Previous error:', err);
    }
  }

  /**
   * Sets the playback position to the given absolute position in milliseconds.
   * Internally, this converts the value to microseconds and calls the SetPosition method.
   */
  async seek(positionMs) {
    if (!this._initialized) return;
    try {
      // Convert from milliseconds to microseconds.
      const positionMicro = BigInt(positionMs * 1000);

      // Retrieve the current metadata.
      const metadataVariant = await this.properties.Get('org.mpris.MediaPlayer2.Player', 'Metadata');
      const metadata = metadataVariant.value;
      const trackVariant = metadata['mpris:trackid'];

      // Extract the actual track id string from the Variant.
      const trackId =
        typeof trackVariant === 'object' && trackVariant.value
          ? trackVariant.value
          : trackVariant;

      if (!trackId) {
        throw new Error('TrackID not available in Metadata');
      }

      // Call SetPosition with the trackId and desired position.
      await this.player.SetPosition(trackId, positionMicro);
    } catch (err) {
      console.error('Seek error:', err);
    }
  }
}

module.exports = MprisPlayer2;

