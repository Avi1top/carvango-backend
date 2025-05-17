const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");

// Get a discount setting by key
// This function retrieves the value of a specified discount setting from the database.
router.get("/:key", async (req, res) => {
  const key = req.params.key;
  try {
    const result = await doQuery("SELECT value FROM settings WHERE `key` = ?", [
      key,
    ]);
    if (result.length > 0) {
      res.json({ value: result[0].value });
    } else {
      res.status(404).json({ error: "Setting not found" });
    }
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ error: "Error fetching setting" });
  }
});

// Set a discount setting by key
// This function saves or updates the value of a specified discount setting in the database.
router.post("/:key", async (req, res) => {
  const key = req.params.key;
  const value = req.body.value;
  try {
    await doQuery(
      "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [key, value, value]
    );
    res.json({ message: "Setting saved" });
  } catch (error) {
    console.error("Error saving setting:", error);
    res.status(500).json({ error: "Error saving setting" });
  }
});

module.exports = router;
