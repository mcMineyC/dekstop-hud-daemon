import express from "express";
import SpotifyHandler from "./spotify.js";

var clientId = "66579ab838d143adb56a48bde515aca4";
var clientSecret = "4f9fdbead3904dd39e7d9b6dd1eee90c";
const spotifyHandler = new SpotifyHandler(
  clientId,
  clientSecret,
  "http://localhost:8080/callback",
);
await spotifyHandler.initialize();
var app = express();

app.get("/log", (req, res) => res.redirect("/login"));
// app.get("/log", (req, res) => res.send("hi"));
app.get("/error", (req, res) => res.send("There was an error"));

app.get("/login", (req, res) => {
  const userId = "main"; // Get user ID from session
  const authUrl = spotifyHandler.getAuthorizationUrl(userId);
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const userId = await spotifyHandler.handleCallback(code);
    var user = await spotifyHandler.getUserProfile();
    res.send("Logged in as " + user.display_name);
  } catch (error) {
    console.error("Authentication error:", error);
    res.redirect("/error");
  }
});
app.get("/getplaylist", async (req, res) => {
  res.send(await spotifyHandler.getFullPlaylist("7FEeFB1KFRNUWlPKJ8hjH8"));
});
app.get("/getplaylists", async (req, res) => {
  res.send(await spotifyHandler.getUserPlaylists());
});
app.get("/findstuff", async (req, res) => {
  res.send(
    await spotifyHandler.findItems([
      { type: "artist", id: "0LzeyDrlLtuyBqMSBN4z3U" },
    ]),
  );
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
