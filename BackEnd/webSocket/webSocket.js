const socketIo = require("socket.io");

const initWebSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3002", // Adjust based on your frontend's location
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Listen for orderPlaced event from the frontend
    socket.on("orderPlaced", (orderData) => {
      // Save orderData to database (you can call a function here to handle this)

      // Broadcast the new order to all connected clients
      io.emit("newOrder", orderData);
    });

    socket.on("disconnect", () => {
      // Client disconnected
    });
  });
};

module.exports = initWebSocket;
