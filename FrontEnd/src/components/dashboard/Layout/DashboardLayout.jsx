import React, { useState } from "react";
import SideDashboard from "../sideDashboard/SideDashboard";
import classes from "./DashboardLayout.module.css";

// This component manages the layout of the dashboard, including the sidebar.
// It handles the state of the sidebar's visibility and renders the children components.

const DashboardLayout = ({ children }) => {
  // State to track if the sidebar is open or closed.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggles the sidebar's open/closed state.
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={classes.mainContainer}>
      <button className={classes.menuButton} onClick={toggleSidebar}>
        ☰
      </button>
      <SideDashboard isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={isSidebarOpen ? classes.contentShift : classes.content}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
