import { apiResponse } from "../utils/response.js";

export const validateZod = (schema) => (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return apiResponse({
      res,
      success: false,
      statusCode: 400,
      message: "Request body is required",
      error: [{ field: null, message: "Request body cannot be empty" }],
    });
  }

  const result = schema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error?.issues ?? [];
    const errors = issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return apiResponse({
      res,
      success: false,
      statusCode: 400,
      message: "Validation failed",
      error: errors.length ? errors : [{ field: null, message: "Invalid request data" }],
    });
  }

  req.body = result.data;
  next();
};