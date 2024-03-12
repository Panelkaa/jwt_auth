const mysql = require('mysql2/promise'); 
require('dotenv').config();
// createPool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
 
module.exports = db;