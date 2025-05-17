const express = require("express");
const router = express.Router();
const pool = require("../database/db");

router.use(express.json());

// GET route for dashboard welcome message; checks user authentication.
router.get("/", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ message: "Welcome to the dashboard" });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// GET route to fetch out-of-stock and inactive ingredients and extras.
router.get("/out-of-stock", async (req, res) => {
 const outOfStockQuery = `
SELECT
    main.ID,                 -- ID of the ingredient/extra
    main.name,               -- Name of the ingredient/extra
    main.stock_quantity,     -- Stock quantity
    main.used_quantity,      -- Quantity used
    main.unit,               -- Unit
    main.price,              -- Price (NULL for ingredients)
    main.is_active,          -- Active status
    main.type,               -- Type (ingredient, extra, etc.)
    main.ingredient_id,      -- Ingredient ID
    GROUP_CONCAT(DISTINCT main.dish_name SEPARATOR ', ') AS dish_names -- Combine dish names
FROM (
    SELECT
        ie.ingredient_id AS ID,
        i.name AS name,
        i.quantities AS stock_quantity,
        ie.quantity AS used_quantity,
        i.unit AS unit,
        NULL AS price,
        i.is_active,
        'ingredient' AS type,
        ie.ingredient_id AS ingredient_id,
        NULL AS dish_name
    FROM
        ingredients_extras ie
    INNER JOIN
        ingredients i ON ie.ingredient_id = i.ID
    WHERE
        i.quantities <= 0 OR i.is_active = 0  -- Fetch out-of-stock OR inactive ingredients

    UNION

    SELECT
        e.ID AS ID,
        e.name AS name,
        i.quantities AS stock_quantity,
        ie.quantity AS used_quantity,
        ie.unit AS unit,
        e.price AS price,
        e.is_active,
        'extra' AS type,
        ie.ingredient_id AS ingredient_id,
        NULL AS dish_name
    FROM
        extras e
    JOIN
        ingredients_extras ie ON e.ID = ie.extra_id
    JOIN
        ingredients i ON ie.ingredient_id = i.ID
    WHERE
        e.is_active = 0  -- Fetch inactive extras

    UNION

    SELECT
        id.ingredient_id AS ID,
        i.name AS name,
        i.quantities AS stock_quantity,
        id.quantity_needed AS used_quantity,
        i.unit AS unit,
        NULL AS price,
        i.is_active,
        'ingredient_dish' AS type,
        id.ingredient_id AS ingredient_id,
        d.name AS dish_name
    FROM
        ingrediants_dishes id
    INNER JOIN
        ingredients i ON id.ingredient_id = i.ID
    INNER JOIN
        dishes d ON id.dish_id = d.ID
    WHERE
        i.quantities <= 0 OR i.is_active = 0  -- Fetch out-of-stock OR inactive ingredients in dishes
) AS main
GROUP BY
    main.ID,                  -- Group by unique ingredient/extra ID
    main.name,
    main.stock_quantity,
    main.used_quantity,
    main.unit,
    main.price,
    main.is_active,
    main.type,
    main.ingredient_id;
`;



  try {
    const [results] = await pool.query(outOfStockQuery);
    console.log("Out of Stock and Inactive Query Results:", results); // Log the results for debugging
    res.json(results);
  } catch (error) {
    console.error(
      "Error executing out-of-stock and inactive query:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: error.message });
  }
});
// // POST route to insert a new note into the 'others' table.
// router.post("/notes", (req, res) => {
//   const { note } = req.body;
//   const query = "INSERT INTO others (name, value) VALUES (?, ?)";

//   pool.query(query, ["Note", note], (error, results) => {
//     if (error) {
//       console.error("Error inserting note:", error);
//       return res.status(500).json({ error: "Failed to save note" });
//     }
//     console.log("Database insert result:", results); // Log the database result

//     res.json({
//       id: results.insertId,
//       note,
//       message: "Note saved successfully",
//     });
//   });
// });

// // GET route to fetch notes from the 'others' table where the name is 'Note'.
// router.get("/notes", async (req, res) => {
//   const query =
//     'SELECT id, value as note FROM others WHERE name = "Note" ORDER BY id DESC';

//   try {
//     const [results] = await pool.query(query); // Await the promise and destructure the results
//     console.log("Fetched Notes:", results); // Add this line to log the results
//     res.json(results);
//   } catch (error) {
//     console.error("Error fetching notes:", error);
//     res.status(500).json({ error: "Failed to fetch notes" });
//   }
// });

// // DELETE route to remove a specific note by ID.
// router.delete("/notes/:id", (req, res) => {
//   const { id } = req.params;

//   const query = 'DELETE FROM others WHERE id = ? AND name = "Note"';
//   pool.query(query, [id], (error, results) => {
//     if (error) {
//       console.error("Error deleting note:", error);
//       return res.status(500).json({ error: "Failed to delete note" });
//     }
//     res.json({ message: "Note deleted successfully" });
//   });
// });

// // PUT route to update a specific note by ID.
// router.put("/notes/:id", (req, res) => {
//   const { id } = req.params;
//   const { note } = req.body;

//   const query = 'UPDATE others SET value = ? WHERE id = ? AND name = "Note"';
//   pool.query(query, [note, id], (error, results) => {
//     if (error) {
//       console.error("Error updating note:", error);
//       return res.status(500).json({ error: "Failed to update note" });
//     }
//     // After successful update, return the updated note
//     res.json({ id, note });
//   });
// });

// GET route to retrieve total sales, orders, and customers.
router.get("/totals", async (req, res) => {
  const { from, to } = req.query;

  // Set the default date range (last 30 days)
  let defaultFrom = new Date();
  defaultFrom.setMonth(defaultFrom.getMonth() - 1); // Subtract 1 month
  let defaultTo = new Date();

  // Convert default dates to 'YYYY-MM-DD' format
  const formattedDefaultFrom = defaultFrom.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const formattedDefaultTo = defaultTo.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // If the user didn't provide "from" and "to" dates, use the default range
  const effectiveFrom = from || formattedDefaultFrom;
  const effectiveTo = to || formattedDefaultTo;

  const totalsQuery = `
    SELECT
      (SELECT COUNT(DISTINCT po.email) 
       FROM people_orders po
       JOIN orders o ON po.order_id = o.ID
       WHERE o.date BETWEEN ? AND ?) AS total_customers,
      
      (SELECT COALESCE(SUM(o.detailed_price), 0) 
       FROM orders o 
       WHERE o.date BETWEEN ? AND ?) AS total_sales,
      
      (SELECT COUNT(*) 
       FROM orders o 
       WHERE o.date BETWEEN ? AND ?) AS total_orders;
  `;

  try {
    const [results] = await pool.query(totalsQuery, [
      effectiveFrom,
      effectiveTo,
      effectiveFrom,
      effectiveTo,
      effectiveFrom,
      effectiveTo,
    ]);
    res.json(results[0]); // Send the first result row
  } catch (error) {
    console.error("Error fetching totals:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// GET route for daily revenue based on year and month.
router.get("/revenue-daily", async (req, res) => {
  const { year, month } = req.query; // Expecting year and month to filter the data
  const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month

  try {
    const query = `
      SELECT DATE_FORMAT(o.date, '%Y-%m-%d') AS day, COALESCE(SUM(o.detailed_price), 0) AS revenue
      FROM orders o
      WHERE YEAR(o.date) = ? AND MONTH(o.date) = ?
      GROUP BY day
      ORDER BY day;
    `;

    const [results] = await pool.query(query, [year, month]);

    // Ensure all days of the month are represented
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = `${year}-${month}-${String(i + 1).padStart(2, "0")}`;
      const revenue = results.find((r) => r.day === day)?.revenue || 0;
      return { day, revenue };
    });

    const labels = days.map((d) => d.day);
    const revenues = days.map((d) => d.revenue);

    res.json({ labels, revenues });
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    res.status(500).json({ error: "Error fetching daily revenue" });
  }
});

// GET route for monthly revenue based on year.
router.get("/revenue-monthly", async (req, res) => {
  const { year } = req.query;

  try {
    const query = `
      SELECT DATE_FORMAT(o.date, '%Y-%m') AS month, COALESCE(SUM(o.detailed_price), 0) AS revenue
      FROM orders o
      WHERE YEAR(o.date) = ?
      GROUP BY month
      ORDER BY month;
    `;

    const [results] = await pool.query(query, [year]);

    // Ensure all months of the year are represented
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = `${year}-${String(i + 1).padStart(2, "0")}`;
      const revenue = results.find((r) => r.month === month)?.revenue || 0;
      return { month, revenue };
    });

    const labels = months.map((m) => m.month);
    const revenues = months.map((m) => m.revenue);

    res.json({ labels, revenues });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({ error: "Error fetching monthly revenue" });
  }
});

// GET route for yearly revenue for the last 10 years.
router.get("/revenue-yearly", async (req, res) => {
  try {
    const query = `
      SELECT YEAR(o.date) AS year, COALESCE(SUM(o.detailed_price), 0) AS revenue
      FROM orders o
      WHERE YEAR(o.date) BETWEEN YEAR(CURDATE()) - 10 AND YEAR(CURDATE())
      GROUP BY year
      ORDER BY year;
    `;

    const [results] = await pool.query(query);

    // Ensure all 10 years are represented
    const years = Array.from({ length: 10 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      const revenue = results.find((r) => r.year == year)?.revenue || 0;
      return { year, revenue };
    }).reverse(); // Reverse to show in ascending order

    const labels = years.map((y) => y.year);
    const revenues = years.map((y) => y.revenue);

    res.json({ labels, revenues });
  } catch (error) {
    console.error("Error fetching yearly revenue:", error);
    res.status(500).json({ error: "Error fetching yearly revenue" });
  }
});

module.exports = router;
