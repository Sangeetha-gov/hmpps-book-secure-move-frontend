// NPM dependencies
const router = require('express').Router()

// Local dependencies
const { get } = require('./controllers')
const { ensureAuthenticated } = require('../../common/middleware/authentication')

// Load router middleware
router.use(ensureAuthenticated)

// Define routes
router.get('/', get)

// Export
module.exports = {
  router,
  mountpath: '/',
}
