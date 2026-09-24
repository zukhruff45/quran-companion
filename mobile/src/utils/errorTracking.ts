/**
 * Lightweight Production Error Tracking for React Native (Sentry Fallback)
 * 
 * If you configure Sentry (sentry-expo or @sentry/react-native), initialize it here.
 * Otherwise, this tracks global uncaught JS exceptions and unhandled promise rejections,
 * logging them safely so they can be parsed by your build host/logger (e.g., EAS or logcat).
 */

declare var global: any;

let isTrackingInitialized = false;

export const initErrorTracking = () => {
  if (isTrackingInitialized) return;
  
  if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
    console.log('[ErrorTracker] Sentry DSN detected, but @sentry/react-native is not installed. Using console fallback.');
  }

  // Handle uncaught React/JS Exceptions
  const defaultErrorHandler = global.ErrorUtils?.getGlobalHandler();
  
  global.ErrorUtils?.setGlobalHandler((error: any, isFatal?: boolean) => {
    captureException(error, { isFatal, context: 'GlobalErrorHandler' });
    if (defaultErrorHandler) {
      defaultErrorHandler(error, isFatal);
    }
  });

  // Handle Unhandled Promise Rejections (Polyfill tracking)
  const trackingRejection = require('promise/setimmediate/rejection-tracking');
  trackingRejection.enable({
    allRejections: true,
    onUnhandled: (id: string, error: any) => {
      captureException(error, { context: 'UnhandledPromiseRejection', id });
    },
    onHandled: () => {},
  });

  isTrackingInitialized = true;
};

export const captureException = (error: Error | any, extraContext: Record<string, any> = {}) => {
  const errorPayload = {
    timestamp: new Date().toISOString(),
    message: error?.message || String(error),
    stack: error?.stack,
    isFatal: extraContext?.isFatal || false,
    context: extraContext?.context || 'ManualCapture',
    extra: extraContext
  };

  // Log prominently to console so it is visible in ADB logcat / EAS build logs / production monitoring
  console.error('\n======================================');
  console.error('[PRODUCTION ERROR TRACKER]');
  console.error(JSON.stringify(errorPayload, null, 2));
  console.error('======================================\n');
};
