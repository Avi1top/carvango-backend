// Dishes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { DataGrid } from "@mui/x-data-grid";
import styles from "./Dishes.module.css";
import Notification from "../../../Notification/Notification";
import { useLocation } from "react-router-dom"; // Import useLocation

// Import MUI components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import UnitSelect from "./UnitSelect";
// Import icons
import { FaPen, FaArchive, FaCheckCircle, FaRegCircle } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

const Dishes = ({ onBack }) => {
  const [dishes, setDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [notification, setNotification] = useState("");
  const [availableUnits, setAvailableUnits] = useState([]); // New state for available units
  const [existingDishNames, setExistingDishNames] = useState([]); // New state for existing dish names

  const [dishForm, setDishForm] = useState({
    name: "",
    description: "",
    price: "",
    allergies: "",
    image: null,
    is_active: true,
    selectedIngredients: [],
    discount: 0,
  });

  const [editing, setEditing] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState(null);
  const [chartData, setChartData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [archiveDishId, setArchivedDishId] = useState(null);
  const [isDishArchived, setIsDishArchived] = useState(false);

  // const location = useLocation(); // Move useLocation here

  // Fetch dishes and ingredients when the component mounts
  // const [isFetched, setIsFetched] = useState(false);
  useEffect(() => {
    console.log("Fetching data: dishes, ingredients, and existing dish names.");
    const fetchData = async () => {
      await fetchDishes();
      await fetchIngredients();
      // await fetchExistingDishNames(); // Fetch existing names when component mounts

      // setIsFetched(true); // Mark fetching complete
    };

    fetchData();
  }, []); // No dependencies here

  // useEffect(() => {
  //   if (isFetched && location.state?.item) {
  //     const { item } = location.state;
  //
  //     const foundDish = dishes?.find((dish) => dish.ID === item.ID);
  //     if (foundDish) {
  //       console.log(foundDish, "sssasas");
  //       setDishForm({
  //         name: foundDish.name,
  //         description: foundDish.description,
  //         price: foundDish.price,
  //         allergies: foundDish.allergies || "",
  //         image_path: foundDish.image_path || "",
  //         is_active: foundDish.is_active,
  //         discount: foundDish.discount || 0,
  //         selectedIngredients: foundDish.ingredients.map((ing) => ({
  //           ingredientId: ing.ingredient_id.toString(),
  //           quantity_needed: ing.quantity_needed.toString(),
  //           unit: ing.unit || "",
  //         })),
  //       });
  //     }
  //
  //     setEditing(true);
  //     setSelectedDishId(item.ID);
  //     setIsModalOpen(true);
  //   }
  // }, [isFetched, location]);

  const fetchExistingDishNames = async () => {
    try {
      const response = await axios.get("http://localhost:3001/dishes");
      const names = response.data.map((dish) => dish.name.toLowerCase());
      setExistingDishNames(names);
    } catch (error) {
      console.error("Error fetching existing dish names:", error);
    }
  };
  // Add location as a dependency

  useEffect(() => {
    const selectedRowData = dishes.find((row) => row.id === selectionModel[0]);
    setSelectedRow(selectedRowData || null);
    console.log("Selected row data updated:", selectedRowData);
  }, [selectionModel, dishes]);

  useEffect(() => {
    console.log("Fetching dishes with search term:", searchTerm);
    fetchDishes(searchTerm);
  }, [searchTerm]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      // Cleanup the timer on component unmount
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Fetches dishes from the server based on an optional search term and updates the state with the fetched data.
  const fetchDishes = async (searchTerm = "") => {
    try {
      const response = await axios.get("http://localhost:3001/dishes", {
        params: { search: searchTerm },
      });
      const fetchedDishes = response.data || [];
      console.log("Fetched dishes:", fetchedDishes);

      // Fetch ingredients for each dish
      const dishesWithIngredients = await Promise.all(
        fetchedDishes.map(async (dish) => {
          const ingredientsResponse = await axios.get(
            `http://localhost:3001/dishes/${dish.ID}/ingredients`
          );
          dish.ingredients = ingredientsResponse.data || [];
          console.log(`Ingredients for dish ${dish.ID}:`, dish.ingredients);
          return dish;
        })
      );

      console.log("Dishes with ingredients:", dishesWithIngredients);

      setDishes(
        dishesWithIngredients.map((dish) => ({
          ...dish,
          id: dish.ID, // Ensure each dish has an 'id' field
        }))
      );
      updateChartData(dishesWithIngredients);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };

  // Fetches active ingredients from the server and updates the ingredients state.
  const fetchIngredients = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ingredients/");
      setIngredients(response.data);
      console.log("Fetched ingredients:", response.data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // Updates the chart data based on the active and inactive dishes, preparing labels and datasets for the chart.
  const updateChartData = (dishes) => {
    const activeDishes = dishes.filter((dish) => dish.is_active);
    const sortedActiveDishes = activeDishes
      .sort((a, b) => a.price - b.price)
      .slice(0, 13);
    const inactiveDishes = dishes.filter((dish) => !dish.is_active);

    // Combine active and inactive dishes for labels and data
    const allDishes = [...sortedActiveDishes, ...inactiveDishes];

    const unarchivedDishes = allDishes.filter(
      (dish) => dish.isArchived !== "yes"
    );
    setChartData({
      labels: unarchivedDishes.map((dish) => dish.name),
      datasets: [
        {
          label: "Ingredients in each dish",
          data: unarchivedDishes.map((dish) => dish.ingredients.length),
          backgroundColor: unarchivedDishes.map(
            (dish) =>
              dish.is_active
                ? "rgba(75, 192, 192, 0.2)"
                : "rgba(255, 99, 132, 0.2)" // Red for inactive dishes
          ),
          borderColor: unarchivedDishes.map(
            (dish) =>
              dish.is_active ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)" // Red for inactive dishes
          ),
          borderWidth: 1,
        },
      ],
    });
  };

  // Handles input changes in the dish form, updating the state based on the input type and performing validations.
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Initialize newValue based on the input type
    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value === "" ? "" : parseFloat(value);
    } else {
      newValue = value;
    }

    // Validation for price
    if (name === "price" && newValue < 0) {
      alert("Price cannot be negative.");
      return;
    }

    // Validation for discount
    if (name === "discount") {
      if (newValue < 0 || newValue > 100) {
        alert("Discount must be between 0 and 100.");
        return;
      }
    }

    // Update the state
    setDishForm({
      ...dishForm,
      [name]: newValue,
    });
  };

  // Handles file input changes, updating the dish form state with the selected image file.
  const handleFileChange = (e) => {
    console.log(e.target.files[0]); // Log the selected file
    setDishForm({ ...dishForm, image: e.target.files[0] });
  };

  // Selects an ingredient and adds it to the selected ingredients in the dish form state.
  const handleIngredientSelect = (e) => {
    const ingredientId = e.target.value;
    const selectedIngredient = ingredients.find(
      (ing) => ing.ID.toString() === ingredientId
    );

    if (
      ingredientId &&
      !dishForm.selectedIngredients.some(
        (ing) => ing.ingredientId === ingredientId
      )
    ) {
      setDishForm((prevForm) => ({
        ...prevForm,
        selectedIngredients: [
          ...prevForm.selectedIngredients,
          {
            ingredientId,
            quantity_needed: 1,
            unit: selectedIngredient.unit || "",
          }, // Set default unit
        ],
      }));

      // // Set available units based on the selected ingredient
      // if (selectedIngredient.unit === "KG") {
      //   setAvailableUnits(["KG", "gram"]);
      // } else if (selectedIngredient.unit === "L") {
      //   setAvailableUnits(["L", "M/L"]);
      // } else if (selectedIngredient.unit === "gram") {
      //   setAvailableUnits(["gram", "KG"]);
      // } else if (selectedIngredient.unit === "M/L") {
      //   setAvailableUnits(["M/L", "L"]);
      // } else if (selectedIngredient.unit === "piece") {
      //   setAvailableUnits(["piece"]);
      // } else {
      //   setAvailableUnits([]); // Reset if no matching unit
      // }
    }
  };

  // Updates the quantity or unit of a selected ingredient based on user input.
  const handleIngredientQuantityChange = (index, field, value) => {
    const updatedIngredients = [...dishForm.selectedIngredients];
    if (field === "quantity_needed") {
      updatedIngredients[index][field] = Math.max(0.01, parseFloat(value));
    } else {
      updatedIngredients[index][field] = value;
    }
    setDishForm((prevForm) => ({
      ...prevForm,
      selectedIngredients: updatedIngredients,
    }));
  };

  // Removes a selected ingredient from the dish form state.
  const removeIngredient = (index) => {
    const updatedIngredients = [...dishForm.selectedIngredients];
    updatedIngredients.splice(index, 1);
    setDishForm((prevForm) => ({
      ...prevForm,
      selectedIngredients: updatedIngredients,
    }));
  };

  // Submits the dish form, either creating a new dish or updating an existing one based on the editing state.
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // if (editing===false && existingDishNames.includes(dishForm.name.toLowerCase())) {
    //   alert(
    //     "A dish with this name already exists. Please choose a different name."
    //   );
    //   return;
    // }
    setErrorMessage("");
    setNotification("");

    if (dishForm.selectedIngredients.length < 1) {
      alert("Please select at least one ingredient.");
      return;
    }

    // Validate that all units are selected
    for (const ingredient of dishForm.selectedIngredients) {
      if (!ingredient.unit) {
        alert("Please select a unit for each ingredient.");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("name", dishForm.name);
      formData.append("description", dishForm.description);
      formData.append("price", dishForm.price);
      formData.append("allergies", dishForm.allergies);
      formData.append("discount", dishForm.discount || 0);
      if (dishForm.image) {
        formData.append("image", dishForm.image);
      }
      formData.append("is_active", dishForm.is_active);
      formData.append(
        "ingredients",
        JSON.stringify(dishForm.selectedIngredients)
      );

      if (editing) {
        await axios.put(
          `http://localhost:3001/dishes/${selectedDishId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post("http://localhost:3001/dishes", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setDishForm({
        name: "",
        description: "",
        price: "",
        allergies: "",
        image: null,
        is_active: true,
        selectedIngredients: [],
        discount: 0,
      });
      setEditing(false);
      setSelectedDishId(null);
      fetchDishes();
      fetchIngredients();
      if (document.getElementById("image")) {
        document.getElementById("image").value = "";
      }
      setIsModalOpen(false); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting form:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  // const handleUnitListChange = async (e) => {
  //   try {
  //     console.log(e, "selected unit");
  //     const units = await axios.post("/dishes/units", { unit: e });
  //     console.log(units);
  //     setAvailableUnits(units.data);
  //   } catch (error) {
  //     console.error("Error fetching units:", error);
  //   }
  // };
  // Prepares the dish form for editing by fetching the specific dish's details and ingredients.
  const handleEditClick = async (dish) => {
    console.log("Edit click initiated for dish:", dish);

    try {
      // Fetch ingredients for the specific dish
      const ingredientsResponse = await axios.get(
        `http://localhost:3001/dishes/${dish.ID}/ingredients`
      );
      const dishIngredients = ingredientsResponse.data || [];

      setDishForm({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        allergies: dish.allergies,
        image: dish.image_path || null, // Use dish.image_path instead of null
        is_active: dish.is_active,
        discount: dish.discount || 0,
        selectedIngredients: dishIngredients.map((ing) => ({
          ingredientId: ing.ingredient_id.toString(),
          quantity_needed: ing.quantity_needed
            ? ing.quantity_needed.toString()
            : "1",
          unit: ing.unit || "",
        })),
      });

      setEditing(true);
      setSelectedDishId(dish.ID);
      setIsModalOpen(true); // Open the modal
    } catch (error) {
      console.error("Error fetching dish ingredients:", error);
    }
  };

  // Prepares to archive or unarchive a dish, setting the necessary state for confirmation.
  const handleArchiveClick = (dish) => {
    setSelectedRow(dish);
    setIsDishArchived(dish.isArchived === "yes"); // Check if the dish is archived
    setArchivedDishId(dish.ID);
    setIsArchiveConfirmOpen(true);
  };

  // Confirms the archiving or unarchiving of a dish and updates the server accordingly.
  const confirmDelete = async () => {
    try {
      if (isDishArchived) {
        // Unarchive the dish
        await axios.patch(
          `http://localhost:3001/dishes/${archiveDishId}/unarchive`
        );
      } else {
        // Archive the dish
        await axios.delete(`http://localhost:3001/dishes/${archiveDishId}`);
      }
      fetchDishes(); // Refresh the dishes list
    } catch (error) {
      console.error("Error archiving/unarchiving dish:", error);
    } finally {
      setIsArchiveConfirmOpen(false);
      setArchivedDishId(null);
      setSelectedRow(null);
    }
  };

  // Toggles the active status of a dish and updates the server with the new status.
  const handleToggleActive = async (id, isActive) => {
    try {
      await axios.patch(`http://localhost:3001/dishes/${id}/active`, {
        is_active: isActive,
      });
      fetchDishes(); // Refresh the dishes list
    } catch (error) {
      console.error("Error updating active status:", error);
    }
  };

  // Prepares the dish form for adding a new dish and opens the modal.
  const handleAddNewDish = () => {
    setDishForm({
      name: "",
      description: "",
      price: "",
      allergies: "",
      image: null,
      is_active: true,
      selectedIngredients: [],
      discount: 0,
    });
    setEditing(false);
    setSelectedDishId(null);
    setIsModalOpen(true); // Open the modal for adding new dish
  };

  // Initiates the editing process for the currently selected row in the DataGrid.
  const handleEditSelectedRow = () => {
    if (selectedRow) {
      handleEditClick(selectedRow);
    }
  };

  // Defines the columns for the DataGrid displaying the dishes.
  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      flex: 1,
      valueFormatter: (params) => `₪${parseFloat(params).toFixed(2)}`,
    },
    { field: "allergies", headerName: "Allergies", flex: 1 },
    {
      field: "ingredients",
      headerName: "Ingredients",
      flex: 2,
      renderCell: (params) => {
        const ingredientNames = params.row.ingredients
          ? params.row.ingredients.map((ingredient) => {
              const ingredientName = ingredients.find(
                (ing) => ing.ID === parseInt(ingredient.ingredient_id, 10)
              )?.name;
              return ingredientName || "Unknown Ingredient";
            })
          : [];
        return <div>{ingredientNames.join(", ")}</div>;
      },
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
          {params.row.isArchived === "yes" ? (
            ""
          ) : params.value ? (
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
        <>
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
            onClick={() => handleArchiveClick(params.row)}
            title="Delete"
            startIcon={<FaArchive />}
          >
            {params.row.isArchived === "yes" ? "Unarchive" : "Archive"}
          </Button>
        </>
      ),
      headerAlign: "center",
    },
    { field: "isArchived", headerName: "is Archived", flex: 1 },
  ];

  // Prepares the rows for the DataGrid based on the dishes state.
  const rows = dishes.map((dish) => ({
    ...dish,
  }));
  console.log("Rows for DataGrid:", rows);

  // Filters the rows based on the search term entered by the user.
  const filteredRows = rows.filter((row) => {
    return (
      (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.description &&
        row.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.price &&
        row.price
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (row.allergies &&
        row.allergies.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.is_active &&
        row.is_active
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
    );
  });

  // Sorts the filtered rows based on their active status.
  const sortedRows = filteredRows.sort((a, b) => a.is_active - b.is_active);

  // Renders the component, including the DataGrid, chart, and modal for adding/editing dishes.
  return (
    <div className={styles.dishesPage}>
      <h1
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
          marginTop: "20px",
        }}
      >
        Dishes
      </h1>

      <div
        className={styles.chartContainer}
        style={{
          height: "500px",
          width: "780px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {chartData.labels && chartData.datasets ? (
          <Bar
            data={chartData}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `Ingredients: ${context.raw}`,
                  },
                },
              },
            }}
          />
        ) : (
          <p>No data to display</p>
        )}
      </div>
      {selectedRow && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleEditSelectedRow}
          style={{ marginBottom: "20px" }}
        >
          Edit Selected
        </Button>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification("")}
        />
      )}
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      <div className={styles.buttonContainer}>
        <button onClick={handleAddNewDish} className={styles.addButton}>
          Add New Dish
        </button>
      </div>
      {/* DataGrid for displaying dishes */}
      <div style={{ height: 800, width: "1000px" }}>
        <DataGrid
          rows={sortedRows}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row.id}
          selectionModel={selectionModel}
          onSelectionModelChange={(newSelectionModel) => {
            setSelectionModel(newSelectionModel);
          }}
          disableSelectionOnClick
          // getRowClassName={(params) =>
          //   params.row.is_active ? "" : styles.inactiveRow
          // }
          getRowClassName={(params) =>
            params.row.isArchived === "yes"
              ? styles.archivedRow
              : params.row.is_active
              ? ""
              : styles.inactiveRow
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
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "15px",
            },
          }}
        />
      </div>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
      >
        <DialogTitle style={{ fontSize: "16px" }}>
          {isDishArchived ? "Confirm Unarchive" : "Confirm Archive"}
        </DialogTitle>
        <DialogContent>
          {`Are you sure you want to ${
            isDishArchived ? "unArchive" : "archive"
          } ${selectedRow ? selectedRow.name : "this dish"}?`}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsArchiveConfirmOpen(false)}
            style={{ fontSize: "14px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            style={{ fontSize: "14px", color: "red", marginLeft: "auto" }}
          >
            {isDishArchived ? "Unarchive" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle style={{ fontSize: "18px" }}>
          {editing ? "Edit Dish" : "Add New Dish"}
        </DialogTitle>
        <DialogContent>
          <form
            onSubmit={handleFormSubmit}
            className={styles.form}
            id="dishForm"
          >
            <TextField
              type="text"
              name="name"
              label="Name"
              value={dishForm.name}
              onChange={handleInputChange}
              required
              fullWidth
              style={{ marginBottom: "15px", marginTop: "10px" }}
              InputLabelProps={{ style: { fontSize: "16px" } }}
            />

            <TextField
              name="description"
              label="Description"
              value={dishForm.description}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              fullWidth
              style={{ marginBottom: "15px" }}
              InputLabelProps={{ style: { fontSize: "16px" } }}
            />

            <TextField
              type="number"
              name="price"
              label="Price"
              value={dishForm.price}
              onChange={handleInputChange}
              required
              fullWidth
              style={{ marginBottom: "15px" }}
              InputLabelProps={{ style: { fontSize: "16px" } }}
              inputProps={{ min: "0", step: "0.01" }}
            />

            <TextField
              type="text"
              name="allergies"
              label="Allergies"
              value={dishForm.allergies}
              onChange={handleInputChange}
              fullWidth
              style={{ marginBottom: "15px" }}
              InputLabelProps={{ style: { fontSize: "16px" } }}
            />

            {/* File Input (Note: MUI doesn't have a built-in file input component) */}
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              id="image"
              style={{ marginBottom: "15px" }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="is_active"
                  checked={dishForm.is_active}
                  onChange={handleInputChange}
                  style={{ transform: "scale(1.5)" }}
                />
              }
              label={<span style={{ fontSize: "16px" }}>Active</span>}
              style={{ marginBottom: "15px" }}
            />

            <TextField
              type="number"
              name="discount"
              label="Discount (%)"
              value={dishForm.discount}
              onChange={handleInputChange}
              fullWidth
              style={{ marginBottom: "15px" }}
              InputLabelProps={{ style: { fontSize: "16px" } }}
              inputProps={{ min: "0", max: "100", step: "0.01" }}
            />

            <FormControl fullWidth style={{ marginBottom: "15px" }}>
              <InputLabel style={{ fontSize: "16px" }}>
                Select Ingredient
              </InputLabel>
              <Select
                value=""
                onChange={handleIngredientSelect}
                style={{ fontSize: "14px" }}
              >
                <MenuItem value="" style={{ fontSize: "14px" }}>
                  <em>Select Ingredient</em>
                </MenuItem>
                {ingredients.map((ingredient) => (
                  <MenuItem
                    key={ingredient.ID}
                    value={ingredient.ID.toString()}
                    style={{ fontSize: "14px" }}
                  >
                    {ingredient.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <h2 style={{ marginRight: "auto" }}>Selected Ingredients:</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontSize: "16px" }}>Ingredient</TableCell>
                  <TableCell style={{ fontSize: "16px" }}>
                    Quantity Needed
                  </TableCell>
                  <TableCell style={{ fontSize: "16px" }}>Unit</TableCell>
                  <TableCell style={{ fontSize: "16px" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dishForm.selectedIngredients.map((ingredient, index) => {
                  const ingredientName = ingredients.find(
                    (ing) => ing.ID === parseInt(ingredient.ingredientId, 10)
                  )?.name;

                  const handleUnitChange = (newUnit) => {
                    handleIngredientQuantityChange(index, "unit", newUnit);
                  };

                  return (
                    <TableRow key={ingredient.ingredientId}>
                      <TableCell style={{ fontSize: "16px" }}>
                        {ingredientName || "Unknown Ingredient"}
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={ingredient.quantity_needed}
                          onChange={(e) =>
                            handleIngredientQuantityChange(
                              index,
                              "quantity_needed",
                              e.target.value
                            )
                          }
                          inputProps={{ min: "0.01", step: "0.01" }}
                          InputProps={{
                            style: { fontSize: "16px" },
                          }}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <UnitSelect
                          ingredientUnit={ingredient.unit}
                          onUnitChange={handleUnitChange}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          style={{ fontSize: "16px" }}
                          onClick={() => removeIngredient(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsModalOpen(false)}
            style={{ fontSize: "14px", marginRight: "auto" }}
          >
            Cancel
          </Button>
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <Button
            type="submit"
            form="dishForm"
            variant="contained"
            color="primary"
            style={{ fontSize: "14px" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dishes;
