const { dateRegex, uuidRegex } = require('../../common/helpers/url')

const MOUNTPATH = '/allocations'

const ACTIONS = [
  {
    permission: 'allocation:create',
    text: 'actions::create_allocation',
    href: '/allocation/new',
  },
]

const COLLECTION_PATH = `/:period(week|day)/:date(${dateRegex})/:locationId(${uuidRegex})?/:view(outgoing)`

const DEFAULTS = {
  QUERY: {
    outgoing: { status: '' },
  },
  TIME_PERIOD: {
    outgoing: 'week',
  },
}

const FILTERS = {
  outgoing: [
    {
      label: 'allocations::total',
      status: '',
    },
  ],
}

module.exports = {
  ACTIONS,
  COLLECTION_PATH,
  DEFAULTS,
  FILTERS,
  MOUNTPATH,
}
