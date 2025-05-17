import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CustomerPage.module.css";
import Modal from "react-modal";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import { useSearch } from '../../../contexts/SearchContext'; // Import the context
import { useNavigate } from "react-router-dom";
Modal.setAppElement("#root");

// Initializes the CustomerPage component and sets up state variables for customers and search.
const CustomerPage = () => {
  const { setSearchQueryForEmail } = useSearch(); // Get the setSearchQuery function from context
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [open, setOpen] = useState(false); // For the edit dialog
  const [error, setError] = useState(null);

  // Handles the click event on a customer's email to set the search query and navigate to orders.
  const handleEmailClick = (email) => {
    setSearchQueryForEmail(email); // Set the search query to the clicked email
    console.log("eeeeeeeee", email);
    navigate(`/orders`); // Navigate to the orders page
  };
  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  // Fetches customers from the server based on the search query and updates the state.
  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/customers", {
        params: { search: searchQuery },
      });
      setCustomers(response.data);
    } catch (error) {
      setError("There was an error fetching the customers.");
      console.error("Error fetching customers:", error);
    }
  };

  // Opens the edit dialog for the selected customer based on their email.
  const handleEdit = () => {
    const customer = customers.find(
      (customer) => customer.email === selectedCustomerEmail
    );
    if (customer) {
      setSelectedCustomer(customer);
      setOpen(true);
    }
  };

  // Closes the edit dialog without saving changes.
  const handleClose = () => {
    setOpen(false);
  };

  // Saves the updated customer information to the server and refreshes the customer list.
  const handleSave = () => {
    axios
      .put(
        `http://localhost:3001/customers/update-customer/${selectedCustomerEmail}`,
        selectedCustomer
      )
      .then((response) => {
        console.log("Customer updated:", response.data);
        setOpen(false);
        fetchCustomers(); // Refresh the customers list
      })
      .catch((error) => {
        setError("There was an error updating the customer.");
        console.error("Error updating customer:", error);
      });
  };

  // Updates the selected customer state based on input field changes.
  const handleChange = (e) => {
    setSelectedCustomer({
      ...selectedCustomer,
      [e.target.name]: e.target.value,
    });
  };

  // Closes the modal and resets related states.
  const closeModal = () => {
    setModalIsOpen(false);
    setOrders([]);
    setSelectedCustomerEmail(null);
  };

  // Defines the columns for the DataGrid displaying customer information.
  const columns = [
    {
      field: "email",
      headerName: "Email",
      width: 200,
      renderCell: (params) => (
        <span
          onClick={() => handleEmailClick(params.value)} // Call the function on click
          style={{
            cursor: "pointer",
            color: "blue",
            textDecoration: "underline",
          }} // Add styles for better UX
        >
          {params.value}
        </span>
      ),
    },
    { field: "first_name", headerName: "First Name", width: 150 },
    { field: "last_name", headerName: "Last Name", width: 150 },
    { field: "city", headerName: "City", width: 150 },
    { field: "street_name", headerName: "Street Name", width: 200 },
    { field: "phone_number", headerName: "Phone Number", width: 150 },
  ];

  // Renders the main UI for the customer page, including search, customer list, and edit dialog.
  return (
    <div className={styles.customerPage}>
      <h1 className={styles.customer}>Customers</h1>
      <div className={styles.searchContainer}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </div>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={customers}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.email} // Use email as unique row ID
          onRowSelectionModelChange={(newSelectionModel) => {
            setSelectedCustomerEmail(newSelectionModel[0] || null);
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
          }}
        />
      </div>
      {selectedCustomerEmail && (
        <div style={{ marginTop: 16 }}>
          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit Selected Customer
          </Button>
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ fontSize: "18px" }}>Edit Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="first_name"
            label="First Name"
            type="text"
            fullWidth
            value={selectedCustomer?.first_name || ""}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "16px" } }} // Increase label font size
            inputProps={{ style: { fontSize: "16px" } }} // Increase input value font size
          />
          <TextField
            margin="dense"
            name="last_name"
            label="Last Name"
            type="text"
            fullWidth
            value={selectedCustomer?.last_name || ""}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "16px" } }} // Increase label font size
            inputProps={{ style: { fontSize: "16px" } }} // Increase input value font size
          />
          <TextField
            margin="dense"
            name="city"
            label="City"
            type="text"
            fullWidth
            value={selectedCustomer?.city || ""}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "16px" } }} // Increase label font size
            inputProps={{ style: { fontSize: "16px" } }} // Increase input value font size
          />
          <TextField
            margin="dense"
            name="street_name"
            label="Street Name"
            type="text"
            fullWidth
            value={selectedCustomer?.street_name || ""}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "16px" } }} // Increase label font size
            inputProps={{ style: { fontSize: "16px" } }} // Increase input value font size
          />
          <TextField
            margin="dense"
            name="phone_number"
            label="Phone Number"
            type="text"
            fullWidth
            value={selectedCustomer?.phone_number || ""}
            onChange={handleChange}
            InputLabelProps={{ style: { fontSize: "16px" } }} // Increase label font size
            inputProps={{ style: { fontSize: "16px" } }} // Increase input value font size
          />
         
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={selectedCustomer?.email || ""}
            disabled
            InputLabelProps={{ style: { fontSize: "16px" } }} // Increase label font size
            inputProps={{ style: { fontSize: "16px" } }} // Increase input value font size
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            style={{ marginRight: "auto", fontSize: "13px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            style={{ fontSize: "13px" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Customer Orders"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Customer Orders for {selectedCustomerEmail}</h2>
        {orders.length > 0 ? (
          <ul>
            {orders.map((order) => (
              <li key={order.ID}>
                Order ID: {order.ID}, Status: {order.order_status}, Date:{" "}
                {order.date}, Detailed Price: {order.detailed_price}, Payment
                Status: {order.payment_status}, Shipping Address:{" "}
                {order.shipping_address}
              </li>
            ))}
          </ul>
        ) : (
          <p>No orders found for this customer.</p>
        )}
        <Button variant="contained" onClick={closeModal}>
          Close
        </Button>
      </Modal>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default CustomerPage;
