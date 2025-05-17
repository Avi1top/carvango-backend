// src/NotFound.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css"; // Optional CSS styling

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")}>Go Back Home</button>
    </div>
  );
};

export default NotFound;
