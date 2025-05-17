import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  MenuItem,
  Select,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import classes from "./Orders.module.css";
import io from "socket.io-client";
import { useSearch } from "../../../contexts/SearchContext"; // Import the context

const socket = io("http://localhost:3001");

// This component manages the display and editing of orders in the dashboard.
// It fetches orders from the server and allows users to filter and edit them.

const Orders = () => {
  // Initializes state variables for orders, filters, and modal management.
  const { searchQueryForEmail, setSearchQueryForEmail } = useSearch(); // Get the searchQuery from context
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [discount, setDiscount] = useState(0);

  // const copyEmailToSearch = (email) => {
  //   setSearchQuery(email); // Set the search query to the clicked email
  // };

  useEffect(() => {
    fetchOrders(); // Fetch orders whenever searchQuery changes
    socket.on("newOrder", (order) => {
      setOrders((prevOrders) => [...prevOrders, order]);
    });

    return () => {
      socket.off("newOrder");
    };
  }, [statusFilter, searchQuery]);

  // Fetches orders from the server based on the current filters and search query.
  const fetchOrders = () => {
    // Set search query from context if available
    if (searchQueryForEmail) {
      setSearchQuery(searchQueryForEmail);
      setSearchQueryForEmail("");
    }

    axios
      .get("http://localhost:3001/orders/get-orders", {
        params: { status: statusFilter, search: searchQuery },
      })
      .then((response) => {
        console.log("Fetched orders:", response.data); // Log fetched orders
        setOrders(response.data);
      })
      .catch((error) => {
        setError("There was an error fetching the orders.");
        console.error("Error fetching orders:", error);
      });
  };

  // Updates the status filter based on user selection.
  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Updates the search query based on user input.
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Opens the edit modal for the selected order.
  const handleEdit = () => {
    const order = orders.find((order) => order.ID === selectedOrderId);
    if (order) {
      setSelectedOrder(order);
      setOpen(true);
    }
  };

  // Closes the edit modal.
  const handleClose = () => {
    setOpen(false);
  };

  // Saves the edited order back to the server.
  const handleSave = () => {
    axios
      .put(
        `http://localhost:3001/orders/update-order/${selectedOrderId}`,
        selectedOrder
      )
      .then((response) => {
        console.log("Order updated:", response.data);
        setOpen(false);
        fetchOrders(); // Refresh the orders list
      })
      .catch((error) => {
        setError("There was an error updating the order.");
        console.error("Error updating order:", error);
      });
  };

  // Updates the selected order's fields based on user input.
  const handleChange = (e) => {
    setSelectedOrder({ ...selectedOrder, [e.target.name]: e.target.value });
  };

  // Defines the columns for the data grid displaying orders.
  const columns = [
    { field: "ID", headerName: "Order ID", width: 80 },
    {
      field: "order_status",
      headerName: "Status",
      width: 200,
      renderHeader: () => (
        <Box display="flex" alignItems="center">
          <span>Status</span>
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            displayEmpty
            variant="outlined"
            style={{ marginLeft: 8, fontSize: 13 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </Box>
      ),
    },
    { field: "discounts", headerName: "Discounts", width: 100 },
    { field: "detailed_price", headerName: "Total Price", width: 100 },
    {
      field: "date",
      headerName: "Date",
      width: 100,
      valueFormatter: (params) => {
        if (!params) {
          return "N/A";
        }

        try {
          const dateString = params.split("T")[0]; // Extract the date part
          return dateString;
        } catch (error) {
          return String(params.value);
        }
      },
    },
    { field: "shipping_address", headerName: "Shipping Address", width: 140 },
    {
      field: "customer_email",
      headerName: "Customer email",
      width: 100,
    },
    {
      field: "customer_first_name",
      headerName: "First Name",
      width: 100,
    },
    {
      field: "customer_last_name",
      headerName: "Last Name",
      width: 100,
    },
  ];

  console.log("Full orders array:", orders); // Log full orders array

  return (
    <div className={classes.ordersPage}>
      <h1>Orders</h1>
      <TextField
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: 16 }}
      />
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={orders}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.ID} // Specify custom id for each row
          onRowSelectionModelChange={(newSelectionModel) => {
            console.log("Selection changed: ", newSelectionModel);
            setSelectedOrderId(newSelectionModel[0] || null);
          }}
          sx={{
            fontSize: "13px",
            "& .MuiDataGrid-footerContainer": {
              fontSize: "16px",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "13px",
              },
            "& .MuiInputBase-root": {
              fontSize: "13px",
            },
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "15px",
            },
          }}
        />
      </div>
      {selectedOrderId && (
        <div style={{ marginTop: 16 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEdit}
            className={classes.editButton}
          >
            Edit Selected Order
          </Button>
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle style={{ fontSize: "18px" }}>Edit Order</DialogTitle>
        <DialogContent>
          <span style={{ fontSize: "14px" }}>Status</span>
          <Select
            margin="dense"
            name="order_status"
            label="Status"
            fullWidth
            value={selectedOrder?.order_status || ""}
            onChange={handleChange}
            variant="outlined"
            style={{ fontSize: "13px" }}
          >
            <MenuItem value="Completed" style={{ fontSize: "16px" }}>
              Completed
            </MenuItem>
            <MenuItem value="Cancelled" style={{ fontSize: "16px" }}>
              Cancelled
            </MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="discounts"
            label="Discounts"
            type="number"
            fullWidth
            value={Math.max(selectedOrder?.discounts, 0) || 0}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "18px" } }} // Increased label font size
            InputProps={{ style: { fontSize: "16px" } }} // Increased value font size
            style={{ fontSize: "16px" }}
          />
          <TextField
            margin="dense"
            name="detailed_price"
            label="Total Price"
            type="number"
            fullWidth
            value={Math.max(selectedOrder?.detailed_price, 0) || 0}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "18px" } }} // Increased label font size
            InputProps={{ style: { fontSize: "16px" } }} // Increased value font size
            style={{ fontSize: "16px" }}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            value={selectedOrder?.date || ""}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "18px" } }} // Increased label font size
            InputProps={{ style: { fontSize: "16px" } }} // Increased value font size
            style={{ fontSize: "16px" }}
          />
          <TextField
            margin="dense"
            name="shipping_address"
            label="Shipping Address"
            type="text"
            fullWidth
            value={selectedOrder?.shipping_address || ""}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "18px" } }} // Increased label font size
            InputProps={{ style: { fontSize: "16px" } }} // Increased value font size
            style={{ fontSize: "16px" }}
          />
          <TextField
            margin="dense"
            name="customer"
            label="Customer"
            type="text"
            fullWidth
            value={`${selectedOrder?.customer_first_name || ""} ${
              selectedOrder?.customer_last_name || ""
            } (${selectedOrder?.customer_email || ""})`}
            disabled
            InputLabelProps={{ style: { fontSize: "18px" } }} // Increased label font size
            InputProps={{ style: { fontSize: "18px" } }} // Increased value font size
            style={{ fontSize: "16px" }}
          />
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          <Button
            onClick={handleClose}
            color="primary"
            style={{
              marginRight: "auto",
              backgroundColor: "#f44336",
              color: "white",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            style={{ backgroundColor: "#4CAF50", color: "white" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

export default Orders;