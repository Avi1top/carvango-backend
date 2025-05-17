const mysql = require("mysql2");
// This file sets up a MySQL connection pool for database operations.
// It exports a promise-based interface for executing queries.

const pool = mysql.createPool({
  connectionLimit: 100, //important
  host: "localhost",
  user: "root",
  password: "",
  database: "alwadiflafel22",
});
module.exports = pool.promise();
