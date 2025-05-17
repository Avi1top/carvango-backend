// routes/workHours.js

const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Updates work hours for each day based on the provided request body.
router.post("/updateWorkHours", async (req, res) => {
  console.log("Received request to update work hours:", req.body);
  const { workHours } = req.body;
  try {
    const updateQueries = Object.keys(workHours).map((day) => {
      const { startHour, endHour } = workHours[day];
      const value = `${startHour}-${endHour}`;
      console.log(`Updating ${day}: ${value}`);
      return db
        .query("UPDATE others SET value = ? WHERE name = ?", [value, day])
        .catch((err) => {
          console.error(`Error updating work hours for ${day}:`, err);
          throw err;
        });
    });

    await Promise.all(updateQueries);
    res.status(200).json({ message: "Work hours updated successfully" });
  } catch (err) {
    console.error("Error updating work hours:", err);
    res.status(500).json({ error: "Failed to update work hours" });
  }
});

// Fetches the work hours for each day of the week from the database.
router.get("/getWorkHours", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT name, value FROM others WHERE name IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')"
    );

    const workHours = rows.reduce((acc, row) => {
      const [startHour, endHour] = row.value.split("-");
      acc[row.name] = {
        startHour,
        endHour,
        isOpen: row.value !== "00:00-00:00",
      };
      return acc;
    }, {});

    res.json(workHours);
  } catch (err) {
    console.error("Error fetching work hours:", err);
    res.status(500).json({ error: "Failed to fetch work hours" });
  }
});
module.exports = router;
