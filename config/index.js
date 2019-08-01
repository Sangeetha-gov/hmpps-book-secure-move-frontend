/* eslint no-process-env: "off" */
require('dotenv').config()

const IS_DEV = process.env.NODE_ENV !== 'production'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const SERVER_HOST = process.env.SERVER_HOST
const BASE_URL = `${IS_PRODUCTION ? 'https' : 'http'}://${SERVER_HOST}`
const AUTH_BASE_URL = process.env.AUTH_PROVIDER_URL
const AUTH_KEY = process.env.AUTH_PROVIDER_KEY
const SESSION = {
  NAME: process.env.SESSION_NAME || 'book-secure-move.sid',
  SECRET: process.env.SESSION_SECRET,
  TTL: process.env.SESSION_TTL || 60 * 30 * 1000, // 30 mins
  DB: process.env.SESSION_DB_INDEX || 0,
}

function _authUrl(path) {
  return AUTH_BASE_URL ? new URL(path, AUTH_BASE_URL).href : ''
}

module.exports = {
  IS_DEV,
  IS_PRODUCTION,
  SESSION,
  SERVER_HOST,
  PORT: process.env.PORT || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || (IS_DEV ? 'debug' : 'error'),
  NO_CACHE: process.env.CACHE_ASSETS ? false : IS_DEV,
  FEEDBACK_URL: process.env.FEEDBACK_URL,
  BUILD_DATE: process.env.APP_BUILD_DATE,
  BUILD_BRANCH: process.env.APP_BUILD_TAG,
  GIT_SHA: process.env.APP_GIT_COMMIT,
  CURRENT_LOCATION_UUID: process.env.CURRENT_LOCATION_UUID,
  API: {
    BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
    HEALTHCHECK_URL: process.env.API_HEALTHCHECK_URL,
    AUTH_URL: process.env.API_AUTH_URL,
    CLIENT_ID: process.env.API_CLIENT_ID,
    SECRET: process.env.API_SECRET,
  },
  DATE_FORMATS: {
    SHORT: 'D M YYYY',
    LONG: 'D MMM YYYY',
    WITH_DAY: 'dddd D MMM YYYY',
  },
  ASSETS_HOST: process.env.ASSETS_HOST || '',
  SENTRY: {
    DSN: process.env.SENTRY_DSN,
    ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || 'production',
  },
  REDIS: {
    SESSION: {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST,
      auth_pass: process.env.REDIS_AUTH_TOKEN,
      db: SESSION.DB,
      tls: process.env.REDIS_AUTH_TOKEN
        ? { checkServerIdentity: () => undefined }
        : null,
      ttl: SESSION.TTL / 1000, // convert nanoseconds to seconds
    },
  },
  USER_PERMISSIONS: process.env.USER_PERMISSIONS,
  AUTH_BYPASS_SSO: process.env.BYPASS_SSO && IS_DEV,
  AUTH_WHITELIST_URLS: [
    '/auth',
    '/auth/callback',
    '/healthcheck',
    '/healthcheck/ping',
  ],
  AUTH_PROVIDERS: {
    hmpps: {
      oauth: 2,
      scope: ['read'],
      response: ['tokens', 'jwt'],
      token_endpoint_auth_method: 'client_secret_basic',
      authorize_url: _authUrl('/auth/oauth/authorize'),
      access_url: _authUrl('/auth/oauth/token'),
      healthcheck_url: _authUrl('/auth/ping'),
      logout_url: _authUrl(
        `/auth/logout?client_id=${AUTH_KEY}&redirect_uri=${BASE_URL}`
      ),
      key: AUTH_KEY,
      secret: process.env.AUTH_PROVIDER_SECRET,
    },
  },
  DEFAULT_AUTH_PROVIDER: 'hmpps',
  ANALYTICS: {
    GA_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
  TAG_CATEGORY_WHITELIST: {
    risk: {
      tagClass: 'app-tag--destructive',
      sortOrder: 1,
    },
    health: {
      tagClass: '',
      sortOrder: 2,
    },
  },
}
