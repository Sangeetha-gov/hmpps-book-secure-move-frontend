const { set } = require('lodash')

const dateHelpers = require('../../../common/helpers/date')

function setBodySingleRequests(req, res, next) {
  const { dateRange, locationId } = req.params
  const { status, sort = {} } = req.query

  set(req, 'body.requested', {
    status,
    createdAtDate: dateRange || dateHelpers.getCurrentWeekAsRange(),
    fromLocationId: locationId,
    sortBy: sort.by,
    sortDirection: sort.direction,
  })

  next()
}

module.exports = setBodySingleRequests
