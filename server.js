const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const lobbies = require("./lobby");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ALLOWED = new Set(["/index.html", "/multiplayer.html", "/multiplayer.js", "/kjv.js", "/bsb.js", "/web.js", "/asv.js"]);

// Only serve the app files, never server.js, package.json, or .git.
app.use((req, res, next) => {
  const p = req.path === "/" ? "/index.html" : req.path;
  if (!ALLOWED.has(p)) return next();
  res.set("Cache-Control", "public, max-age=3600");
  res.sendFile(path.join(ROOT, p));
});

app.use((req, res) => res.status(404).send("Not found"));

lobbies.attach(io);

server.listen(PORT, () => console.log(`bibletyper listening on port ${PORT}`));
