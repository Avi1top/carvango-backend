import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const WebSocketTest = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:3001"); // Connect to the backend server

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("newOrder", (order) => {
      console.log("New order received:", order);
      setOrders((prevOrders) => [...prevOrders, order]); // Update orders list
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Live Orders</h2>
      <ul>
        {orders.map((order, index) => (
          <li key={index}>{JSON.stringify(order)}</li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketTest;
