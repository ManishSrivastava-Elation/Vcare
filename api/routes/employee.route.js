import express from "express";
import { validateZod } from "../middlewares/validateZod.js";
import { updateEmployeeSchema } from "../validators/employee.schema.js";
import { deleteEmployee, updateEmployee } from "../controllers/employee.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.put(
  "/update/:id",
  authenticateToken,
  validateZod(updateEmployeeSchema),
  updateEmployee
);

router.delete(
  "/delete/:id",
  authenticateToken,
  deleteEmployee
);

export default router;