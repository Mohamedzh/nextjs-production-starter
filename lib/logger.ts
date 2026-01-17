/**
 * Structured Logging with Pino
 * Environment-based configuration for development and production
 */

import pino from 'pino';
import { env } from './env';
import { features } from './features';

const isProduction = env.NODE_ENV === 'production';

/**
 * Create logger instance with environment-specific configuration
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  
  // Use pretty printing in development, JSON in production
  ...(!isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),

  // Redact sensitive information
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'CRON_SECRET',
      '*.password',
      '*.token',
      '*.secret',
    ],
    remove: true,
  },

  // Base configuration
  base: {
    env: env.NODE_ENV,
  },

  // Format timestamps in ISO format
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Log enabled features at startup
 * Helps with debugging configuration issues
 */
export function logStartup() {
  const enabledFeatures = Object.entries(features)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);

  const disabledFeatures = Object.entries(features)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, enabled]) => !enabled)
    .map(([name]) => name);

  logger.info({
    msg: '🚀 Next.js Production Starter',
    environment: env.NODE_ENV,
    features: {
      enabled: enabledFeatures.length > 0 ? enabledFeatures : ['none'],
      disabled: disabledFeatures,
    },
  });

  // Log specific feature status
  if (features.auth) {
    logger.info({
      msg: '🔐 Authentication enabled',
      strategy: features.database ? 'database' : 'jwt',
      providers: Object.entries(features)
        .filter(([key, enabled]) => key.endsWith('Provider') && enabled)
        .map(([key]) => key.replace('Provider', '')),
    });
  }

  if (features.database) {
    logger.info('🗄️  Database connection enabled (Prisma)');
  }

  if (features.redis) {
    logger.info('⚡ Redis caching enabled');
  }

  if (!features.auth && !features.database && !features.redis) {
    logger.warn('⚠️  Running with minimal features - set environment variables to enable auth, database, or redis');
  }
}

/**
 * Create a child logger with additional context
 * Useful for request-scoped logging
 */
export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

/**
 * Log an error with context
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    err: error,
    ...context,
  });
}

// Export default logger
export default logger;
