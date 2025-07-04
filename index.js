import logger from "./logger.js";

logger.info('Server started on port 3000');
logger.error('Failed to connect to DB!');
logger.debug('User data:', { id: 123, name: 'Alice' });
logger.silly('This is a silly log!');