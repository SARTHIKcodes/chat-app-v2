const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// serve frontend files
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // --------------------
  // CREATE ROOM
  // --------------------
  socket.on("create-room", ({ username }) => {
    const roomId = Math.random().toString(36).substring(2, 8);

    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    console.log(`${username} created room ${roomId}`);

    socket.emit("room-created", roomId);

    // system message
    io.to(roomId).emit(
      "system-message",
      `${username} joined the room`
    );
  });

  // --------------------
  // JOIN ROOM
  // --------------------
  socket.on("join-room", ({ username, roomId }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    console.log(`${username} joined room ${roomId}`);

    socket.emit("room-joined", roomId);

    // system message
    io.to(roomId).emit(
      "system-message",
      `${username} joined the room`
    );
  });

  // --------------------
  // CHAT MESSAGE
  // --------------------
  socket.on("chat-message", (message) => {
    if (!socket.roomId) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    io.to(socket.roomId).emit("chat-message", {
      username: socket.username,
      message: message,
      timestamp: timestamp,
    });
  });

  // --------------------
  // DISCONNECT
  // --------------------
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.roomId && socket.username) {
      io.to(socket.roomId).emit(
        "system-message",
        `${socket.username} left the room`
      );
    }
  });
});

// start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
