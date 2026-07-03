import fs from 'fs';

export const notFound = (req, res, next) => {
  const error = new Error(`No encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Write to a global log file for debugging
  try {
    fs.appendFileSync('global_error.log', JSON.stringify({
      timestamp: new Date().toISOString(),
      url: req.originalUrl,
      method: req.method,
      statusCode,
      message: err.message,
      stack: err.stack
    }, null, 2) + '\n');
  } catch (logErr) {
    console.error('Error writing to global log file:', logErr);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
