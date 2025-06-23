const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', ({ signal, to }) => {
    io.to(to).emit('receive-signal', { signal, from: socket.id });
  });

  socket.on('return-signal', ({ signal }) => {
    socket.broadcast.emit('receive-return-signal', { signal });
  });

  socket.on('chat-message', ({ message, from }) => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      io.to(roomId).emit('chat-message', { message, from });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
