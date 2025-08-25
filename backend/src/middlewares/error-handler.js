const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // In production, don't send detailed error information to the client
  const errorResponse = {
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Only send stack in development
  };

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
