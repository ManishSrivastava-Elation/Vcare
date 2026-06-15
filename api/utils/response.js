export const apiResponse = ({ res, statusCode = 200, success = true, message = "", data = [], error = false, meta = null, }) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
    error,
    meta, // pagination / extra info ke liye
    timestamp: new Date().toISOString(),
  });
};