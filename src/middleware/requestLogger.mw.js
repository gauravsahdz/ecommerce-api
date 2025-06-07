import logger from '../utils/logger.ut.js';

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  logger.info(`${timestamp} - ${req.method} ${req.originalUrl}`);
  next();
};

export default requestLogger;