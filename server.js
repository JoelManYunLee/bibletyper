const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ALLOWED = new Set(["/index.html", "/kjv.js", "/bsb.js", "/web.js", "/asv.js"]);

// Only serve the app files, never server.js, package.json, or .git.
app.use((req, res, next) => {
  const p = req.path === "/" ? "/index.html" : req.path;
  if (!ALLOWED.has(p)) return next();
  res.set("Cache-Control", "public, max-age=3600");
  res.sendFile(path.join(ROOT, p));
});

app.use((req, res) => res.status(404).send("Not found"));

app.listen(PORT, () => console.log(`bibletyper listening on port ${PORT}`));
