// routes/orders.js
const express = require("express");
const router = express.Router();
const db = require("../database/db");
const doQuery = require("../database/query"); // Make sure the path to doQuery is correct

// GET: Fetch all orders with optional search query
// Retrieves orders based on status and search criteria, returning relevant order details.
router.get("/get-orders", async (req, res) => {
  const { status, search } = req.query;
  let query = `
    SELECT 
      o.ID, 
      o.order_status, 
      o.discounts, 
      o.detailed_price, 
      o.date, 
      o.shipping_address, 
      p.first_name as customer_first_name, 
      p.last_name as customer_last_name, 
      p.email as customer_email
    FROM orders o
    LEFT JOIN people_orders po ON o.ID = po.order_id
    LEFT JOIN people p ON po.email = p.email
  `;

  const queryParams = [];

  if (status) {
    query += " WHERE o.order_status = ?";
    queryParams.push(status);
  }

  if (search) {
    if (queryParams.length > 0) {
      query += " AND";
    } else {
      query += " WHERE";
    }
    query += ` (
      o.ID LIKE ? OR 
      o.order_status LIKE ? OR 
      o.discounts LIKE ? OR 
      o.detailed_price LIKE ? OR 
      o.date LIKE ? OR 
      o.shipping_address LIKE ? OR 
      p.first_name LIKE ? OR 
      p.last_name LIKE ? OR 
      p.email LIKE ?
    )`;
    const searchPattern = `%${search}%`;
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }

  query += " ORDER BY o.date DESC;";

  try {
    const rows = await doQuery(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// GET: Fetch orders by customer email
// Retrieves orders associated with a specific customer's email address.
router.get("/orders-by-email", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const query = `
      SELECT 
        o.ID, o.order_status, o.discounts, o.detailed_price, o.date, 
        o.shipping_address, 
        p.first_name as customer_first_name, p.last_name as customer_last_name, p.email as customer_email
      FROM orders o
      JOIN people_orders po ON o.ID = po.order_id
      JOIN people p ON po.email = p.email
      WHERE p.email = ?
    `;

    const rows = await doQuery(query, [email]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// POST: Add a new order
// Processes the order data, inserts it into the database, and manages ingredient deductions.
router.post("/add-order", async (req, res) => {
  console.log("Received order data:", req.body);
  const {
    discounts,
    total, // Updated from detailed_price to total
    date,
    customer,
    items,
  } = req.body;
  const order_status = "Completed";
  console.log("Order items:", items);
  // Ensure shipping_address is defined
  const safeShippingAddress =
    customer.address !== undefined ? customer.address : "";

  try {
    console.log("Starting transaction...");
    // Start a transaction
    await doQuery("START TRANSACTION");

    // Insert into orders table
    console.log("Inserting into orders table...");
    const orderResult = await doQuery(
      "INSERT INTO orders (order_status, discounts, detailed_price, date, shipping_address) VALUES (?, ?, ?, ?, ?)",
      [order_status, discounts, total, date, safeShippingAddress] // Use 'total' instead of 'detailed_price'
    );

    console.log("Order inserted", orderResult);

    const orderId = orderResult.insertId;

    // Insert into people_orders table
    if (customer.email) {
      console.log("Inserting customer email into people_orders...");
      await doQuery(
        "INSERT INTO people_orders (email, order_id) VALUES (?, ?)",
        [customer.email, orderId]
      );
      console.log("Customer email inserted");
    } else {
      throw new Error("Customer email is missing");
    }

    // Prepare a map for ingredient deductions
    const ingredientDeductionMap = {};

    // Unit conversion function with logging for debugging
    /**
     * Converts units from one measurement to another.
     * @param {number} quantity - The quantity to convert.
     * @param {string} fromUnit - The unit to convert from.
     * @param {string} toUnit - The unit to convert to.
     * @returns {number} - The converted quantity.
     */
    function convertUnits(quantity, fromUnit, toUnit) {
      try {
        const conversionTable = {
          // Weight units in grams
          KG: 1000,
          G: 1,
          gram: 1,
          // Volume units in milliliters
          L: 1000,
          ML: 1,
          "M/L": 1,
          // Piece units
          piece: 1,
        };

        console.log(`Converting ${quantity} from ${fromUnit} to ${toUnit}`);

        // If the units are the same, no conversion is needed
        if (fromUnit === toUnit) {
          return quantity;
        }

        // List of unit categories
        const weightUnits = ["KG", "G", "gram"];
        const volumeUnits = ["L", "M/L", "ML"];
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

    // Insert into order_dishes table and process deductions
    // Iterates through each item in the order, inserting into order_dishes and calculating ingredient needs.
    for (const item of items) {
      const { dishID, quantity: orderQuantity, extras } = item;

      console.log(
        `Inserting dish ${dishID} with quantity ${orderQuantity} into order_dishes...`
      );
      // Insert into order_dishes
      await doQuery(
        "INSERT INTO order_dishes (order_id, dish_id, quantity) VALUES (?, ?, ?)",
        [orderId, dishID, orderQuantity]
      );
      console.log("Dish inserted");

      // Get ingredients and quantities needed for the dish
      console.log(`Fetching ingredients for dish ${dishID}...`);
      const dishIngredients = await doQuery(
        "SELECT id.ingredient_id, id.quantity_needed, i.unit AS ingredient_unit, id.unit AS needed_unit FROM ingrediants_dishes id JOIN ingredients i ON id.ingredient_id = i.ID WHERE id.dish_id = ?",
        [dishID]
      );
      console.log("Ingredients fetched:", dishIngredients);

      for (const ingredient of dishIngredients) {
        const { ingredient_id, quantity_needed, ingredient_unit, needed_unit } =
          ingredient;

        console.log(`Converting quantity for ingredient ${ingredient_id}`);
        // Convert quantity_needed to the unit of the ingredient
        const convertedQuantityNeeded = convertUnits(
          quantity_needed,
          needed_unit || ingredient_unit, // Assume needed_unit is same as ingredient_unit if not specified
          ingredient_unit
        );

        const totalQuantityNeeded = convertedQuantityNeeded * orderQuantity;
        console.log(
          `Total quantity needed for ingredient ${ingredient_id}: ${totalQuantityNeeded}`
        );

        if (ingredientDeductionMap[ingredient_id]) {
          ingredientDeductionMap[ingredient_id] += totalQuantityNeeded;
        } else {
          ingredientDeductionMap[ingredient_id] = totalQuantityNeeded;
        }
      }

      // Process extras if any
      // Handles any additional items (extras) associated with the order and calculates their ingredient needs.
      if (extras && extras.length > 0) {
        for (const extra of extras) {
          const { extraID, quantity: extraQuantity } = extra;

          console.log(
            `Processing extra ${extraID} with quantity ${extraQuantity}`
          );
          // Get the ingredient and quantity needed for the extra
          const extraIngredientData = await doQuery(
            "SELECT ie.ingredient_id, ie.quantity AS quantity_needed, i.unit AS ingredient_unit, ie.unit AS needed_unit FROM ingredients_extras ie JOIN ingredients i ON ie.ingredient_id = i.ID WHERE ie.extra_id = ?",
            [extraID]
          );

          if (extraIngredientData.length === 0) {
            throw new Error(
              `No ingredient associated with Extra ID ${extraID}`
            );
          }

          const {
            ingredient_id,
            quantity_needed,
            ingredient_unit,
            needed_unit,
          } = extraIngredientData[0];

          console.log(
            `Converting quantity for extra ingredient ${ingredient_id}`
          );
          // Convert quantity_needed to the unit of the ingredient
          const convertedQuantityNeeded = convertUnits(
            quantity_needed,
            needed_unit || ingredient_unit,
            ingredient_unit
          );

          const totalQuantityNeeded =
            convertedQuantityNeeded * extraQuantity * orderQuantity;
          console.log(
            `Total quantity needed for extra ingredient ${ingredient_id}: ${totalQuantityNeeded}`
          );

          if (ingredientDeductionMap[ingredient_id]) {
            ingredientDeductionMap[ingredient_id] += totalQuantityNeeded;
          } else {
            ingredientDeductionMap[ingredient_id] = totalQuantityNeeded;
          }
        }
      }
    }

    // Check if there is sufficient quantity for each ingredient
    // Validates that there is enough stock for each ingredient required for the order.
    console.log("Checking ingredient quantities...");
    let outOfStock = [];

    for (const [ingredientId, totalQuantityNeeded] of Object.entries(
      ingredientDeductionMap
    )) {
      console.log(`Checking quantity for ingredient ${ingredientId}`);
      const ingredientRows = await doQuery(
        "SELECT quantities, unit FROM ingredients WHERE ID = ?",
        [ingredientId]
      );
      if (ingredientRows.length === 0) {
        throw new Error(`Ingredient with ID ${ingredientId} not found`);
      }
      const { quantities: ingredientQuantity, unit: ingredientUnit } =
        ingredientRows[0];

      // totalQuantityNeeded is already in the unit of the ingredient
      if (ingredientQuantity < totalQuantityNeeded) {
        outOfStock.push(`Ingredient ID: ${ingredientId}`);
      }
    }

    if (outOfStock.length > 0) {
      console.log("Some items are out of stock", outOfStock);
      // Rollback the transaction
      await doQuery("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Some items are out of stock", items, outOfStock });
    }

    // Deduct the ingredient quantities
    // Updates the ingredient quantities in the database based on the order requirements.
    console.log("Deducting ingredient quantities...");
    for (const [ingredientId, totalQuantityNeeded] of Object.entries(
      ingredientDeductionMap
    )) {
      await doQuery(
        "UPDATE ingredients SET quantities = quantities - ? WHERE ID = ?",
        [totalQuantityNeeded, ingredientId]
      );
    }

    // Commit the transaction
    console.log("Committing transaction...");
    await doQuery("COMMIT");

    res.json({ message: "Order created successfully", orderId });
  } catch (error) {
    // Rollback the transaction in case of error
    await doQuery("ROLLBACK");
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// PUT: Update an existing order
// Modifies the details of an existing order based on the provided ID and new data.
router.put("/update-order/:id", async (req, res) => {
  const { id } = req.params;
  const { order_status, discounts, detailed_price, date, shipping_address } =
    req.body;

  try {
    const query = `
      UPDATE orders 
      SET 
        order_status = ?, 
        discounts = ?, 
        detailed_price = ?, 
        date = ?, 
        shipping_address = ?
      WHERE ID = ?
    `;

    const result = await doQuery(query, [
      order_status,
      discounts,
      detailed_price,
      date,
      shipping_address,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Error updating order" });
  }
});

module.exports = router;
