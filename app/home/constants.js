const {
  FILTERS: allocationsFilters,
  MOUNTPATH: allocationsUrl,
} = require('../allocations/constants')
const {
  FILTERS: movesFilters,
  MOUNTPATH: movesUrl,
} = require('../moves/constants')

const FILTERS = {
  outgoing: [
    {
      label: 'dashboard::sections.outgoing.summary.total',
      href: `${movesUrl}/outgoing`,
    },
  ],
  incoming: [
    {
      label: 'dashboard::sections.incoming.summary.total',
      href: `${movesUrl}/incoming`,
    },
  ],
  requested: movesFilters.requested.map(item => {
    return {
      ...item,
      href: `${movesUrl}/requested`,
    }
  }),
  allocations: allocationsFilters.outgoing.map(item => {
    return {
      ...item,
      href: `${allocationsUrl}/outgoing`,
    }
  }),
}

module.exports = {
  FILTERS,
}
