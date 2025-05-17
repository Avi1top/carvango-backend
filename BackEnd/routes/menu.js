const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");

// Fetch all active dishes with all active ingredients and their corresponding active extras
router.get("/", async (req, res) => {
  try {
    // Query to get all dishes where all ingredients are active
    const query = `
      SELECT d.*
      FROM dishes d
      JOIN ingrediants_dishes id ON d.ID = id.dish_id
      JOIN ingredients i ON id.ingredient_id = i.ID
      WHERE d.is_active = 1 AND d.isArchived = 'no'
      GROUP BY d.ID
      HAVING COUNT(i.is_active = 1 OR NULL) = (SELECT COUNT(*) FROM ingrediants_dishes id2 WHERE id2.dish_id = d.ID)
    `;

    // Fetch dishes where all ingredients are active
    const dishes = await doQuery(query);

    // Fetch only active extras
    const activeExtras = await doQuery(
      "SELECT * FROM extras WHERE is_active = 1"
    );

    // Attach active extras to their corresponding dishes
    const dishesWithExtras = dishes.map((dish) => {
      const extrasForDish = activeExtras.filter((extra) => {
        // Assuming there's a link between dish and extras in extras_dishes table
        return extra.dish_id === dish.ID;
      });
      return { ...dish, extras: extrasForDish };
    });

    res.json(dishesWithExtras);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    res.status(500).json({ error: "Error fetching dishes" });
  }
});

// Add a new dish to the database
router.post("/", async (req, res) => {
  try {
    const { name, price, description, allergies, image_path, is_active } =
      req.body;
    const sql =
      "INSERT INTO dishes (name, price, description, allergies, image_path, is_active) VALUES (?, ?, ?, ?, ?, ?)";
    const result = await doQuery(sql, [
      name,
      price,
      description,
      allergies,
      image_path,
      is_active,
    ]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error adding dish:", error);
    res.status(500).json({ error: "Error adding dish" });
  }
});

// Update an existing dish's details by its ID
router.put("/:id", async (req, res) => {
  try {
    const { name, price, description, allergies, image_path, is_active } =
      req.body;
    const sql =
      "UPDATE dishes SET name = ?, price = ?, description = ?, allergies = ?, image_path = ?, is_active = ? WHERE ID = ?";
    await doQuery(sql, [
      name,
      price,
      description,
      allergies,
      image_path,
      is_active,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating dish:", error);
    res.status(500).json({ error: "Error updating dish" });
  }
});

// Export the router for use in other parts of the application
module.exports = router;
