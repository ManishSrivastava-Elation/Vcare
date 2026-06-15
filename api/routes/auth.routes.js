import express from "express";
import { createEmployee, loginEmployee, updatePassword } from "../controllers/auth.controller.js";
import { validateZod } from "../middlewares/validateZod.js";
import { authenticateToken } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { createEmployeeSchema, loginEmployeeSchema, updatePasswordSchema } from "../validators/auth.schema.js";

const router = express.Router();

router.post("/create", validateZod(createEmployeeSchema), createEmployee);
router.post("/login", validateZod(loginEmployeeSchema), loginEmployee);
router.put("/update-password", authenticateToken, validateZod(updatePasswordSchema), updatePassword);

export default router;