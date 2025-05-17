const express = require("express");
const doQuery = require("../database/query");
const router = express.Router();

router.get("/", async (req, res) => {
 
 try {

  const response = await doQuery(
    "SELECT value FROM others WHERE name = 'mainParagr'"
  );
console.log(response)
  if (response.length > 0) {
    res.json({ value: response[0].value });
  } else {
    res.status(404).json({ error: "Main paragraph not found" });
  }

 } catch (error) {
  console.error("Error fetching main paragraph:", error);
  res.status(500).json({ error: "Failed to fetch main paragraph" });
 }
});


router.put("/", async (req, res) => {
  const { value } = req.body;
  if (value === undefined) {
    return res.status(400).json({ error: "Main paragraph value is required" });

  }
  try {
    await doQuery("UPDATE others SET value = ? WHERE name = 'mainParagr'", [
      value,
    ]);
    res.json({ message: "Main paragraph updated successfully" });
  } catch (error) {
    console.error("Error updating main paragraph:", error);
    res.status(500).json({ error: "Error updating main paragraph" });
  }
  })

module.exports = router