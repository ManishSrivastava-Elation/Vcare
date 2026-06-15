import { apiResponse } from "../utils/response.js";
import { verifyToken } from "../services/jwt.service.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiResponse({
      res,
      success: false,
      statusCode: 401,
      message: "Authorization token is required",
      error: [{ field: "Authorization", message: "Bearer token missing" }],
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 401,
      message: "Invalid or expired token",
      error: [{ field: "Authorization", message: err.message }],
    });
  }
};