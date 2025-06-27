const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Serve your static files (index.html, style.css, script.js, bingo data) from `/public`
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room by ID
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room: ${roomId}`);
  });

  // When a tile is clicked, broadcast to the room
  socket.on('tile-clicked', ({ roomId, tileId }) => {
    socket.to(roomId).emit('update-tile', { tileId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
