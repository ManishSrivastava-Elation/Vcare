import { query } from "./dbQuery.js";

export const checkExists = async ({
  table,
  column,
  value,
  excludeId = null,
  idColumn = "id"
}) => {
  let sql = `SELECT COUNT(*) as count FROM ${table} WHERE ${column} = ?`;
  let params = [value];

  if (excludeId) {
    sql += ` AND ${idColumn} != ?`;
    params.push(excludeId);
  }

  const result = await query(sql, params);
  return result[0].count > 0;
};