const auth = require('./auth')
const errors = require('./errors')
const post = require('./post')
const request = require('./request')
const requestHeaders = require('./request-headers')
const requestInclude = require('./request-include')
const requestTimeout = require('./request-timeout')
const resTransform = require('./res-transform')

module.exports = {
  auth,
  errors,
  post,
  request,
  requestHeaders,
  requestInclude,
  requestTimeout,
  resTransform,
}
