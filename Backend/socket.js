let io;

module.exports = {
  init: (server, clientUrl) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: clientUrl,
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Admin panel joins a room to receive all order events
      socket.on('join-admin-room', () => {
        socket.join('admin-room');
      });

      // Customer joins a room scoped to their own order to receive status updates
      socket.on('join-order-room', (orderId) => {
        socket.join(`order-${orderId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized. Call init() first.');
    return io;
  },
};