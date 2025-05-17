import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./sideDashboard.module.css";
import clsx from "clsx";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons for menu toggle


// SideDashboard: Renders the sidebar with navigation links and a toggle button.
const SideDashboard = ({ setSidebarOpen }) => {
  const [close, setClose] = useState(false);
  
  // handleToggle: Toggles the sidebar's open/close state and updates the parent component's state.
  const handleToggle = () => {
    setClose((prev) => !prev);
    setSidebarOpen(!close);
  };
  return (
    <div className={clsx(styles.container, { [styles.contentShift]: close })}>
      <button className={styles.toggleButton} onClick={handleToggle}>
        {close ? <FaTimes /> : <FaBars />}
      </button>
      <div className={clsx(styles.sidebar, { [styles.sidebarOpen]: close })}>
        <div className={styles.logo}>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/dashboard" activeClassName={styles.active}>
            Home
          </NavLink>
          <NavLink to="/truckLocation" activeClassName={styles.active}>
            Truck Location
          </NavLink>
          <NavLink to="/dishes" activeClassName={styles.active}>
            Dishes
          </NavLink>
          <NavLink to="/ingredients" activeClassName={styles.active}>
            Ingredients
          </NavLink>
          <NavLink to="/extras" activeClassName={styles.active}>
            Extras
          </NavLink>
          <NavLink to="/orders" activeClassName={styles.active}>
            Orders
          </NavLink>
          <NavLink to="/customers" activeClassName={styles.active}>
            Customers
          </NavLink>
          <NavLink to="/EditProfile" activeClassName={styles.active}>
            Edit Profile
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default SideDashboard;
