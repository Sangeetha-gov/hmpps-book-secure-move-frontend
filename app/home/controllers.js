const { get } = require('lodash')

const dateHelpers = require('../../common/helpers/date')
const permissions = require('../../common/middleware/permissions')
const { formatDateRange, formatDate } = require('../../config/nunjucks/filters')

function dashboard(req, res) {
  const userPermissions = get(req.session, 'user.permissions')

  if (!permissions.check('dashboard:view', userPermissions)) {
    // TODO: Remove this once we enable the dashboard for all users
    // Moves will then likely always redirect to the dashboard
    return res.redirect('/moves')
  }

  const week = dateHelpers.getCurrentWeekAsRange()
  const [today] = dateHelpers.getCurrentDayAsRange()

  const sections = {
    outgoing: {
      permission: 'moves:view:outgoing',
      heading: 'dashboard::sections.outgoing.heading',
      filter: req.filterOutgoing,
      time: formatDate(today),
      timeAsWords: 'dashboard::time.day',
    },
    incoming: {
      permission: 'moves:view:incoming',
      heading: 'dashboard::sections.incoming.heading',
      filter: req.filterIncoming,
      time: formatDate(today),
      timeAsWords: 'dashboard::time.day',
    },
    singleRequests: {
      permission: 'moves:view:proposed',
      heading: 'dashboard::sections.single_requests.heading',
      filter: req.filterSingleRequests,
      time: formatDateRange(week),
      timeAsWords: 'dashboard::time.week',
    },
    allocations: {
      permission: 'allocations:view',
      heading: 'dashboard::sections.allocations.heading',
      filter: req.filterAllocations,
      time: formatDateRange(week),
      timeAsWords: 'dashboard::time.week',
    },
  }

  res.render('home/dashboard', {
    pageTitle: 'dashboard::page_title',
    sections,
  })
}

module.exports = {
  dashboard,
}
