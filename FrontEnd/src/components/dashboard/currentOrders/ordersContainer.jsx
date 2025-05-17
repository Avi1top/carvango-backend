import React, { useState, useEffect } from "react";
import { Grid, Typography, Modal, Box, Button } from "@mui/material";
import OrdersTab from "./ordersTab";
import "./ordersContainer.css";
import io from "socket.io-client"; // Import socket.io-client

const socket = io("http://localhost:3001"); // Replace with your backend WebSocket URL

const ContainerOrders = () => {
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Listen for 'newOrder' event from WebSocket server
    socket.on("newOrder", (order) => {
      setIncomingOrders((prevOrders) => [...prevOrders, order]);
    });

    // Cleanup WebSocket connection when component unmounts
    return () => {
      socket.off("newOrder");
    };
  }, []);

  const handleAccept = (order) => {
    setSelectedOrder(order);
    setIncomingOrders(incomingOrders.filter((o) => o.id !== order.id));
  };

  const handleTimeSelection = (time) => {
    const order = selectedOrder;
    setSelectedOrder(null);

    // Set the deadline and initial remaining time
    const deadline = new Date(new Date().getTime() + time * 60000);
    const orderWithTimer = { ...order, time, deadline, remainingTime: time };

    // Add order to acceptedOrders with timer
    setAcceptedOrders([...acceptedOrders, orderWithTimer]);

    // Start the countdown
    const intervalId = setInterval(() => {
      const now = new Date();
      const timeLeft = Math.round((deadline - now) / 60000); // Time left in minutes

      if (timeLeft <= 0) {
        clearInterval(intervalId);
        alert(`Order ${order.id} is overdue!`);
        // Handle overdue logic here if needed
      }

      // Update the order's remaining time in state
      setAcceptedOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === order.id
            ? { ...o, remainingTime: timeLeft > 0 ? timeLeft : 0 }
            : o
        )
      );
    }, 1000); // Update every minute
  };

  return (
    <div className="orders-container">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <div className="incoming-orders">
            <Typography variant="h4">Incoming Orders</Typography>
            {incomingOrders.map((order) => (
              <OrdersTab key={order.id} order={order} onAccept={handleAccept} />
            ))}
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className="accepted-orders">
            <Typography variant="h4">Accepted Orders</Typography>
            {acceptedOrders.map((order) => (
              <OrdersTab key={order.id} order={order} />
            ))}
          </div>
        </Grid>
      </Grid>

      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        BackdropProps={{
          style: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box className="time-selection-container">
          <Box className="order-details">
            {selectedOrder && <OrdersTab order={selectedOrder} />}
          </Box>
          <Box className="time-selection-modal">
            <Box className="modal-content">
              <Typography variant="h6" align="center">
                How many minutes do you need to prepare the order?
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                You will be reminded based on this.
              </Typography>
              <div className="time-buttons">
                <Button onClick={() => handleTimeSelection(0)}>
                  Start now
                </Button>
                <Button onClick={() => handleTimeSelection(10)}>10 min</Button>
                <Button onClick={() => handleTimeSelection(15)}>15 min</Button>
                <Button onClick={() => handleTimeSelection(20)}>20 min</Button>
                <Button onClick={() => handleTimeSelection(25)}>25 min</Button>
                <Button onClick={() => handleTimeSelection(30)}>30 min</Button>
                <Button onClick={() => handleTimeSelection(45)}>45 min</Button>
                <Button onClick={() => handleTimeSelection(60)}>60 min</Button>
              </div>
              <Button onClick={() => setSelectedOrder(null)} color="secondary">
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ContainerOrders;
