const socket = io();

// ELEMENTS
const usernameInput = document.getElementById("username");
const roomInput = document.getElementById("roomInput");
const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const copyBtn = document.getElementById("copyBtn");

const chatBox = document.getElementById("chatBox");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentRoomId = "";

// --------------------
// CREATE ROOM
// --------------------
createBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter your name");
    return;
  }

  socket.emit("create-room", { username });
});

// --------------------
// JOIN ROOM
// --------------------
joinBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const roomId = roomInput.value.trim();

  if (!username || !roomId) {
    alert("Please enter name and room ID");
    return;
  }

  socket.emit("join-room", { username, roomId });
});

// --------------------
// ROOM CREATED
// --------------------
socket.on("room-created", (roomId) => {
  alert("Room created!\nRoom ID: " + roomId);
  currentRoomId = roomId;

  chatBox.style.display = "block";
  copyBtn.style.display = "block";
});

// --------------------
// ROOM JOINED
// --------------------
socket.on("room-joined", (roomId) => {
  alert("Joined room: " + roomId);
  currentRoomId = roomId;

  chatBox.style.display = "block";
  copyBtn.style.display = "block";
});

// --------------------
// COPY ROOM ID
// --------------------
copyBtn.addEventListener("click", () => {
  if (!currentRoomId) return;

  navigator.clipboard.writeText(currentRoomId);
  alert("Room ID copied!");
});

// --------------------
// SEND MESSAGE
// --------------------
sendBtn.addEventListener("click", sendMessage);

// Enter key se bhi send
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  socket.emit("chat-message", message);
  messageInput.value = "";
}

// --------------------
// RECEIVE CHAT MESSAGE
// --------------------
socket.on("chat-message", (data) => {
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container";
  
  const messageText = document.createElement("p");
  messageText.className = "message";
  messageText.innerText = `${data.username}: ${data.message}`;
  
  const timestamp = document.createElement("span");
  timestamp.className = "message-time";
  timestamp.innerText = data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  messageContainer.appendChild(messageText);
  messageContainer.appendChild(timestamp);
  messagesDiv.appendChild(messageContainer);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// --------------------
// SYSTEM MESSAGE (JOIN / LEAVE)
// --------------------
socket.on("system-message", (msg) => {
  const p = document.createElement("p");
  p.className = "system";
  p.innerText = msg;
  messagesDiv.appendChild(p);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
