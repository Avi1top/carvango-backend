// Extras.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { FaPen, FaTrash, FaCheckCircle, FaRegCircle } from "react-icons/fa";
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import styles from "./Extras.module.css";
import UnitSelect from "../Dishes/UnitSelect"; // Adjust the import path as necessary

const Extras = ({ onBack }) => {
  const [extras, setExtras] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [extraForm, setExtraForm] = useState({
    name: "",
    unit: "",
    price: "",
    is_active: true,
    discount: 0,
    ingredient_id: "",
    quantity_needed: "",
  });

  const location = useLocation();
  const [editing, setEditing] = useState(false);
  const [selectedExtraId, setSelectedExtraId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteExtraId, setDeleteExtraId] = useState(null);
  const [unitFilter, setUnitFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  useEffect(() => {
    fetchIngredientsList();
    fetchExtras();
  }, []);

  useEffect(() => {
    // Ensure ingredientsList is populated before processing location state
    if (location.state && location.state.item && ingredientsList.length > 0) {
      const { item } = location.state; // Destructure for clarity

      setExtraForm({
        ID: item.ID,
        name: item.name,
        unit: item.unit || "", // Ensure unit is assigned
        price: item.price || "", // Ensure price is assigned
        is_active: item.is_active,
        discount: item.discount || 0,
        ingredient_id: item.ingredient_id || "", // Ensure ingredient ID is assigned
        quantity_needed: item.quantity_needed || "", // Ensure quantity needed is assigned
      });

      // Find the ingredient associated with the extra

      const ingredient = ingredientsList.find(
        (ing) => ing.ID.toString() === item.ingredient_id.toString()
      );
      // Set the selected ingredient to update the UnitSelect component
      setSelectedIngredient(ingredient);

      setEditing(true);
      setSelectedExtraId(item.ID);
      setIsModalOpen(true);
    }
  }, [location, ingredientsList]);
  useEffect(() => {
    if (selectionModel.length > 0) {
      const selectedRowData = extras.find(
        (row) => row.ID === selectionModel[0]
      );
      setSelectedRow(selectedRowData || null);
    } else {
      setSelectedRow(null);
    }
  }, [selectionModel, extras]);

  // Fetches the list of ingredients from the server and updates the ingredientsList state.
  const fetchIngredientsList = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ingredients");
      setIngredientsList(response.data);
    } catch (error) {
      console.error("Error fetching ingredients list:", error);
    }
  };

  // Fetches the list of extras from the server based on the search query and updates the extras state.
  const fetchExtras = async () => {
    try {
      const response = await axios.get("http://localhost:3001/extras", {
        params: { search: searchQuery },
      });
      const fetchedExtras = response.data || [];
      console.log("Fetched extras:", fetchedExtras);

      setExtras(
        fetchedExtras.map((extra) => ({
          ...extra,
          id: extra.ID, // DataGrid uses 'id' for row identification
        }))
      );
    } catch (error) {
      console.error("Error fetching extras:", error);
    }
  };

  useEffect(() => {
    fetchExtras();
  }, [searchQuery, unitFilter]);

  // Handles changes in the search input field and updates the searchQuery state.
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handles input changes in the extra form, updating the extraForm state with validation.
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value === "" ? "" : parseFloat(value);
    } else {
      newValue = value;
    }

    // Update selected ingredient when ingredient_id changes
    if (name === "ingredient_id") {
      const ingredient = ingredientsList.find(
        (ing) => ing.ID.toString() === value
      );
      setSelectedIngredient(ingredient);
      newValue = value;
    }

    // Validation for price and quantity_needed
    if ((name === "price" || name === "quantity_needed") && newValue < 0) {
      alert(
        `${name === "price" ? "Price" : "Quantity Needed"} cannot be negative.`
      );
      return;
    }

    // Validation for discount
    if (name === "discount") {
      if (newValue < 0 || newValue > 100) {
        alert("Discount must be between 0 and 100.");
        return;
      }
    }

    setExtraForm({
      ...extraForm,
      [name]: newValue,
    });
  };

  // Submits the extra form, either creating a new extra or updating an existing one based on the editing state.
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const {
      name,
      unit,
      price,
      ingredient_id,
      quantity_needed,
      discount,
      is_active,
    } = extraForm;
    console.log("extraForm", extraForm);
    if (
      !name ||
      !unit ||
      !price ||
      !ingredient_id ||
      !quantity_needed ||
      discount === null ||
      discount === undefined ||
      isNaN(price) ||
      isNaN(quantity_needed) ||
      isNaN(discount)
    ) {
      alert("Please fill in all required fields with valid values.");
      return;
    }

    // Additional validation
    if (price < 0) {
      alert("Price cannot be negative.");
      return;
    }
    if (discount < 0 || discount > 100) {
      alert("Discount must be between 0 and 100.");
      return;
    }
    if (quantity_needed <= 0) {
      alert("Quantity needed must be greater than zero.");
      return;
    }

    try {
      const dataToSend = {
        name,
        unit,
        price: parseFloat(price),
        ingredient_id: parseInt(ingredient_id, 10),
        quantity_needed: parseFloat(quantity_needed),
        discount: parseFloat(discount),
        is_active,
      };
      console.log("Data being sent:", dataToSend);
      if (editing) {
        await axios.put(
          `http://localhost:3001/extras/${selectedExtraId}`,
          dataToSend
        );
      } else {
        await axios.post("http://localhost:3001/extras", dataToSend);
      }
      // Reset form and state
      setExtraForm({
        name: "",
        unit: "",
        price: "",
        is_active: true,
        discount: 0,
        ingredient_id: "",
        quantity_needed: "",
      });
      setEditing(false);
      setSelectedExtraId(null);
      fetchExtras();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response && error.response.data) {
        console.error("Server error message:", error.response.data);
        alert(`Error: ${error.response.data.error}`);
      }
    }
  };

  // Initiates the editing process for a selected extra, populating the form with its details.
  const handleEditClick = async (extra) => {
    try {
      // Find the ingredient associated with the extra
      const ingredient = ingredientsList.find(
        (ing) => ing.ID.toString() === extra.ingredient_id.toString()
      );

      setExtraForm({
        name: extra.name,
        unit: extra.needed_unit,
        price: extra.price,
        is_active: extra.is_active,
        discount: extra.discount || 0,
        ingredient_id: extra.ingredient_id || "",
        quantity_needed:
          extra.quantity_needed !== undefined ? extra.quantity_needed : "",
      });

      // Set the selected ingredient to update the UnitSelect component
      setSelectedIngredient(ingredient);

      setEditing(true);
      setSelectedExtraId(extra.ID);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching extra ingredient:", error);
    }
  };

  // Prepares to delete a selected extra by setting the deleteExtraId and opening the confirmation dialog.
  const handleDeleteClick = (id) => {
    setDeleteExtraId(id);
    setIsDeleteConfirmOpen(true);
  };

  // Confirms the deletion of an extra and updates the extras list accordingly.
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/extras/${deleteExtraId}`);
      fetchExtras();
    } catch (error) {
      console.error("Error deleting extra:", error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeleteExtraId(null);
    }
  };

  // Toggles the active status of an extra and updates the server with the new status.
  const handleToggleActive = async (id, isActive) => {
    try {
      await axios.patch(`http://localhost:3001/extras/${id}/active`, {
        is_active: isActive,
      });
      fetchExtras();
    } catch (error) {
      console.error("Error updating active status:", error);
    }
  };

  // Prepares the form for adding a new extra and opens the modal.
  const handleAddNewExtra = () => {
    setExtraForm({
      name: "",
      unit: "",
      price: "",
      is_active: true,
      discount: 0,
      ingredient_id: "",
      quantity_needed: "",
    });
    setEditing(false);
    setSelectedExtraId(null);
    setIsModalOpen(true);
  };

  // Initiates the editing process for the currently selected row in the DataGrid.
  const handleEditSelectedRow = () => {
    if (selectedRow) {
      handleEditClick(selectedRow);
    }
  };

  // Handles changes in the unit filter dropdown and updates the unitFilter state.
  const handleUnitFilterChange = (event) => {
    setUnitFilter(event.target.value);
  };

  // Function to handle unit change
  const handleUnitChange = (newUnit) => {
    handleInputChange({ target: { name: "unit", value: newUnit } });
  };

  // Defines the columns for the DataGrid displaying the extras.
  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "quantity_needed",
      headerName: "Quantity",
      type: "number",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => parseFloat(params).toFixed(2),
    },
    {
      field: "needed_unit",
      headerName: "Unit",
      flex: 2,

      renderHeader: () => (
        <Box display="flex" alignItems="center">
          <span>Unit</span>
          <Select
            value={unitFilter}
            onChange={handleUnitFilterChange}
            displayEmpty
            variant="outlined"
            style={{ fontSize: 13, marginLeft: 8 }}
          >
            <MenuItem value="" style={{ fontSize: 11 }}>
              <em>All Units</em>
            </MenuItem>
            <MenuItem value="gram" style={{ fontSize: 11 }}>
              gram
            </MenuItem>
            <MenuItem value="KG" style={{ fontSize: 11 }}>
              KG
            </MenuItem>
            <MenuItem value="L" style={{ fontSize: 11 }}>
              L
            </MenuItem>
            <MenuItem value="M/L" style={{ fontSize: 11 }}>
              M/L
            </MenuItem>
            <MenuItem value="piece" style={{ fontSize: 11 }}>
              piece
            </MenuItem>
          </Select>
        </Box>
      ),
    },
    {
      field: "ingredient_name",
      headerName: "Ingredient",
      flex: 1,
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => `₪${parseFloat(params).toFixed(2)}`,
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
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row)}
            startIcon={<FaPen />}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => handleDeleteClick(params.row.ID)}
            startIcon={<FaTrash />}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  // Prepares the rows for the DataGrid based on the extras state and filters them according to the search query and unit filter.
  const filteredRows = extras
    .filter(
      (extra) =>
        unitFilter === "" ||
        extra.needed_unit.toLowerCase() === unitFilter.toLowerCase()
    )
    .filter(
      (extra) =>
        extra.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        extra.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const sortedRows = filteredRows.sort((a, b) => a.is_active - b.is_active);

  // Renders the component, including the DataGrid, search bar, and modal for adding/editing extras.
  return (
    <div className={styles.extrasPage}>
      <h1 className={styles.title}>Extras</h1>
      {/* Search Bar and Unit Filter */}
      <div className={styles.searchBar}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className={styles.buttonContainer}>
        <button onClick={handleAddNewExtra} className={styles.addButton}>
          Add New Extra
        </button>
      </div>
      <div style={{ height: 600, width: "1000px" }}>
        <DataGrid
          rows={sortedRows}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.id}
          selectionModel={selectionModel}
          onSelectionModelChange={(newSelectionModel) => {
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
      {selectedRow && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleEditSelectedRow}
          style={{ marginTop: 16 }}
        >
          Edit Selected
        </Button>
      )}
      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogTitle style={{ fontSize: "20px" }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the{" "}
          {extraForm && extraForm.name ? extraForm.name : "extra"}?
        </DialogContent>
        <DialogActions>
          <Button
            style={{ fontSize: "13px", marginRight: "auto" }}
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            style={{ fontSize: "13px" }}
            onClick={confirmDelete}
            color="secondary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle style={{ fontSize: "20px" }}>
          {editing ? `Edit ${extraForm.name}` : "Add New Extra"}
        </DialogTitle>
        <DialogContent>
          <form
            onSubmit={handleFormSubmit}
            className={styles.form}
            id="extraForm"
          >
            <TextField
              type="text"
              name="name"
              label={<span style={{ fontSize: "16px" }}>Name</span>}
              value={extraForm.name}
              onChange={handleInputChange}
              required
              fullWidth
              InputProps={{
                style: { fontSize: "14px" },
              }}
              style={{ marginTop: "10px" }}
            />
            <div style={{ margin: "5px 0" }} />

            {/* Ingredient Selection */}
            <TextField
              select
              variant="outlined"
              name="ingredient_id"
              label={
                <span style={{ fontSize: "16px" }}>Select Ingredient</span>
              }
              value={extraForm.ingredient_id}
              onChange={handleInputChange}
              required
              fullWidth
              InputProps={{
                style: { fontSize: "14px" },
              }}
            >
              <MenuItem value="" style={{ fontSize: "14px" }}>
                Select Ingredient
              </MenuItem>
              {ingredientsList.map((ingredient) => (
                <MenuItem
                  key={ingredient.ID}
                  value={ingredient.ID.toString()}
                  style={{ fontSize: "14px" }}
                >
                  {ingredient.name}
                </MenuItem>
              ))}
            </TextField>
            <div style={{ margin: "5px 0" }} />

            <TextField
              type="number"
              name="quantity_needed"
              label={<span style={{ fontSize: "16px" }}>Quantity Needed</span>}
              value={
                extraForm.quantity_needed === ""
                  ? ""
                  : extraForm.quantity_needed
              }
              onChange={handleInputChange}
              required
              inputProps={{ min: "0.01", step: "0.01" }}
              fullWidth
              InputProps={{
                style: { fontSize: "14px" },
              }}
            />
            <div style={{ margin: "5px 0" }} />

            <UnitSelect
              ingredientUnit={
                extras.find((extra) => extra.ID === selectedExtraId)?.unit ||
                selectedIngredient?.unit
              }
              onUnitChange={(newUnit) =>
                setExtraForm({ ...extraForm, unit: newUnit })
              }
            />
            <div style={{ margin: "5px 0" }} />

            <TextField
              type="number"
              step="0.01"
              name="price"
              label={<span style={{ fontSize: "16px" }}>Price</span>}
              value={extraForm.price === "" ? "" : extraForm.price}
              onChange={handleInputChange}
              required
              inputProps={{ min: "0", step: "0.01" }}
              fullWidth
              InputProps={{
                style: { fontSize: "14px" },
              }}
            />
            <div style={{ margin: "5px 0" }} />

            <TextField
              type="number"
              name="discount"
              label={<span style={{ fontSize: "16px" }}>Discount (%)</span>}
              value={extraForm.discount === "" ? "" : extraForm.discount}
              onChange={handleInputChange}
              required
              inputProps={{ min: "0", max: "100", step: "0.01" }}
              fullWidth
              InputProps={{
                style: { fontSize: "14px" },
              }}
            />
            <div style={{ margin: "5px 0" }} />

            <FormControlLabel
              control={
                <Checkbox
                  name="is_active"
                  checked={extraForm.is_active}
                  onChange={handleInputChange}
                />
              }
              label={<span style={{ fontSize: "16px" }}>Active</span>}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            style={{ fontSize: "12px" }}
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="extraForm"
            style={{ marginLeft: "120px", fontSize: "12px" }}
          >
            {editing ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Extras;
