const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const users = new Map();
const messages = []; // In-memory store for messages

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Auto-generate profile for the new user
  const user = {
    id: socket.id,
    name: `User-${socket.id.substring(0, 4).toUpperCase()}`,
    avatar: `https://picsum.photos/seed/${socket.id}/200`,
    isOnline: true,
    lastActive: Date.now(),
  };

  users.set(socket.id, user);

  // Send the active users list to everyone
  io.emit('users-list', Array.from(users.values()));

  // Send user's previous message history
  const userMessages = messages.filter(m => m.senderId === socket.id || m.targetUserId === socket.id);
  socket.emit('chat-history', userMessages);

  // Listen for private messages
  socket.on('send-message', (data) => {
    const messageData = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      text: data.text,
      senderId: socket.id,
      targetUserId: data.targetUserId,
      timestamp: new Date().toISOString(),
      status: 'sent', // 'sent' | 'delivered' | 'seen'
    };
    
    messages.push(messageData);

    // Send only to intended recipient
    io.to(data.targetUserId).emit('receive-message', messageData);
    
    // Echo back to sender for optimistic UI rendering / confirmation
    socket.emit('message-sent', messageData);
  });

  // Handle message being delivered to the intended device
  socket.on('mark-delivered', (messageId) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg && msg.status === 'sent') {
      msg.status = 'delivered';
      // Notify sender that message has been delivered
      io.to(msg.senderId).emit('message-status-update', { id: messageId, targetUserId: msg.targetUserId, status: 'delivered' });
    }
  });

  // Handle message being read/seen by the user
  socket.on('mark-seen', (messageId) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg && msg.status !== 'seen') {
      msg.status = 'seen';
      // Notify sender that message has been seen
      io.to(msg.senderId).emit('message-status-update', { id: messageId, targetUserId: msg.targetUserId, status: 'seen' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const u = users.get(socket.id);
    if (u) {
      u.isOnline = false;
      u.lastActive = Date.now();
      // Broadcast updated user presence
      io.emit('users-list', Array.from(users.values()));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running internally on http://localhost:${PORT}`);
});
