import React, { useState, useContext } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { TruckLocationContext } from "../../contexts/TruckLocationContext"; // Import your context
import axios from "axios";

const TruckModal = ({ open, handleClose }) => {
  const { truckLocations, setTruckLocations, triggerRerender } =
    useContext(TruckLocationContext);
  const [newTruckName, setNewTruckName] = useState("");
  const [newTruckActive, setNewTruckActive] = useState(true);

  // State for confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);

  // Handle adding a new truck
  const handleAddTruck = async () => {
    if (newTruckName.trim()) {
      try {
        await axios.post("/maps/addTruck", {
          name: newTruckName,
          lat: 0,
          lng: 0,
          isActive: newTruckActive,
          address: "",
        });
        setNewTruckName("");
        setNewTruckActive(true);
        triggerRerender(); // Refresh the context data
      } catch (error) {
        console.error("Error adding truck:", error);
      }
    }
  };

  // Remove a truck
  const handleRemoveTruck = async (id) => {
    try {
      await axios.delete(`/maps/deleteTruckLocation/${id}`);
      triggerRerender(); // Refresh the context data
    } catch (error) {
      console.error("Error deleting truck:", error);
    }
  };

  // Update truck active status
  const handleUpdateTruckActive = async (id, isActive) => {
    try {
      const truckToUpdate = truckLocations.find((truck) => truck.id === id);
      if (truckToUpdate) {
        await axios.put(`/maps/updateTruckLocation/${id}`, {
          ...truckToUpdate,
          isActive,
        });
        triggerRerender(); // Refresh the context data
      } else {
        console.error("Truck not found for update:", id);
      }
    } catch (error) {
      console.error("Error updating truck active status:", error);
    }
  };

  // Handle confirmation of deletion
  const handleConfirmDelete = () => {
    console.log(truckToDelete,"ddd");
    if (truckToDelete) {
      handleRemoveTruck(truckToDelete);
      setTruckToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          fontSize: "1.5rem", // Font size remains large
          overflowY: "auto", // Add scroll bar
          maxHeight: "80dvh", // Set a maximum height for the modal
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Manage Trucks</h2>

        {/* Add Truck Section */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          <TextField
            type="text"
            placeholder="New Truck Name"
            value={newTruckName}
            onChange={(e) => setNewTruckName(e.target.value)}
            fullWidth
            size="large"
            sx={{
              fontSize: "1.5rem",
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={newTruckActive}
                onChange={(e) => setNewTruckActive(e.target.checked)}
                size="large"
                sx={{
                  fontSize: "1.5rem",
                }}
              />
            }
            label="Active"
            sx={{
              fontSize: "1.5rem",
            }}
          />
          <Button
            onClick={handleAddTruck}
            variant="contained"
            size="large"
            sx={{
              fontSize: "1.5rem",
            }}
          >
            Add
          </Button>
        </div>

        {/* List of Trucks */}
        <ul style={{ padding: 0, listStyleType: "none" }}>
          {truckLocations.map((truck) => (
            <li
              key={truck.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
                padding: "8px",
                borderBottom: "1px solid #ccc",
                fontSize: "2rem", // Font size applied directly here affects ListItem
              }}
            >
              <span style={{ fontSize: "2rem" }}>{truck.name}</span>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={truck.isActive === 1}
                    onChange={(e) =>
                      handleUpdateTruckActive(truck.id, e.target.checked)
                    }
                    size="large"
                    sx={{
                      "&.Mui-checked": {
                        color: "#1976d2", // Example of customizing checkbox color
                      },
                      fontSize: "2rem", // Increased font size for checkbox control
                    }}
                  />
                }
                label="Active"
                sx={{
                  fontSize: "2rem", // Increased font size for label
                }}
              />
              <IconButton
                onClick={() => {
                  setTruckToDelete(truck.id);
                  setDeleteDialogOpen(true);
                }}
                sx={{
                  color: "#f44336",
                  fontSize: "2rem", // Adjusted font size for icon button
                }}
              >
                <DeleteIcon fontSize="inherit" />{" "}
                {/* Ensure icon inherits size */}
              </IconButton>
            </li>
          ))}
        </ul>

        {/* Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          sx={{
            "& .MuiDialogTitle-root": {
              fontSize: "2rem", // Increase font size for DialogTitle
            },
            "& .MuiDialogContent-root": {
              fontSize: "1.8rem", // Increase font size for DialogContent
            },
            "& .MuiDialogActions-root": {
              fontSize: "1.8rem", // Increase font size for DialogActions
            },
          }}
        >
          <DialogTitle sx={{ fontSize: '2rem' }}>Confirm Deletion</DialogTitle>
          <DialogContent sx={{ fontSize: '1.8rem' }}>
            <Typography sx={{ fontSize: '1.8rem' }}>Are you sure you want to delete this truck?</Typography>
          </DialogContent>
          <DialogActions sx={{ fontSize: '1.8rem' }}>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary" sx={{ fontSize: '1.8rem' ,marginRight: 'auto'}}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" sx={{ fontSize: '1.8rem' }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1rem",
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
            sx={{
              fontSize: "1.5rem",
            }}
          >
            Close
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default TruckModal;
