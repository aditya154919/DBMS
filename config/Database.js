const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "studynotion",
  waitForConnections: true,
  connectionLimit: 10
});


(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("mySQL connected");
    connection.release();
  } catch (error) {
    console.error("mySQL connection failed:", error.message);
    process.exit(1);
  }
})();

module.exports = pool;