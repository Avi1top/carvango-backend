// routes/extras.js
const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");

// Updated GET route to include ingredient data
router.get("/", async (req, res) => {
  const { search } = req.query;
  let query = `
    SELECT e.*, ie.quantity AS quantity_needed, ie.unit AS needed_unit, ie.ingredient_id, i.name AS ingredient_name
    FROM extras e
    JOIN ingredients_extras ie ON e.ID = ie.extra_id
    JOIN ingredients i ON ie.ingredient_id = i.ID
  `;
  const queryParams = [];

  if (search) {
    query += " WHERE e.name LIKE ? OR e.unit LIKE ? OR i.name LIKE ?";
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);

    // Check if the search is a number for numeric fields
    const searchAsNumber = Number(search);
    if (!isNaN(searchAsNumber)) {
      query += " OR e.price = ?";
      queryParams.push(searchAsNumber);
    }
  }

  try {
    const extras = await doQuery(query, queryParams);
    res.json(extras);
  } catch (error) {
    console.error("Error fetching extras:", error);
    res.status(500).json({ error: "Error fetching extras" });
  }
});

// Add a new extra
router.post("/", async (req, res) => {
  console.log("lllllllllllllllllllllll",req.body);
  const {
    name,
    unit,
    price,
    is_active,
    discount,
    ingredient_id,
    quantity_needed,
  } = req.body;
  
  if (
    !name ||
    !unit ||
    !price ||
    !ingredient_id ||
    !quantity_needed 
  ) {
    console.log("All fields are required");
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Start transaction
    await doQuery("START TRANSACTION");

    // Insert into extras table
    const result = await doQuery(
      "INSERT INTO extras (name, unit, price, is_active, discount) VALUES (?, ?, ?, ?, ?)",
      [name, unit, price, is_active, discount || 0]
    );
    const extraId = result.insertId;

    // Insert into ingredients_extras table with unit
    await doQuery(
      "INSERT INTO ingredients_extras (extra_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)",
      [extraId, ingredient_id, quantity_needed, unit]
    );

    // Commit transaction
    await doQuery("COMMIT");
    res.status(201).json({ message: "Extra added successfully" });
  } catch (error) {
    await doQuery("ROLLBACK");
    console.error("Error adding extra:", error);
    res.status(500).json({ error: "Error adding extra" });
  }
});

//put update extra data and ingredients
router.put("/:id", async (req, res) => {
  console.log("lllllllllllllllllllllll",req.body);
  const {
    name,
    unit,
    price,
    is_active,
    discount,
    ingredient_id,
    quantity_needed,
  } = req.body;

  if (
    !name ||
    !unit ||
    !price ||
    !ingredient_id ||
    !quantity_needed 
    ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Start transaction
    await doQuery("START TRANSACTION");

    // Update extras table
    await doQuery(
      "UPDATE extras SET name = ?, unit = ?, price = ?, is_active = ?, discount = ? WHERE ID = ?",
      [name, unit, price, is_active, discount || 0, req.params.id]
    );

    // Update ingredients_extras table
    await doQuery("DELETE FROM ingredients_extras WHERE extra_id = ?", [
      req.params.id,
    ]);
    await doQuery(
      "INSERT INTO ingredients_extras (extra_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)",
      [req.params.id, ingredient_id, quantity_needed, unit]
    );

    // Commit transaction
    await doQuery("COMMIT");
    res.status(200).json({ message: "Extra updated successfully" });
  } catch (error) {
    await doQuery("ROLLBACK");
    console.error("Error updating extra:", error);
    res.status(500).json({ error: "Error updating extra" });
  }
});

// Get ingredient details for a specific extra
router.get("/:id/ingredient", async (req, res) => {
  try {
    const extraId = req.params.id;
    const [ingredient] = await doQuery(
      "SELECT ie.*, i.name FROM ingredients_extras ie JOIN ingredients i ON ie.ingredient_id = i.ID WHERE ie.extra_id = ?",
      [extraId]
    );
    res.json(ingredient);
  } catch (error) {
    console.error("Error fetching extra ingredient:", error);
    res.status(500).json({ error: "Error fetching extra ingredient" });
  }
});

// Update extra active status
router.patch("/:id/active", async (req, res) => {
  const { is_active } = req.body;
  try {
    await doQuery("UPDATE extras SET is_active = ? WHERE ID = ?", [
      is_active,
      req.params.id,
    ]);
    res
      .status(200)
      .json({ message: "Extra active status updated successfully" });
  } catch (error) {
    console.error("Error updating extra active status:", error);
    res.status(500).json({ error: "Error updating extra active status" });
  }
});

// Delete an extra
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Start transaction
    await doQuery("START TRANSACTION");

    // Delete from ingredients_extras table
    await doQuery("DELETE FROM ingredients_extras WHERE extra_id = ?", [id]);

    // Delete from extras table
    await doQuery("DELETE FROM extras WHERE ID = ?", [id]);

    // Commit transaction
    await doQuery("COMMIT");

    res.status(200).json({ message: "Extra deleted successfully" });
  } catch (error) {
    await doQuery("ROLLBACK");
    console.error("Error deleting extra:", error);
    res.status(500).json({ error: "Error deleting extra" });
  }
});

// Get active extras for menu
router.get("/menu", async (req, res) => {
  try {
    const extras = await doQuery("SELECT * FROM extras WHERE is_active = 1");
    res.json(extras);
  } catch (error) {
    console.error("Error fetching extras:", error);
    res.status(500).json({ error: "Error fetching extras" });
  }
});

module.exports = router;
