const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow multiple origins
      methods: ['GET', 'POST'],
      credentials: true, // Optional, if you are using cookies or authentication
    },
  });

const connectedUsers = {}; // To map therapist and patient connections

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a join room event
  socket.on('joinRoom', ({ roomId, userType }) => {
    socket.join(roomId);
    console.log(`${userType} joined room ${roomId}`);
  });

  // Listen for chat messages
  socket.on('sendMessage', ({ roomId, message, sender }) => {
    io.to(roomId).emit('receiveMessage', { message, sender });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
