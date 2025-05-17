import React, { useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext ";

const AutoLogout = ({ children }) => {
  const { logout } = useContext(AuthContext);
  let timeout;

  // Resets the logout timer whenever user activity is detected (mouse movement or key press).
  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(logout, 20 * 60 * 1000); // 20 minutes
  };

  // Sets up event listeners for user activity and initializes the logout timer on component mount.
  useEffect(() => {
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("keydown", resetTimeout);
    resetTimeout();

    return () => {
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("keydown", resetTimeout);
      clearTimeout(timeout);
    };
  }, []);

  return children;
};

export default AutoLogout;
