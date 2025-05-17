const express = require("express");
const router = express.Router();
// Middleware to check if the current time is within work hours.
const checkWorkHours = require("../middleware/checkWorkHours");

// Define a GET route that uses the checkWorkHours middleware to determine if the request is within work hours.
router.get("/", checkWorkHours, (req, res) => {
  res.status(200).json({ isWithinWorkHours: true });
});

module.exports = router;
