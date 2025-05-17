const doQuery = require("../query");
const bcrypt = require("bcrypt");

/**
 * This module contains the `checkUser` function, which is responsible for verifying a user's login credentials.
 * It checks if the provided email exists in the database and compares the supplied password with the stored hashed password to ensure a secure login process.
 */



async function checkUser(email, password) {
  try {
    // Query the user by email
    const sql = `SELECT password FROM people WHERE email = ?`;
    const params = [email];
    const result = await doQuery(sql, params);

    // Check if user exists
    if (result.length === 0) {
      return false;
    }

    // Compare the provided password with the stored hash
    const storedHashedPassword = result[0].password;
    const isMatch = await bcrypt.compare(password, storedHashedPassword);

    console.log("Password match status:", isMatch); // Log the match status
    return isMatch;
  } catch (error) {
    console.error("Error checking user:", error);
    throw error;
  }
}

module.exports = checkUser;
