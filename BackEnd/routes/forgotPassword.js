const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const doQuery = require("../database/query");

// Update password route: Handles password update requests for users.
router.put("/update", async (req, res) => {
  const { email, newPassword } = req.body;

  console.log("req.body:", req.body);
  
  // Validate input: Ensures both email and new password are provided.
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Hash the new password before saving: Encrypts the new password for security.
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

    // Update the password in the database
    await doQuery("UPDATE people SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Error updating password" });
  }
});

module.exports = router;
