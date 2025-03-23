import { Server } from "socket.io";
import http from "http";
import EventEmitter from "events";
import MdnsService from "./mdns.js"; // Import the MdnsService from the original code

// Get port from command line argument or use default 3001
const port = process.argv[2] ? parseInt(process.argv[2]) : 3001;

// Define the service with the specified port
const service = {
  name: "dekstop-hud.player",
  friendlyName: "Mock Player on mock-server",
  port: port,
};

// Create and advertise the mDNS service
const mdns = new MdnsService(service);
mdns.advertise();
console.log(
  `Advertising mDNS service: ${service.name} on port ${service.port}`,
);

// Create a mock player that emits events like the real one
class MockPlayer extends EventEmitter {
  constructor() {
    super();
    this.metadata = {
      title: "Mock Song Title",
      album: "Mock Album",
      artist: "Mock Artist",
      imageUrl: "https://example.com/mock-album-art.jpg",
      length: { value: 180, unit: "s" },
      trackId: "track1",
    };
    this.playbackStatus = "Playing";
    this.position = 0;
    this.lastPosition = 0;
    this.startTime = Date.now();
    this.playing = true;

    // Update position every second if playing
    setInterval(() => {
      if (this.playing) {
        const elapsed = Date.now() - this.startTime;
        this.position =
          (this.position + elapsed) % (this.metadata.length.value * 1000);
        this.startTime = Date.now();

        if (this.position !== this.lastPosition) {
          this.lastPosition = this.position;
          this.emit("positionChanged", this.position);
        }
      }
    }, 500);

    // Change song every 20 seconds
    setInterval(() => {
      this.next();
    }, 20000);
  }

  async init() {
    // Mock implementation - already initialized
    this._initialized = true;
    return Promise.resolve();
  }

  async play() {
    this.playbackStatus = "Playing";
    this.playing = true;
    this.startTime = Date.now();
    this.emit("playbackStateChanged", this.playbackStatus);
    console.log("Play command received");
    return true;
  }

  async pause() {
    this.playbackStatus = "Paused";
    this.playing = false;
    this.emit("playbackStateChanged", this.playbackStatus);
    console.log("Pause command received");
    return true;
  }

  async next() {
    // Create a new mock song
    const songs = [
      "Summer Vibes",
      "Winter Blues",
      "Autumn Leaves",
      "Spring Forward",
      "Midnight Drive",
      "Morning Coffee",
      "Sunset Dreams",
      "Dawn Chorus",
    ];
    const artists = [
      "The Mocking Birds",
      "Dummy Data",
      "Test Track",
      "Mock Artists",
      "Placeholder Band",
      "The Simulators",
      "Virtual Sound",
      "Fake Records",
    ];
    const albums = [
      "Greatest Hits",
      "New Release",
      "Timeless Collection",
      "First Album",
      "The Mockup",
      "Testing 123",
      "Demo Tracks",
      "Sample Songs",
    ];

    const trackId = `track${Math.floor(Math.random() * 1000)}`;
    const songLength = 120 + Math.floor(Math.random() * 240); // 2-6 minutes in seconds

    this.metadata = {
      title: songs[Math.floor(Math.random() * songs.length)],
      artist: artists[Math.floor(Math.random() * artists.length)],
      album: albums[Math.floor(Math.random() * albums.length)],
      imageUrl: `https://picsum.photos/seed/${Date.now()}/300/300`,
      length: { value: songLength, unit: "s" },
      trackId: trackId,
    };
    this.position = 0;
    this.lastPosition = 0;
    this.startTime = Date.now();

    this.emit("metadataChanged", this.metadata);
    this.emit("positionChanged", this.position);
    console.log(
      `Next track: "${this.metadata.title}" by ${this.metadata.artist}`,
    );
    return true;
  }

  async previous() {
    // Just simulate going to previous track with another random track
    this.next();
    console.log("Previous track");
    return true;
  }

  async seek(positionMs) {
    this.position = positionMs;
    this.lastPosition = positionMs;
    this.startTime = Date.now();
    this.emit("positionChanged", this.position);
    console.log(`Seek to ${positionMs}ms`);
    return true;
  }

  async getMetadata() {
    return this.metadata;
  }

  async getPlaybackStatus() {
    return this.playbackStatus;
  }

  async getPosition() {
    if (this.playing) {
      const elapsed = Date.now() - this.startTime;
      this.position =
        (this.position + elapsed) % (this.metadata.length.value * 1000);
      this.startTime = Date.now();
    }
    return this.position;
  }

  async getPlaybackState() {
    return this.playbackStatus;
  }
}

// Create an HTTP server (which will be used by Socket.io)
const server = http.createServer();
const io = new Server(server);

// Initialize Mock Player
const player = new MockPlayer();
player.init(); // Initialize the mock player

console.log(`Starting mock server on port ${port}...`);

// Listen for WebSocket connections
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("metadata", player.metadata);
  socket.emit("playbackState", player.playbackStatus);
  socket.emit("position", player.position);

  const metadataChanged = (metadata) => {
    console.log("Metadata updated:", metadata.title, "by", metadata.artist);
    socket.emit("metadata", metadata);
  };

  const positionChanged = (posMs) => {
    socket.emit("position", posMs);
  };

  const playbackStateChanged = (state) => {
    console.log("Playback state updated:", state);
    socket.emit("playbackState", state.toString());
  };

  // Register event listeners for player updates
  player.on("positionChanged", positionChanged);
  player.on("metadataChanged", metadataChanged);
  player.on("playbackStateChanged", playbackStateChanged);

  socket.on("play", async () => await player.play());
  socket.on("pause", async () => await player.pause());
  socket.on("next", async () => await player.next());
  socket.on("previous", async () => await player.previous());
  socket.on("seek", async (positionMs) => await player.seek(positionMs));
  socket.on("getMetadata", async () => {
    const metadata = await player.getMetadata();
    socket.emit("metadata", metadata);
  });
  socket.on("getPosition", async () => {
    const position = await player.getPosition();
    socket.emit("position", position);
  });
  socket.on("getPlaybackState", async () => {
    const state = await player.getPlaybackStatus();
    socket.emit("playbackState", state);
  });
  socket.on("friendlyName", () => socket.emit("friendlyName", service.friendlyName));

  // Handle mDNS service additions just like the original
  socket.on("mdns:add", (service) => {
    try {
      mdns.addService(service);
      console.log("Added new mDNS service:", service);
      socket.emit("mdns:done", true);
    } catch (e) {
      console.error("Error adding mDNS service:", e);
      socket.emit("mdns:error", e.message);
    }
  });

  // Clean up event listeners when client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    player.off("positionChanged", positionChanged);
    player.off("metadataChanged", metadataChanged);
    player.off("playbackStateChanged", playbackStateChanged);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Mock server is running on http://0.0.0.0:${port}`);
  console.log(
    `Currently playing: "${player.metadata.title}" by ${player.metadata.artist}`,
  );
});

// Cleanup mDNS on exit
process.on("SIGINT", () => {
  console.log("Shutting down mock server...");
  mdns.stop();
  process.exit();
});
