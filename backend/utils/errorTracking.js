/**
 * Lightweight Production Error Tracking (Sentry Fallback)
 * 
 * In a real production environment with a Sentry account, you would initialize
 * @sentry/node here. For now, this acts as a robust console logger that catches
 * all production errors so they are not silently swallowed.
 */

const initErrorTracking = () => {
  if (process.env.SENTRY_DSN) {
    console.log('[ErrorTracker] Sentry DSN detected, but @sentry/node is not installed. Falling back to console logger.');
  }

  process.on('uncaughtException', (err) => {
    console.error('\n[FATAL ERROR] Uncaught Exception:', err);
    // In production, you typically want to restart the process after an uncaught exception
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('\n[FATAL ERROR] Unhandled Promise Rejection:', reason);
  });
};

const captureException = (err, req = null) => {
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  };

  if (req) {
    errorDetails.request = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      ip: req.ip,
      user: req.user ? req.user.id : 'unauthenticated',
    };
  }

  console.error('\n[PRODUCTION ERROR TRACKER] Captured Exception:');
  console.error(JSON.stringify(errorDetails, null, 2));
};

module.exports = {
  initErrorTracking,
  captureException,
};
