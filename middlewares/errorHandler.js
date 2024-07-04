// Not Found
const notFound = (req, res, next) => {
  const error = new Error(`NotFound:${req.originalUrl}`);
  next(error);
};

// Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    Success: false,
    error: err.message,
  });
};

module.exports = { errorHandler, notFound };
