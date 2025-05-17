import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./home.module.css"; // Custom CSS for styling
import WorkHoursForm from "../WorkHoursForm/WorkHoursForm";
import GlobalDiscount from "../Inventory/Dishes/GlobalDiscount";
import TaxRateSetting from "./TaxRate";

// Register necessary chart components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Revenue",
        data: [],
        borderColor: "#007bff",
        fill: false,
        tension: 0.4,
      },
    ],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [view, setView] = useState("monthly");
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [showWorkHours, setShowWorkHours] = useState(false);
  const [data, setData] = useState({
    totalCustomers: 0,
    totalSales: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split("T")[0];

  // Fetch chart data based on the selected view (daily, monthly, yearly) and update the chart state.
  const fetchChartData = (view) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    let apiUrl = `http://localhost:3001/dashboard/revenue-${view}?year=${currentYear}`;

    if (view === "daily") apiUrl += `&month=${currentMonth}`;

    axios
      .get(apiUrl)
      .then((response) => {
        setChartData({
          labels: response.data.labels,
          datasets: [
            {
              label: `Revenue (${view})`,
              data: response.data.revenues,
              borderColor: "#007bff",
              fill: false,
              tension: 0.4,
            },
          ],
        });
      })
      .catch((error) => console.error("Error fetching chart data:", error));
  };
  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };
  // Fetch total sales, orders, and customers within a specified date range or default to last month.
  const fetchTotalsData = (from = lastMonth, to = today) => {
    setLoading(true);
    axios
      .get("http://localhost:3001/dashboard/totals", { params: { from, to } })
      .then(({ data }) => {
        setData({
          totalCustomers: data.total_customers || 0,
          totalSales: data.total_sales || 0,
          totalOrders: data.total_orders || 0,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching totals data:", error);
        setLoading(false);
      });
  };

  // Fetch out-of-stock items from the server and update the state with the response data.
  const fetchOutOfStockItems = () => {
    axios
      .get("/dashboard/out-of-stock")
      .then((response) => setOutOfStockItems(response.data || []))
      .catch((error) =>
        console.error("Error fetching out-of-stock and inactive items:", error)
      );
  };
  console.log("ddd", outOfStockItems);

  // Handle date filtering by fetching totals data based on selected start and end dates.
  const handleFilter = () => {
    if (startDate && endDate) fetchTotalsData(startDate, endDate);
    else alert("Please select both start and end dates.");
  };

  // Update the view state to show the previous time period (daily/monthly).
  const handleLeftClick = () => {
    if (view === "monthly") setView("daily");
    else if (view === "yearly") setView("monthly");
  };

  // Update the view state to show the next time period (monthly/yearly).
  const handleRightClick = () => {
    if (view === "daily") setView("monthly");
    else if (view === "monthly") setView("yearly");
  };

  // Navigate to the update page for the selected item with the appropriate state based on item type.
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const handleUpdateClick = (item) => {
    let route;
    let state;

    if (item.type === "ingredient" || item.type === "ingredient_dish") {
      route = "ingredients";
      state = {
        item: {
          ID: item.ID,
          name: item.name,
          quantities: item.stock_quantity,
          unit: item.unit,
          is_active: item.is_active,
        },
      };
    } else {
      route = "extras";
      state = {
        item: {
          ID: item.ID,
          name: item.name,
          price: item.price || "",
          unit: item.unit || "",
          is_active: item.is_active,
          discount: item.discount || 0,
          ingredient_id: item.ingredient_id || "",
          quantity_needed: item.used_quantity || "",
          needed_unit: item.needed_unit || "",
        },
      };
    }

    navigate(`/${route}`, { state });
  };

  // Toggle the visibility of the work hours form.
  const toggleWorkHoursVisibility = () => setShowWorkHours(!showWorkHours);

  // Format sales values for display, converting large numbers into a more readable format.
  const formatSales = (value) =>
    value >= 1000000
      ? `$${(value / 1000000).toFixed(1)}M`
      : new Intl.NumberFormat().format(value);

  // Fetch totals data, out-of-stock items, and chart data when the component mounts or view changes.
  useEffect(() => {
    fetchTotalsData();
    fetchOutOfStockItems();
    fetchChartData(view);
  }, [view]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
      </div>
      {/* Actions Section */}
      <div className={styles.actions}>
        <h3>Out of Stock or Inactive Items</h3>
        <div className={styles.actionItem}>
          {outOfStockItems.length > 0 ? (
            <ul className={styles.itemList}>
              {Array.from(new Set(outOfStockItems.map((item) => item.ID))).map(
                (id) => {
                  const item = outOfStockItems.find((item) => item.ID === id);
                  return (
                    <li key={item.ID} className={styles.item}>
                      <span>{item.name}</span>
                      <span>
                        {item.is_active ? "Out of Stock" : "Inactive"}
                      </span>
                      <button
                        onClick={() => handleUpdateClick(item)}
                        className={styles.updateButton}
                      >
                        Update
                      </button>
                    </li>
                  );
                }
              )}
            </ul>
          ) : (
            <p>No items out of stock or inactive.</p>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.workHoursSection}>
          <WorkHoursForm
            show={showWorkHours}
            onClose={toggleWorkHoursVisibility}
            className={styles.workHoursSection} // Add a class for styling
          />
        </div>
        <Button
          variant="outlined"
          onClick={handleOpen}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "8px 16px",
            transition: "background-color 0.3s ease",
            fontSize: "11.3px",
            fontFamily: "Arial",
            marginTop: "7px",
          }}
        >
          Open Discount and Tax Settings
        </Button>
        <Dialog
          open={isModalOpen}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle style={{ textAlign: "center", fontSize: "20px" }}>
            Discount and Tax Settings
          </DialogTitle>
          <DialogContent
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <div style={{ flex: 1 }}>
              <GlobalDiscount />
            </div>
            <div style={{ flex: 1 }}>
              <TaxRateSetting />
            </div>
          </DialogContent>
          <DialogActions style={{ justifyContent: "center" }}>
            <Button onClick={handleClose} color="primary" variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      {/* Global Discount Section */}

      {/* Filter and Stats Section */}
      <h3>Filter results by date:</h3>
      <div className={styles.filterSection}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.dateInput}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.dateInput}
          min={startDate}
          disabled={startDate === "" ? true : false}
        />
      </div>
      <div className={styles.filterButtonContainer}>
        <button onClick={handleFilter} className={styles.filterButton}>
          Filter
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <h2>{loading ? "..." : data.totalCustomers}</h2>
          <p>Total Customers</p>
        </div>
        <div className={styles.statItem}>
          <h2>{loading ? "..." : formatSales(data.totalSales)}</h2>
          <p>Total Sales</p>
        </div>
        <div className={styles.statItem}>
          <h2>{loading ? "..." : data.totalOrders}</h2>
          <p>Total Orders</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.chartControls}>
          <button
            onClick={() => setView("daily")}
            className={`${styles.chartButton} ${
              view === "daily" ? styles.active : ""
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`${styles.chartButton} ${
              view === "monthly" ? styles.active : ""
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setView("yearly")}
            className={`${styles.chartButton} ${
              view === "yearly" ? styles.active : ""
            }`}
          >
            Yearly
          </button>
        </div>
        <Line data={chartData} options={{ responsive: true }} />
      </div>

      {/* Manage Work Hours Section */}
    </div>
  );
};

export default Home;
