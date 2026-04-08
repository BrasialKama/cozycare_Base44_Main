/**
 * Centralized app configuration.
 *
 * Values that change between environments (dev / staging / prod) should live
 * here so they're easy to find and swap.  Vite exposes env vars prefixed with
 * VITE_ at build time via import.meta.env.
 *
 * To override locally, create a `.env.local` file:
 *   VITE_NOTIFICATION_API_URL=http://localhost:3001/functions/bookingNotification
 */

export const config = {
  /** Base44 backend-function URL for booking email notifications */
  notificationApiUrl:
    import.meta.env.VITE_NOTIFICATION_API_URL ||
    'https://eutow-7c2f3dd9.base44.app/functions/bookingNotification',

  /** Platform fee percentage charged on completed bookings (0–1) */
  platformFeeRate: 0.15,

  /** Bot identity used for system messages in conversations */
  bot: {
    email: 'bot@cozycare.hr',
    name: 'CozyCare Bot',
  },
};