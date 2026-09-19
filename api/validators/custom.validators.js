import { checkExists } from "../utils/dbValidators.js";

export const validateUnique = async ({ table, column, value, ignoreDeleted = false }) => {
  const exists = await checkExists({ table, column, value, ignoreDeleted });

  if (exists) {
    throw new Error(`${column} already exists`);
  }
};