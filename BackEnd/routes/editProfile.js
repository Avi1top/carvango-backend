const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const doQuery = require("../database/query");

// Update user information based on the provided data in the request body
router.put("/update", async (req, res) => {
  console.log("req.body update:", req.body);

  // Destructure the email, handling both the object and direct string case
  const email = req.body.email.email || req.body.email;
  console.log("email", email);

  const { first_name, last_name, city, street_name, phone_number, password } =
    req.body;

  try {
    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const query = `
      UPDATE people
      SET 
        first_name = ?, 
        last_name = ?, 
        city = ?, 
        street_name = ?, 
        phone_number = ?, 
        password = ?
      WHERE email = ?
    `;

    const queryParams = [
      first_name,
      last_name,
      city,
      street_name,
      phone_number,
      hashedPassword,
      email, // Make sure to use the correctly destructured email
    ];

    const result = await doQuery(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Error in updating" });
    }

    res.json({ message: "Info updated successfully" });
  } catch (error) {
    console.error("Error updating info:", error);
    res.status(500).json({ error: "Error updating info" });
  }
});


// Retrieve user profile information if authenticated
router.get("/profile", (req, res) => {
  if (req.session.user) {
    // Assuming user data is stored in session
    const userEmail = req.session.user.email;
    // Fetch other user data from the database if needed
    res.json({ email: userEmail /* other user data */ });
  } else {
    // Respond with unauthorized status if not authenticated
    res.status(401).json({ message: "Unauthorized" });
  }
});

router.post("/profileDetails", async (req, res) => {
  console.log("req.body", req.body);
  const { email } = req.body; // Make sure req.body.email exists
  console.log("email", email);

  const query =
    "SELECT city, street_name, last_name, first_name, phone_number FROM people WHERE email = ?";
  const queryParams = [email];

  try {
    const result = await doQuery(query, queryParams);

    if (result.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching profile details:", error);
    res.status(500).json({ error: "Error fetching profile details" });
  }
});


module.exports = router;
