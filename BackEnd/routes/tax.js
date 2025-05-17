const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");

// GET route to fetch the tax value from the database.
// It retrieves the value associated with 'fees' and returns it in the response.
router.get("/", async (req, res) => {
  try {
    const result = await doQuery("SELECT value FROM others WHERE name = 'fees'");
    if (result.length > 0) {
      res.json({ value: result[0].value });
    } else {
      res.status(404).json({ error: "Tax not found" });
    }
  } catch (error) {
    console.error("Error fetching tax:", error);
    res.status(500).json({ error: "Failed to fetch tax" });
  }
});
// POST route to update the tax value in the database.
router.post("/", async (req, res) => {
  const { value } = req.body;
  if (value === undefined) {
    return res.status(400).json({ error: "Tax value is required" });
  }

  try {
    await doQuery("UPDATE others SET value = ? WHERE name = 'fees'", [value/100]);
    res.json({ message: "Tax rate updated successfully" });
  } catch (error) {
    console.error("Error updating tax:", error);
    res.status(500).json({ error: "Failed to update tax" });
  }
});
module.exports = router;
