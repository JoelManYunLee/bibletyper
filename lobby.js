// Multiplayer lobbies, kept in memory (lost on restart).
//
// Client -> server                         Server -> client
//   lobby:create  {name, private}  ack       lobby:state   {code, private, hostId, settings, players, status}
//   lobby:join    {code, name}     ack       race:countdown {startsAt, passage}
//   lobby:quick   {name}           ack       race:progress  {id, wi, wpm}
//   lobby:leave                              race:end       {standings}
//   lobby:settings {tr, len}  (host)
//   race:start                (host)
//   race:progress {wi}
//   race:finish   {wpm, acc, time}

const MAX_PLAYERS = 6;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LEN = 5;

// code -> {code, private, hostId, settings:{tr,len}, players:Map<socketId,{name,wi,wpm,finished}>, status:"waiting"|"countdown"|"racing"}
const lobbies = new Map();

function attach(io) {
  io.on("connection", socket => {
    socket.on("lobby:create", (opts, ack) => createLobby(io, socket, opts, ack));
    socket.on("lobby:join", (opts, ack) => joinLobby(io, socket, opts, ack));
    socket.on("lobby:quick", (opts, ack) => quickPlay(io, socket, opts, ack));
    socket.on("lobby:leave", () => leaveLobby(io, socket));
    socket.on("lobby:settings", opts => updateSettings(io, socket, opts));
    socket.on("race:start", () => startRace(io, socket));
    socket.on("race:progress", data => reportProgress(io, socket, data));
    socket.on("race:finish", data => finishRace(io, socket, data));
    socket.on("disconnect", () => leaveLobby(io, socket));
  });
}

function newCode() {
  // TO_DO: build a CODE_LEN string from random CODE_CHARS (crypto.randomInt)
  // TO_DO: retry while lobbies.has(code)
}

function createLobby(io, socket, opts, ack) {
  // TO_DO: validate/trim opts.name (non-empty, max ~20 chars); ack({error}) if bad
  // TO_DO: leaveLobby() first if socket is already in a lobby
  // TO_DO: build lobby {code:newCode(), private:!!opts.private, hostId:socket.id, settings:{tr:"kjv",len:"medium"}, players:new Map(), status:"waiting"}
  // TO_DO: add the player, lobbies.set(), socket.join(code), socket.data.code = code
  // TO_DO: ack({code}) then broadcastState(io, lobby)
}

function joinLobby(io, socket, opts, ack) {
  // TO_DO: normalise opts.code (uppercase, strip spaces) and look it up; ack({error:"no such lobby"}) if missing
  // TO_DO: reject if players.size >= MAX_PLAYERS or status !== "waiting"
  // TO_DO: validate name, de-duplicate against names already in the lobby
  // TO_DO: add player, socket.join(code), socket.data.code = code, ack({code}), broadcastState()
}

function quickPlay(io, socket, opts, ack) {
  // TO_DO: find a lobby with !private, status "waiting" and players.size < MAX_PLAYERS
  // TO_DO: if found -> joinLobby(); otherwise createLobby() with private:false
}

function leaveLobby(io, socket) {
  // TO_DO: look up lobby via socket.data.code; return if none
  // TO_DO: remove player, socket.leave(code), delete socket.data.code
  // TO_DO: if lobby empty -> lobbies.delete(code) and return
  // TO_DO: if the host left -> hand host to the next player in insertion order
  // TO_DO: if racing and every remaining player finished -> endRace(); else broadcastState()
}

function updateSettings(io, socket, opts) {
  // TO_DO: host-only and status "waiting"
  // TO_DO: whitelist tr (kjv|bsb|web|asv for now) and len (short|medium|long)
  // TO_DO: broadcastState()
}

function startRace(io, socket) {
  // TO_DO: host-only, status "waiting", at least 1 player (2 for public lobbies?)
  // TO_DO: pick a passage on the server so everyone types the same text (see pickPassage)
  // TO_DO: reset each player's wi/wpm/finished, status = "countdown"
  // TO_DO: io.to(code).emit("race:countdown", {startsAt: Date.now() + 3000, passage})
  // TO_DO: setTimeout -> status = "racing"; also start a max-duration timer that calls endRace()
}

function pickPassage(settings) {
  // TO_DO: load <tr>.js once per translation (files set window.VT_DATA; run them with vm and a fake window)
  // TO_DO: port randomPassage()/label() from index.html (or move them to a shared module both sides load)
  // TO_DO: return {label, text, tr}
}

function reportProgress(io, socket, data) {
  // TO_DO: only while racing; clamp data.wi to [0, passage word count]; ignore if it goes backwards
  // TO_DO: compute wpm server-side from elapsed time so clients can't fake it
  // TO_DO: throttle, then socket.to(code).emit("race:progress", {id: socket.id, wi, wpm})
}

function finishRace(io, socket, data) {
  // TO_DO: mark player finished with place = number already finished + 1, store wpm/acc/time
  // TO_DO: if every player finished -> endRace()
}

function endRace(io, lobby) {
  // TO_DO: clear timers, build standings (finished by place, then unfinished by wi)
  // TO_DO: io.to(code).emit("race:end", {standings}); status = "waiting"; broadcastState()
}

function broadcastState(io, lobby) {
  // TO_DO: io.to(lobby.code).emit("lobby:state", {...}) with players as an array of {id,name,isHost}
}

module.exports = { attach, MAX_PLAYERS };
