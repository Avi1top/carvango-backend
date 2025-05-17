import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Checks the user's authentication status by making a request to the server
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/logIn/session",
          { withCredentials: true }
        );
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        console.log("Authentication check response:", response.status);
      } catch (error) {
        setIsAuthenticated(false);
        console.log("Authentication error:", error);
      }
    };
    checkAuth();
  }, []);

  console.log("isAuthenticated state:", isAuthenticated);

  // Displays a loading message while the authentication status is being determined
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Renders the children if authenticated, otherwise redirects to the login page
  return isAuthenticated ? children : <Navigate to="/logIn" />;
};

export default PrivateRoute;
