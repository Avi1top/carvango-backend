// OrdersTab.js
import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import CircularProgressWithLabel from "./CircularProgressWithLabel"; // Adjust the import path as needed

const OrdersTab = ({ order, onAccept }) => {
  const progress =
    order.remainingTime > 0 ? (order.remainingTime / order.time) * 100 : 0;

  return (
    <Card className="MuiCard-root">
      <CardContent className="MuiCardContent-root">
        <Box display="flex" alignItems="center">
          <Typography
            variant="h5"
            className="MuiTypography-h5"
            style={{ flexGrow: 1 }}
          >
            #{order.id} {order.customerName}
          </Typography>
          <CircularProgressWithLabel
            value={progress}
            label={order.remainingTime}
          />
        </Box>
        <Typography variant="subtitle1" className="MuiTypography-subtitle1">
          {order.phoneNumber}
        </Typography>
        <Typography variant="body2" className="MuiTypography-body2">
          {order.scheduledTime}
        </Typography>
        <Typography
          variant="subtitle1"
          color="textSecondary"
          className="MuiTypography-subtitle1"
        >
          Items:
        </Typography>
        {order.items.map((item, index) => (
          <Typography
            key={index}
            variant="body2"
            className="MuiTypography-body2"
          >
            {item.quantity} x {item.name}
          </Typography>
        ))}
        <Typography variant="h6" className="MuiTypography-h6">
          Total: {order.total}
        </Typography>
        <Typography variant="body2" className="MuiTypography-body2">
          Delivery Method: {order.deliveryMethod}
        </Typography>
        {onAccept && (
          <Button
            variant="contained"
            color="primary"
            className="MuiButton-containedPrimary"
            onClick={() => onAccept(order)}
          >
            Accept order
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
