import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Checks the authentication status by making a request to the server.
  const checkAuth = async () => {
    try {
      const response = await axios.get("http://localhost:3001/logIn/session", {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.isAuthenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      console.log("Authenticated:", response.data.isAuthenticated);
    } catch (error) {
      setIsAuthenticated(false);
      console.log("Authentication error:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Logs in the user by sending email and password to the server and navigates to the dashboard on success.
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/logIn",
        { email, password },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.success) {
        setIsAuthenticated(true);
        navigate("/dashboard");
        console.log("Login successful");
      }
    } catch (error) {
      setIsAuthenticated(false);
      console.error("Error during login:", error);
    }
  };

  // Logs out the user by making a request to the server and navigates to the menu.
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/logIn/logout",
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      navigate("/menu");
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
