// Ingredients.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Select, MenuItem, Box } from "@mui/material"; // Import TextField for search input and Select for filtering
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// Import MUI Dialog components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import styles from "./Ingredients.module.css";

// Import icons
import { FaPen, FaTrash, FaCheckCircle, FaRegCircle } from "react-icons/fa";

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [ingredientForm, setIngredientForm] = useState({
    name: "",
    quantities: "",
    unit: "KG",
    is_active: true,
  });
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteIngredientId, setDeleteIngredientId] = useState(null);
  const navigate = useNavigate();

  // Add searchQuery state
  const [searchQuery, setSearchQuery] = useState("");

  // Add state for unit filter
  const [unitFilter, setUnitFilter] = useState("");

   useEffect(() => {
     fetchIngredients();
     // Handle state passed from Home.jsx
     if (location.state && location.state.item) {
       setIngredientForm({
         ID: location.state.item.ID,
         name: location.state.item.name,
         quantities: location.state.item.quantities,
         unit: location.state.item.unit,
         is_active: location.state.item.is_active,
       });
       setIsEditing(true);
       setSelectedIngredientId(location.state.item.ID);
       setIsModalOpen(true); // Open the modal
     }
   }, [location, searchQuery]); // Add searchQuery to dependency array

   useEffect(() => {
     const selectedRowData = ingredients.find(
       (row) => row.ID === selectionModel[0]
     );
     setSelectedRow(selectedRowData || null);
   }, [selectionModel, ingredients]);


  // Fetches the list of ingredients from the server and updates the ingredients state.
  const fetchIngredients = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ingredients", {
        params: { search: searchQuery }, // Pass search query as a parameter
      });
      const fetchedIngredients = response.data || [];
      setIngredients(fetchedIngredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handles input changes in the ingredient form, updating the state based on user input.
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "quantities" && value < 0) {
      return;
    }
    setIngredientForm({
      ...ingredientForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submits the ingredient form, either creating a new ingredient or updating an existing one based on the editing state.
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (ingredientForm.quantities < 0) {
      alert("Quantity cannot be negative");
      return;
    }

    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:3001/ingredients/${selectedIngredientId}`,
          ingredientForm
        );
      } else {
        await axios.post("http://localhost:3001/ingredients", ingredientForm);
      }
      setIngredientForm({
        name: "",
        quantities: "",
        unit: "",
        is_active: true,
      });
      setIsEditing(false);
      setSelectedIngredientId(null);
      fetchIngredients();
      setIsModalOpen(false); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Initiates the editing process for a selected ingredient, populating the form with its details.
  const handleEditClick = (ingredient) => {
    setIngredientForm({
      name: ingredient.name,
      quantities: ingredient.quantities,
      unit: ingredient.unit,
      is_active: ingredient.is_active,
    });
    setIsEditing(true);
    setSelectedIngredientId(ingredient.ID);
    setIsModalOpen(true); // Open the modal
  };

  // Prepares to delete a selected ingredient by setting the deleteIngredientId and opening the confirmation dialog.
  const handleDeleteClick = (id) => {
    setDeleteIngredientId(id);
    setIsDeleteConfirmOpen(true);
  };

  // Confirms the deletion of an ingredient and updates the ingredients list accordingly.
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3001/ingredients/${deleteIngredientId}`
      );
      fetchIngredients();
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeleteIngredientId(null);
    }
  };

  // Toggles the active status of an ingredient and updates the server with the new status.
  const handleToggleActive = async (id, isActive) => {
    try {
      await axios.patch(`http://localhost:3001/ingredients/${id}/active`, {
        is_active: isActive,
      });
      fetchIngredients();
    } catch (error) {
      console.error("Error updating active status:", error);
    }
  };

  // Prepares the form for adding a new ingredient and opens the modal.
  const handleAddNewIngredient = () => {
    setIngredientForm({
      name: "",
      quantities: "",
      unit: "",
      is_active: true,
    });
    setIsEditing(false);
    setSelectedIngredientId(null);
    setIsModalOpen(true); // Open the modal for adding new ingredient
  };

  const handleEditSelectedRow = () => {
    if (selectedRow) {
      setIngredientForm({
        name: selectedRow.name,
        quantities: selectedRow.quantities,
        unit: selectedRow.unit,
        is_active: selectedRow.is_active,
      });
      setIsEditing(true);
      setSelectedIngredientId(selectedRow.ID);
      setIsModalOpen(true); // Open the modal with selected row data
    }
  };

  const goBack = () => {
    navigate("/inventory");
  };

  // Update handleUnitChange function
  const handleUnitChange = (event) => {
    setUnitFilter(event.target.value);
  };

  // Defines the columns for the DataGrid displaying the ingredients.
  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "quantities", headerName: "Quantity", type: "number", flex: 1 },
    {
      field: "unit",
      headerName: "Unit",
      flex: 1,
      renderHeader: () => (
        <Box display="flex" alignItems="center">
          <span>Unit</span>
          <Select
            value={unitFilter}
            onChange={handleUnitChange}
            displayEmpty
            variant="outlined"
            style={{ marginLeft: 8, fontSize: 13 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="KG">K/G</MenuItem>
            <MenuItem value="gram">gram</MenuItem>
            <MenuItem value="M/L">M/L</MenuItem>
            <MenuItem value="L">L</MenuItem>
            <MenuItem value="piece">piece</MenuItem>
          </Select>
        </Box>
      ),
    },
    {
      field: "is_active",
      headerName: "Active",
      type: "boolean",
      flex: 1,
      renderCell: (params) => (
        <div
          onClick={() => handleToggleActive(params.row.ID, !params.value)}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          {params.value ? (
            <FaCheckCircle className={styles.activeIcon} />
          ) : (
            <FaRegCircle className={styles.inactiveIcon} />
          )}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row)}
            title="Edit"
            startIcon={<FaPen />}
            style={{ marginRight: "5px" }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => handleDeleteClick(params.row.ID)}
            title="Delete"
            startIcon={<FaTrash />}
          >
            Delete
          </Button>
        </Box>
      ),
      headerAlign: "center",
    },
  ];

  // Prepares the rows for the DataGrid based on the ingredients state.
  const filteredRows = ingredients
    .filter(
      (ingredient) => unitFilter === "" || ingredient.unit === unitFilter // Filter based on unitFilter
    )
    .map((ingredient) => ({
      ...ingredient,
      id: ingredient.ID, // DataGrid uses 'id' for row identification
    }));

  const sortedRows = filteredRows.sort((a, b) => a.is_active - b.is_active); // Sort rows to show inactive items first

  // Renders the component, including the DataGrid, search bar, and modal for adding/editing ingredients.
  return (
    <div className={styles.ingredientsPage}>
      {/* Header with Logo */}

      {/* Search Bar */}
      <div className={styles.header}>
        <h1>Ingredients</h1>
      </div>
      <div
        className={styles.searchBar}
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className={styles.buttonContainer}>
        <button onClick={handleAddNewIngredient} className={styles.addButton}>
          Add New Ingredient
        </button>
      </div>

      {/* DataGrid for displaying ingredients */}
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={sortedRows}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.ID} // Specify custom id for each row
          selectionModel={selectionModel}
          onRowSelectionModelChange={(newSelectionModel) => {
            setSelectionModel(newSelectionModel);
          }}
          disableSelectionOnClick
          getRowClassName={(params) =>
            params.row.is_active ? "" : styles.inactiveRow
          }
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

      {/* {selectedRow && (
        <div className={styles.buttonContainer} style={{ marginTop: "10px" }}>
          <button onClick={handleEditSelectedRow} className={styles.backButton}>
            Edit Selected Ingredient
          </button>
        </div>
      )} */}

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogTitle style={{ fontSize: "20px" }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the{" "}
          {selectedRow ? selectedRow.name : "ingredient"}?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteConfirmOpen(false)}
            style={{ fontSize: "13px", marginRight: "auto" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="secondary"
            style={{ fontSize: "13px" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle style={{ fontSize: "20px", marginBottom: "10px" }}>
          {isEditing ? "Edit Ingredient" : "Add New Ingredient"}
        </DialogTitle>
        <DialogContent style={{ width: "400px" }}>
          <form
            onSubmit={handleFormSubmit}
            className={styles.form}
            id="ingredientForm"
          >
            <TextField
              type="text"
              name="name"
              label="Name"
              value={ingredientForm.name}
              onChange={handleInputChange}
              required
              fullWidth
              style={{ marginBottom: "15px", marginTop: "10px" }}
              InputLabelProps={{ style: { fontSize: "16px" } }}
              InputProps={{ style: { fontSize: "14px" } }}
            />

            <TextField
              type="number"
              name="quantities"
              label="Quantity"
              value={ingredientForm.quantities}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              fullWidth
              style={{ marginBottom: "15px" }}
              InputLabelProps={{ style: { fontSize: "16px" } }}
              InputProps={{ style: { fontSize: "14px" } }}
            />

            <FormControl fullWidth required style={{ marginBottom: "15px" }}>
              <InputLabel style={{ fontSize: "16px" }}>Select Unit</InputLabel>
              <Select
                name="unit"
                value={ingredientForm.unit}
                onChange={handleInputChange}
                style={{ marginTop: "5px", fontSize: "14px" }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      fontSize: "12px",
                    },
                  },
                }}
              >
                <MenuItem value="KG" style={{ fontSize: "13px" }}>
                  KG
                </MenuItem>
                <MenuItem value="gram" style={{ fontSize: "13px" }}>
                  gram
                </MenuItem>
                <MenuItem value="M/L" style={{ fontSize: "13px" }}>
                  M/L
                </MenuItem>
                <MenuItem value="L" style={{ fontSize: "13px" }}>
                  L
                </MenuItem>
                <MenuItem value="piece" style={{ fontSize: "13px" }}>
                  piece
                </MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  name="is_active"
                  checked={ingredientForm.is_active}
                  onChange={handleInputChange}
                  style={{ transform: "scale(1.5)" }}
                />
              }
              label={<span style={{ fontSize: "16px" }}>Active</span>}
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setIsModalOpen(false)}
            style={{ fontSize: "13px" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="ingredientForm"
            style={{ marginLeft: "240px", fontSize: "13px" }}
          >
            {isEditing ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Ingredients;
