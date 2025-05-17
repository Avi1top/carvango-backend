import React from "react";
import logo from "../../assets/imgs/logologo.png"; // Adjust path based on where you place the logo
import classes from"./LoadingScreen.module.css"; // Import the CSS for the animation

const LoadingScreen = () => {
  return (
    <div className={classes.loadingScreen}>
      <img src={logo} alt="Al Wadi Falafel Logo" className={classes.loadingLogo} />
    </div>
  );
};

export default LoadingScreen;
