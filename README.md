# Book a secure move frontend

[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-book-secure-move-frontend.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-book-secure-move-frontend)
[![Coverage Status](https://coveralls.io/repos/github/ministryofjustice/hmpps-book-secure-move-frontend/badge.svg)](https://coveralls.io/github/ministryofjustice/hmpps-book-secure-move-frontend)
[![Test Coverage](https://api.codeclimate.com/v1/badges/93a7ea86058dc9d2f2dc/test_coverage)](https://codeclimate.com/github/ministryofjustice/hmpps-book-secure-move-frontend/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/93a7ea86058dc9d2f2dc/maintainability)](https://codeclimate.com/github/ministryofjustice/hmpps-book-secure-move-frontend/maintainability)

This is the rendering application for the Book a secure move service.

Book a secure move is part of the HMPPS Prisoner Escort and Custody
Service (PECS) programme.

## Dependencies

- [Node.js](https://nodejs.org/en/) (>= 12)
- [NPM](https://www.npmjs.com/) (>= 6.7.0)
- [Redis](https://redis.io/) (>= 5.0.5)

## Installation

1. Clone repository and change directory:

   ```
   git clone https://github.com/ministryofjustice/hmpps-book-secure-move-frontend && cd hmpps-book-secure-move-frontend
   ```

1. Install node dependencies:

   ```
   npm install
   ```

1. Build the assets

    ```
    npm run build
    ```

## Configuring the application

Create a copy of the example environment variable file and add values for the keys:

   ```
   cp .env.example .env
   ```

Set the [environment variables](#environment-variables) accordingly.

## Running the application

#### In production mode

```
NODE_ENV=production npm start
```

The app will run on port 3000 by default and be available at [http://localhost:3000](http://localhost:3000).

#### In development mode

Ensure Redis is installed and running.

```
npm run develop
```

The app will be running at [http://localhost:3000](http://localhost:3000) or with browsersync at [http://localhost:3001](http://localhost:3001).

## Testing and linting

### Unit tests

Unit tests are run using the [Mocha](https://mochajs.org/) test framework and the [Chai](https://www.chaijs.com/) library for assertions.

It also includes the [Sinon](https://sinonjs.org/) library for test spies, stubs and mocks.

To check unit tests results:

```
npm test
```

To watch unit tests whilst developing:

```
npm run watch:test
```

### Acceptance tests

Acceptance (end-to-end) tests run using [TestCafe](https://devexpress.github.io/testcafe/) framework
and configured in CircleCI to run against `$E2E_BASE_URL` variable (staging) when the app is merged to
`master` and deployed to staging.

To run the CI tests locally run:

```
npm run test-e2e:ci
```

To debug tests on local server run:

```
npm run test-e2e:local
```

And to run test in specific browser run: `test-e2e:chrome` or `test-e2e:firefox`.

The video recording of each test is stored in artifacts/video directory and is stored on CI under artifacts for review.

### Code coverage

Code coverage is provided by Istanbul's command line tool, [nyc](https://www.npmjs.com/package/nyc).

To see coverage reports run:

```
npm run coverage
```

### Linting

[ESLint](https://eslint.org/) is used to lint JavaScript code and keep a consistent standard in the way it is written within this project.

The config uses the [StandardJS](https://standardjs.com/) style as a base with [some custom tweaks](./.eslintrc.js).

[Prettifier](https://prettier.io) is also used to extend eslint to add some extra rules
around how files are formatted. It can be [integrated to many popular editors](https://prettier.io/docs/en/editors.html)
to help with formatting on save.

To check linting results run:

```
npm run lint
```

## Environment variables

| Name | Description | Default |
|:-----|:------------|:--------|
| PORT | Port the web server listens on | `3000` |
| LOG_LEVEL | Level of logs to output | production: `error`, development: `debug` |
| ASSETS_HOST | Host for assets CDN | |
| SESSION_SECRET **(required)** | A complex string unique to the environment, used to encrypt cookies | |
| SESSION_NAME | Name of the session ID cookie to set in the response (and read from in the request) | `book-secure-move.sid` |
| SESSION_TTL | How long the user session should last (in milliseconds) | `1800000` (30 minutes) |
| SESSION_DB_INDEX | Redis database index in which to store session data | `0` (Redis' default)|
| REDIS_URL **(required)** | Redis server URL, including port and protocol | |
| REDIS_HOST **(required)** | Redis hostname. Can be used instead of `REDIS_URL`. Will override `REDIS_URL` if set | |
| REDIS_AUTH_TOKEN | Optional auth token for the Redis instance | |
| API_BASE_URL **(required)** | Base URL for the backend API server for this service without any path | `http://localhost:3000` |
| API_PATH **(required)** | Base base for the API | `/api/v1` |
| API_HEALTHCHECK_PATH **(required)** | Path to which healthcheck pings are sent | |
| API_AUTH_PATH **(required)** | Path to which OAuth2 access token requests should be sent | |
| API_CLIENT_ID **(required)** | Client ID used to authenticate with the backend API | |
| API_SECRET **(required)** | Client secret used to authenticate with the backend API | |
| AUTH_PROVIDER_KEY **(required)** | Client key provided by the OAuth2 provider for user authentication | |
| AUTH_PROVIDER_SECRET **(required)** | Client secret provided by the OAuth2 provider for user authentication | |
| AUTH_PROVIDER_URL **(required)** | Base URL for the auth provider server | |
| NOMIS_ELITE2_API_URL **(required)** | Base URL for the NOMIS Elite 2 API, without trailing slash | |
| SERVER_HOST **(required)** | The (accessible) hostname (and port) of the listening web server. Used by [Grant](https://github.com/simov/grant) to construct redirect URLs after OAuth authentication. For example `localhost:3000` | |
| FEEDBACK_URL | URL for the feedback link in the phase banner at the top of the page. If empty, the link will not be displayed. | |
| SUPPORT_EMAIL | Email address used to contact support or the team in parts of the app where the user may require further help. | |
| SENTRY_KEY | Sentry key | |
| SENTRY_PROJECT | Sentry project ID | |
| GOOGLE_ANALYTICS_ID | Google analytics tracking ID to use for the environment | |
| E2E_BASE_URL | Base URL used for acceptance testing | `http://${process.env.SERVER_HOST}` |
| E2E_POLICE_USERNAME | Police user username used for acceptance testing | |
| E2E_POLICE_PASSWORD | Police user password used for acceptance testing | |
| E2E_SUPPLIER_USERNAME | Supplier user username used for acceptance testing | |
| E2E_SUPPLIER_PASSWORD | Supplier user password used for acceptance testing | |

### Development specific

The following environment variables can be set to help development.

| Name | Description | Default |
|:-----|:------------|:--------|
| BYPASS_SSO | Set to `true` to bypass authentication | |
| USER_PERMISSIONS | Comma delimited string of available permissions (required if bypassing auth) | |

## Components

See the [components readme](./common/components/README.md) for more detail on how to structure app level components.
