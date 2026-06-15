import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./dbConfig/db.js";
import employeeRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import fileRouter from "./routes/file.routes.js";
import upload from "./middlewares/upload.js";
import { apiResponse } from "./utils/response.js";
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload route
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  res.json({
    success: true,
    message: "Image uploaded successfully",
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
    },
  });
});  

// routes
app.use("/api/auth", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/files", fileRouter);

app.get("/api", (req, res) => {
  return apiResponse({res, message:"API is working..."}) 
});

// 404 - Not Found handler
app.use((req, res) => {
  return apiResponse({
    res, 
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port: http://localhost:${PORT}`);

  await testConnection();
});