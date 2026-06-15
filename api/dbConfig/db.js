import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});
 
export const testConnection = async () => {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    const [rows] = await connection.query("SELECT DATABASE() as db");

    console.log("\n==============================");
    console.log("🚀 MySQL Connection Successful");
    console.log("------------------------------");
    console.log("📍 Host       :", process.env.DB_HOST);
    console.log("👤 User       :", process.env.DB_USER);
    console.log("🗄️ Database   :", rows[0].db);
    console.log("🔌 Port       :", process.env.DB_PORT);
    console.log("==============================\n");

  } catch (err) {
    console.error("\n❌ MySQL Connection Failed");
    console.error("------------------------------");
    console.error("Error Message:", err.message);
    console.error("Error Code   :", err.code);
    console.error("Error Number :", err.errno);
    console.error("==============================\n");

    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
};

export default pool;