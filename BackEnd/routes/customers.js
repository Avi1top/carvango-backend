const express = require("express");
const doQuery = require("../database/query");

const router = express.Router();

// GET /customers - Fetch customers with optional search query
// Retrieves a list of customers, optionally filtered by a search term.
router.get("/", async (req, res) => {
  const { search } = req.query;

  let query = "SELECT * FROM people";
  const queryParams = [];

  if (search) {
    query += ` WHERE (
      email LIKE ? OR
      first_name LIKE ? OR
      last_name LIKE ? OR
      city LIKE ? OR
      street_name LIKE ? OR
      phone_number LIKE ?
    )`;
    const searchPattern = `%${search}%`;
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }

  try {
    const customers = await doQuery(query, queryParams);
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Error fetching customers" });
  }
});

// GET /customer-phone/:email - Fetch customer phone number by email
// Retrieves the phone number of a customer based on their email address.
router.get("/customer-phone/:email", async (req, res) => {
  const { email } = req.params;

  const query = "SELECT phone_number FROM people WHERE email = ?";
  const queryParams = [email];

  try {
    const result = await doQuery(query, queryParams);

    if (result.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ phone_number: result[0].phone_number });
  } catch (error) {
    console.error("Error fetching phone number:", error);
    res.status(500).json({ error: "Error fetching phone number" });
  }
});

// PUT /update-customer/:email - Update customer information
// Updates the details of a customer identified by their email address.
router.put("/update-customer/:email", async (req, res) => {
  const { email } = req.params;
  const { first_name, last_name, city, street_name, phone_number } =
    req.body;

  const query = `
    UPDATE people
    SET 
      first_name = ?, 
      last_name = ?, 
      city = ?, 
      street_name = ?, 
      phone_number = ?, 
    WHERE email = ?
  `;
  const queryParams = [
    first_name,
    last_name,
    city,
    street_name,
    phone_number,
    email,
  ];

  try {
    const result = await doQuery(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Error updating customer" });
  }
});

module.exports = router;
