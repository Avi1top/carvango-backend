// routes/dishes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const doQuery = require("../database/query");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Get all dishes with optional search, excluding archived ones
// Fetches all dishes based on an optional search term, excluding archived dishes.
router.get("/", async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    let query = "SELECT * FROM dishes";
    let params = [];
    let whereClause = [];

    // Proceed only if searchTerm is not empty
    if (searchTerm && searchTerm.trim() !== "") {
      const searchPattern = `%${searchTerm}%`;
      whereClause.push(
        "(name LIKE ? OR description LIKE ? OR allergies LIKE ?)"
      );
      params.push(searchPattern, searchPattern, searchPattern);

      // Handle number search (price)
      const searchAsNumber = parseFloat(searchTerm);
      if (!isNaN(searchAsNumber)) {
        whereClause.push("price = ?");
        params.push(searchAsNumber);
      }
    }

    // If there are any conditions, add them to the query
    if (whereClause.length > 0) {
      query += " AND " + whereClause.join(" OR ");
    }

    // Debugging statements
    console.log("Final Query:", query);
    console.log("Parameters:", params);

    // Fetch dishes based on the search query, excluding archived ones
    let dishes = await doQuery(query, params);

    // If no dishes are found and search term is provided, fetch all unarchived dishes
    if (dishes.length === 0 && searchTerm) {
      query = "SELECT * FROM dishes WHERE isArchived = 'no'";
      dishes = await doQuery(query, []);
    }

    // Send the response
    res.json(dishes);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    res.status(500).json({ error: "Error fetching dishes" });
  }
});

// //fitches the units of measurement from the database
// router.post("/units", async (req, res) => {
//   try {
//     console.log(req.body,"in units body");
//     const { unit } = req.body;
//     const result =await doQuery("select value from others where name = ?", [unit]);

//     console.log(result,"in units");
//     if (result.length > 0) {
//       res.json({ value: result[0].value });
//     } else {
//       res.status(404).json({ error: "unit not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching units:", error);
//     res.status(500).json({ error: "Error fetching units" });
//   }
// });

// Add a new dish
// Adds a new dish to the database along with its ingredients.
router.post("/", upload.single("image"), async (req, res) => {
  const { name, description, price, allergies, is_active, discount } = req.body;
  const ingredients = JSON.parse(req.body.ingredients); // [{ ingredientId, quantity_needed, unit }, ...]
  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Check if there is sufficient quantity for each ingredient
    console.log("Checking ingredient quantities...");
    let insufficientIngredients = [];

    for (const ingredient of ingredients) {
      const { ingredientId, quantity_needed, unit } = ingredient;
      
      // Fetch current quantity from the database
      const result = await doQuery(
        "SELECT quantities, unit FROM ingredients WHERE ID = ?",
        [ingredientId]
      );

      if (result.length === 0) {
        throw new Error(`Ingredient with ID ${ingredientId} not found`);
      }

      const { quantities: currentQuantity, unit: ingredientUnit } = result[0];

      // Convert quantity_needed to the unit of the ingredient
      const totalQuantityNeeded = convertUnits(
        quantity_needed * 3, // Triple the amount needed
        unit || ingredientUnit,
        ingredientUnit
      );

      if (currentQuantity < totalQuantityNeeded) {
        insufficientIngredients.push(`Ingredient ID: ${ingredientId}`);
      }
    }

    if (insufficientIngredients.length > 0) {
      console.log("Some ingredients are insufficient", insufficientIngredients);
      return res.status(400).json({
        message: "Some ingredients are insufficient",
        insufficientIngredients,
      });
    }

    // Start a transaction
    await doQuery("START TRANSACTION");

    // Insert dish
    const result = await doQuery(
      "INSERT INTO dishes (name, price, allergies, description, image_path, is_active, discount) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        price,
        allergies,
        description,
        image_path,
        is_active,
        discount || 0,
      ]
    );
    const dishId = result.insertId;

    // Insert dish-ingredient relationships with quantity_needed and unit
    for (const ingredient of ingredients) {
      const { ingredientId, quantity_needed, unit } = ingredient;
      await doQuery(
        "INSERT INTO ingrediants_dishes (dish_id, ingredient_id, quantity_needed, unit) VALUES (?, ?, ?, ?)",
        [dishId, ingredientId, quantity_needed, unit]
      );
    }

    // Commit the transaction
    await doQuery("COMMIT");

    res.status(201).json({ message: "Dish added successfully" });
  } catch (error) {
    console.error("Error adding dish:", error.message);
    // Rollback the transaction in case of error
    await doQuery("ROLLBACK");
    res.status(500).json({ error: "Error adding dish" });
  }
});

// Get ingredients for a specific dish
// Retrieves all ingredients associated with a specific dish.
router.get("/:id/ingredients", async (req, res) => {
  try {
    const dishId = req.params.id;
    const ingredients = await doQuery(
      "SELECT * FROM ingrediants_dishes WHERE dish_id = ?",
      [dishId]
    );
    res.json(ingredients);
  } catch (error) {
    console.error("Error fetching dish ingredients:", error);
    res.status(500).json({ error: "Error fetching dish ingredients" });
  }
});

// Update a dish
// Updates the details of an existing dish, including its ingredients.
router.put("/:id", upload.single("image"), async (req, res) => {
  console.log(req.body, "ddeedefveevve");
  const { name, description, price, allergies, is_active, discount } = req.body;
  const ingredients = JSON.parse(req.body.ingredients); // [{ ingredientId, quantity_needed, unit }, ...]
  const new_image_path = req.file ? `/uploads/${req.file.filename}` : undefined;
  console.log(new_image_path, "new image path");

  try {
    // Start a transaction
    await doQuery("START TRANSACTION");

    // Update dish details
    if (new_image_path !== undefined) {
      // Update with new image
       const oldDish = await doQuery(
         "SELECT image_path FROM dishes WHERE ID = ?",
         [req.params.id]

         // Delete old image file
       );
      await doQuery(
        "UPDATE dishes SET name = ?, description = ?, price = ?, allergies = ?, image_path = ?, is_active = ?, discount = ? WHERE ID = ?",
        [
          name,
          description,
          price,
          allergies,
          new_image_path,
          is_active,
          discount || 0,
          req.params.id,
        ]
      );
     
      if (oldDish[0] && oldDish[0].image_path) {
        const fullImagePath = path.join(__dirname, "..", oldDish[0].image_path);
        fs.unlink(fullImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image file:", err);
          } else {
            console.log("Old image file deleted successfully");
          }
        });
      }
    } else {
      // Update without changing image
      await doQuery(
        "UPDATE dishes SET name = ?, description = ?, price = ?, allergies = ?, is_active = ?, discount = ? WHERE ID = ?",
        [
          name,
          description,
          price,
          allergies,
          is_active,
          discount || 0,
          req.params.id,
        ]
      );
    }

    // Delete existing dish-ingredient relationships
    await doQuery("DELETE FROM ingrediants_dishes WHERE dish_id = ?", [
      req.params.id,
    ]);

    // Insert new dish-ingredient relationships with quantity_needed and unit
    for (const ingredient of ingredients) {
      const { ingredientId, quantity_needed, unit } = ingredient;
      await doQuery(
        "INSERT INTO ingrediants_dishes (dish_id, ingredient_id, quantity_needed, unit) VALUES (?, ?, ?, ?)",
        [req.params.id, ingredientId, quantity_needed, unit]
      );
    }

    // Commit the transaction
    await doQuery("COMMIT");

    res.status(200).json({ message: "Dish updated successfully" });
  } catch (error) {
    console.error("Error updating dish:", error);
    // Rollback the transaction in case of error
    await doQuery("ROLLBACK");
    res.status(500).json({ error: "Error updating dish" });
  }
});

// Update dish active status
// Updates the active status of a dish (active/inactive).
router.patch("/:id/active", async (req, res) => {
  const { is_active } = req.body;
  try {
    await doQuery("UPDATE dishes SET is_active = ? WHERE ID = ?", [
      is_active,
      req.params.id,
    ]);
    res
      .status(200)
      .json({ message: "Dish active status updated successfully" });
  } catch (error) {
    console.error("Error updating dish active status:", error);
    res.status(500).json({ error: "Error updating dish active status" });
  }
});

// Delete a dish
// Soft-deletes a dish by marking it as archived.
router.delete("/:id", async (req, res) => {
  try {
    const dishId = req.params.id;

    // Set isArchived to 'yes' instead of deleting the dish
    await doQuery(
      "UPDATE dishes SET isArchived = 'yes' ,is_active = 0 WHERE ID = ?",
      [dishId]
    );

    res.status(200).json({ message: "Dish archived successfully" });
  } catch (error) {
    console.error("Error archiving dish:", error);
    res.status(500).json({ error: "Error archiving dish" });
  }
});

// Unarchive a dish by setting isArchived to 'no'
// Restores a previously archived dish.
router.patch("/:id/unarchive", async (req, res) => {
  try {
    const dishId = req.params.id;

    // Set isArchived to 'no' to unarchive the dish
    await doQuery("UPDATE dishes SET isArchived = 'no' WHERE ID = ?", [dishId]);

    res.status(200).json({ message: "Dish unarchived successfully" });
  } catch (error) {
    console.error("Error unarchiving dish:", error);
    res.status(500).json({ error: "Error unarchiving dish" });
  }
});

// Check inventory levels for a meal
// Checks if the ingredients for a specific meal are in stock.
router.get("/checkInventory/:mealId", async (req, res) => {
  const mealId = req.params.mealId;

  try {
    // Get the ingredients for the meal
    const ingredients = await doQuery(
      "SELECT ingredient_id, quantity_needed, unit FROM ingrediants_dishes WHERE dish_id = ?",
      [mealId]
    );

    // Check inventory levels
    let lowStockIngredients = [];
    for (const ingredient of ingredients) {
      const result = await doQuery(
        "SELECT name, quantities, unit FROM ingredients WHERE ID = ?",
        [ingredient.ingredient_id]
      );

      // Convert quantity_needed to ingredient's unit
      const totalQuantityNeeded = convertUnits(
        ingredient.quantity_needed,
        ingredient.unit || result[0].unit,
        result[0].unit
      );

      if (result[0].quantities < totalQuantityNeeded) {
        lowStockIngredients.push(result[0].name);
      }
    }

    if (lowStockIngredients.length > 0) {
      res.json({
        warning: true,
        message: `The following ingredients are low in stock: ${lowStockIngredients.join(
          ", "
        )}`,
      });
    } else {
      res.json({ warning: false });
    }
  } catch (error) {
    console.error("Error checking inventory levels:", error);
    res.status(500).json({ error: "Error checking inventory levels" });
  }
});

// Unit conversion function
// Converts quantities between different units of measurement.
function convertUnits(quantity, fromUnit, toUnit) {
  try {
    const conversionTable = {
      // Weight units in grams
      "KG": 1000,
      "G": 1,
      "gram": 1,
      // Volume units in milliliters
      "L": 1000,
      "ML": 1,
      "M/L": 1,
      // Piece units
      "piece": 1,
    };

    console.log(`Converting ${quantity} from ${fromUnit} to ${toUnit}`);

    // If the units are the same, no conversion is needed
    if (fromUnit === toUnit) {
      return quantity;
    }

    // List of unit categories
    const weightUnits = ["KG", "G", "gram"];
    const volumeUnits = ["L", "ML", "M/L"];
    const pieceUnits = ["piece"];

    // If the units are compatible, perform conversion
    if (
      (weightUnits.includes(fromUnit) && weightUnits.includes(toUnit)) ||
      (volumeUnits.includes(fromUnit) && volumeUnits.includes(toUnit)) ||
      (pieceUnits.includes(fromUnit) && pieceUnits.includes(toUnit))
    ) {
      const convertedQuantity =
        (quantity * conversionTable[fromUnit]) / conversionTable[toUnit];
      console.log(`Converted quantity: ${convertedQuantity}`);
      return convertedQuantity;
    }

    // If units are incompatible (like piece and KG), keep the quantity the same
    console.log("Incompatible units, keeping the same quantity");
    return quantity;
  } catch (error) {
    console.error(
      `Error converting units from ${fromUnit} to ${toUnit}:`,
      error
    );
    throw error;
  }
}
module.exports = router;
