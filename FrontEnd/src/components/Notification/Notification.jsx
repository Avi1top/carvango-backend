import React from "react";
import { useNavigate } from "react-router-dom";
import classes from "./notification.module.css";

// Notification component displays a message and provides options to update ingredients or close the notification.
const Notification = ({ message, onClose }) => {
  const navigate = useNavigate();

  // handleRedirect navigates to the ingredients page when called.
  const handleRedirect = () => {
    navigate("/ingredients");
  };

  return (
    <div className={classes.notification}>
      <p>{message}</p>
      <button onClick={handleRedirect} className={classes.redirectButton}>
        Update Ingredients
      </button>
      <button onClick={onClose} className={classes.closeButton}>
        X
      </button>
    </div>
  );
};

export default Notification;
