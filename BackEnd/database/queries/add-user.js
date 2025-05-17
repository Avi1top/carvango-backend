const bcrypt = require("bcrypt");
const doQuery = require("../query");

/**
 * This module contains the `addUser` function, which inserts a new user
 * into the 'people' table using the provided user data. It hashes the
 * password before storing it in the database for security.
 */

async function addUser(userData) {
  try {
    const {
      email,
      city,
      street_number,
      lastName,
      firstName,
      phone_number,
      password,
    } = userData;

    console.log("User data:", userData);

    // Hash the password with bcrypt
    const saltRounds = 10; // Adjust as needed; higher values are more secure but slower
    let hashedPassword;
    if(password){
      hashedPassword = await bcrypt.hash(password, saltRounds);

    }

    const sql = `INSERT INTO people (email, city, street_name, last_name, first_name, phone_number, password)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      email,
      city,
      street_number,
      lastName,
      firstName,
      phone_number,
      hashedPassword, // Store the hashed password
    ];
    const result = await doQuery(sql, params);
    return result;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

module.exports = { addUser };
