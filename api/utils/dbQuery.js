import pool from "../dbConfig/db.js";

export const query = async (sql, params = []) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("DB Error:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};