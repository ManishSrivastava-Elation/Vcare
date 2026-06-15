import { checkExists } from "../utils/dbValidators.js";

export const validateUnique = async ({ table, column, value }) => {
  const exists = await checkExists({ table, column, value });

  if (exists) {
    throw new Error(`${column} already exists`);
  }
};