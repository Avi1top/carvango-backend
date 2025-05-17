const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");
// Get all truck locations
router.get("/getTruckLocations", async (req, res) => {
  try {
    const result = await doQuery(
      "SELECT * FROM truck_locations"
    );
    console.log("sssssssssss", result);
    res.json(result);
  } catch (error) {
    console.error("Error fetching truck locations:", error);
    res.status(500).send("Server error");
  }
});

// Add a new truck location 
router.post("/addTruck", async (req, res) => {
  const { name, lat, lng, address } = req.body;
  const isActive = req.body.isActive ? 1 : 0;
  try {
    const result = await doQuery(
      "INSERT INTO truck_locations (name, lat, lng, isActive, address) VALUES (?, ?, ?, ?, ?)",
      [name, lat, lng, isActive, address]
    );
    res.status(201).json({ message: "Truck added successfully" });
  } catch (error) {
    console.error("Error adding truck:", error);
    res.status(500).send("Server error");
  }
});

// Edit a truck location
router.put("/updateTruckLocation/:id", async (req, res) => {
  const { id } = req.params;

  console.log(req.body,"wefewfewf");
  const { lat, lng, name, isActive, address } = req.body;
  try {
    const result = await doQuery(
      "UPDATE truck_locations SET lat = ?, lng = ?, name = ?, isActive = ?, updated_at = CURRENT_TIMESTAMP, address = ? WHERE id = ?",
      [lat, lng, name, isActive, address, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Truck location not found");
    }
    if (result.rowCount === 0) {
      return res.status(404).send("Truck location not found");
    }
    res.status(200).json({ message: "Truck location updated successfully" });
  } catch (error) {
    console.error("Error updating truck location:", error);
    res.status(500).send("Server error");
  }
});

// Delete a truck location
router.delete("/deleteTruckLocation/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await doQuery(
      "DELETE FROM truck_locations WHERE id = ?",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Truck location not found");
    }
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error("Error deleting truck location:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
