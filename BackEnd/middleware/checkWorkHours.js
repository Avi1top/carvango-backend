// middleware/checkWorkHours.js

const db = require("../database/db");
// This middleware checks if the current time falls within configured work hours and allows or denies access accordingly.
// It retrieves work hours from the database and handles errors during the process.

const checkWorkHours = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT value FROM others WHERE name = ?", [
      new Date().toLocaleString("en-us", { weekday: "long" }),
    ]);

    if (rows.length === 0) {
      return res.status(403).json({ message: "Work hours not configured." });
    }

    const [startHour, endHour] = rows[0].value
      .split("-")
      .map((time) => time.trim());

    const currentTime = new Date();
    const startTime = new Date();
    const endTime = new Date();

    startTime.setHours(...startHour.split(":").map(Number));
    endTime.setHours(...endHour.split(":").map(Number));

    if (currentTime >= startTime && currentTime <= endTime) {
      return next();
    } else {
      return res.status(403).json({ message: "The menu is currently closed." });
    }
  } catch (err) {
    console.error("Error checking work hours:", err);
    res.status(500).json({ error: "Failed to check work hours." });
  }
};

module.exports = checkWorkHours;
