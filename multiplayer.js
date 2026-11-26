{
const $ = id => document.getElementById(id);
const socket = io();
const views = ["vHome", "vLobby", "vRace", "vResults"];
let me = null;     // socket.id once connected
let lobby = null;  // last lobby:state from the server
let race = null;   // {passage, startsAt, progress:{[id]:{wi,wpm}}}

socket.on("connect", () => { me = socket.id; });

function show(view) {
  // TO_DO: toggle hidden on each id in views so only `view` is visible
}

// ---------- home ----------
function playerName() {
  // TO_DO: read/trim $("nameIn"), persist in localStorage ("vt:mpName"), show error in homeMsg if empty
}

$("createBtn").addEventListener("click", () => {
  // TO_DO: socket.emit("lobby:create", {name, private:true}, ack) -> on ack.error show homeMsg
});

$("joinForm").addEventListener("submit", e => {
  e.preventDefault();
  // TO_DO: socket.emit("lobby:join", {code:$("codeIn").value, name}, ack)
});

$("quickBtn").addEventListener("click", () => {
  // TO_DO: socket.emit("lobby:quick", {name}, ack)
});

// TO_DO: support invite links (multiplayer.html#CODE) -> prefill codeIn / auto-join

// ---------- lobby ----------
socket.on("lobby:state", state => {
  // TO_DO: store in `lobby`, render code, player list (mark host and "you"), "n / 6 players"
  // TO_DO: enable settings + start button only for the host; reflect state.settings in the selects
  // TO_DO: show("vLobby") unless a race is in progress
});

$("trSel").addEventListener("change", sendSettings);
$("lenSel").addEventListener("change", sendSettings);
function sendSettings() {
  // TO_DO: socket.emit("lobby:settings", {tr, len})
}

$("startBtn").addEventListener("click", () => socket.emit("race:start"));
$("leaveBtn").addEventListener("click", () => {
  // TO_DO: socket.emit("lobby:leave"), reset lobby/race, show("vHome")
});

// ---------- race ----------
socket.on("race:countdown", ({ startsAt, passage }) => {
  // TO_DO: set up `race`, render one progress track per player, show("vRace")
  // TO_DO: count down to startsAt (correct for clock skew, e.g. send server time too), then unlock typing
});

socket.on("race:progress", ({ id, wi, wpm }) => {
  // TO_DO: update that player's track width (wi / word count) and wpm label
});

function onWordTyped(wi) {
  // TO_DO: called by the typing engine after each correct word -> socket.emit("race:progress", {wi})
}

function onFinished(result) {
  // TO_DO: called by the typing engine at the end -> socket.emit("race:finish", {wpm, acc, time})
}

socket.on("race:end", ({ standings }) => {
  // TO_DO: render standings (place, name, wpm, acc), show("vResults")
});

$("backLobbyBtn").addEventListener("click", () => show("vLobby"));

socket.on("disconnect", () => {
  // TO_DO: show a "connection lost" message; socket.io auto-reconnects but the server will have dropped us from the lobby
});
}
