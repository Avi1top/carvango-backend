// routes/ingredients.js
const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");

// Fetch all ingredients, optionally filtered by a search term.
router.get("/", async (req, res) => {
  const { search } = req.query; // Get the search query from request parameters
  let query = "SELECT * FROM ingredients";
  let params = [];

  // If a search query is provided, modify the SQL query to filter results
  if (search) {
    query += " WHERE name LIKE ? OR quantities LIKE ? OR unit LIKE ?";
    const searchTerm = `%${search}%`; // Use wildcard for partial matching
    params.push(searchTerm, searchTerm, searchTerm); // Add the same search term for all columns
  }

  try {
    const ingredients = await doQuery(query, params);
    res.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: "Error fetching ingredients" });
  }
});

// Fetch all active ingredients from the database.
router.get("/active", async (req, res) => {
  try {
    const ingredients = await doQuery("SELECT * FROM ingredients WHERE is_active = 1");
    res.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: "Error fetching ingredients" });
  }
});

// Fetch a specific ingredient by its ID.
router.get("/:id", async (req, res) => {
  try {
    const ingredient = await doQuery("SELECT * FROM ingredients WHERE ID = ?", [
      req.params.id,
    ]);
    if (ingredient.length > 0) {
      res.json(ingredient[0]);
    } else {
      res.status(404).json({ message: "Ingredient not found" });
    }
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    res.status(500).json({ error: "Error fetching ingredient" });
  }
});

// Add a new ingredient to the database.
router.post("/", async (req, res) => {
  const { name, quantities, unit, is_active } = req.body;
  if (!name || !quantities || !unit) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const result = await doQuery(
      "INSERT INTO ingredients (name, quantities, unit, is_active) VALUES (?, ?, ?, ?)",
      [name, quantities, unit, is_active]
    );
    res.status(201).json({
      message: "Ingredient added successfully",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding ingredient:", error);
    res.status(500).json({ error: "Error adding ingredient" });
  }
});

// Update an existing ingredient's details by its ID.
router.put("/:id", async (req, res) => {
  const { name, unit, quantities, is_active } = req.body;
  if (!name || !quantities || !unit) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    await doQuery(
      "UPDATE ingredients SET name = ?, unit = ?, quantities = ?, is_active = ? WHERE ID = ?",
      [name, unit, quantities, is_active, req.params.id]
    );
    res.status(200).json({ message: "Ingredient updated successfully" });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    res.status(500).json({ error: "Error updating ingredient" });
  }
});

// Delete an ingredient from the database by its ID.
router.delete("/:id", async (req, res) => {
  try {
    await doQuery("DELETE FROM ingredients WHERE ID = ?", [req.params.id]);
    res.status(200).json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    res.status(500).json({ error: "Error deleting ingredient" });
  }
});

// Update the active status of an ingredient by its ID.
router.patch("/:id/active", async (req, res) => {
  const { is_active } = req.body;
  try {
    await doQuery("UPDATE ingredients SET is_active = ? WHERE ID = ?", [
      is_active,
      req.params.id,
    ]);
    res
      .status(200)
      .json({ message: "Ingredient active status updated successfully" });
  } catch (error) {
    console.error("Error updating ingredient active status:", error);
    res.status(500).json({ error: "Error updating ingredient active status" });
  }
});

// Reduce the quantity of an ingredient by a specified amount.
router.patch("/:id/reduce", async (req, res) => {
  const { quantity } = req.body;
  try {
    const result = await doQuery(
      "UPDATE ingredients SET quantities = quantities - ? WHERE ID = ?",
      [quantity, req.params.id]
    );
    res
      .status(200)
      .json({ message: "Ingredient quantity reduced successfully" });
  } catch (error) {
    console.error("Error reducing ingredient quantity:", error);
    res.status(500).json({ error: "Error reducing ingredient quantity" });
  }
});

module.exports = router;
