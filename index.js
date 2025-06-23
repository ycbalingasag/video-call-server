// ✅ server/index.js (Node.js backend)
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    console.log(`🔗 ${socket.id} joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', ({ signal, to }) => {
    io.to(to).emit('receive-signal', { signal, from: socket.id });
  });

  socket.on('return-signal', ({ signal, to }) => {
    io.to(to).emit('receive-return-signal', { signal, from: socket.id });
  });

  socket.on('chat-message', ({ message, from }) => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      io.to(roomId).emit('chat-message', { message, from });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
