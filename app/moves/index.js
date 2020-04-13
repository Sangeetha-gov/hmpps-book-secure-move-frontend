// NPM dependencies
const router = require('express').Router()
const viewRouter = require('express').Router({ mergeParams: true })

// Local dependencies
const {
  renderAsCards,
  renderAsTable,
} = require('../../common/controllers/collection')
const { setDateRange } = require('../../common/middleware')
const {
  redirectDefaultQuery,
  redirectView,
  setContext,
} = require('../../common/middleware/collection')
const { protectRoute } = require('../../common/middleware/permissions')

const {
  COLLECTION_MIDDLEWARE,
  COLLECTION_BASE_PATH,
  COLLECTION_VIEW_PATH,
  DEFAULTS,
  FILTERS,
  MOUNTPATH,
} = require('./constants')
const { download } = require('./controllers')
const {
  redirectBaseUrl,
  saveUrl,
  setFromLocation,
  setBodySingleRequests,
  setFilterSingleRequests,
  setResultsSingleRequests,
  setResultsOutgoing,
} = require('./middleware')

// Define param middleware
router.param('locationId', setFromLocation)
router.param('date', setDateRange)
router.param('view', redirectDefaultQuery(DEFAULTS.QUERY))

// Define shared middleware
router.use('^([^.]+)$', saveUrl)

// Define routes
viewRouter.get(
  '/:view(requested)',
  protectRoute('moves:view:proposed'),
  setContext('single_requests'),
  COLLECTION_MIDDLEWARE,
  [
    setBodySingleRequests,
    setFilterSingleRequests(FILTERS.requested),
    setResultsSingleRequests,
  ],
  renderAsTable
)
viewRouter.get(
  '/:view(requested)/download.:extension(csv|json)',
  protectRoute('moves:download'),
  protectRoute('moves:view:proposed'),
  [setBodySingleRequests, setResultsSingleRequests],
  download
)
viewRouter.get(
  '/:view(outgoing)',
  protectRoute('moves:view:outgoing'),
  setContext('outgoing_moves'),
  COLLECTION_MIDDLEWARE,
  [setResultsOutgoing],
  renderAsCards
)
viewRouter.get(
  '/:view(outgoing)/download.:extension(csv|json)',
  protectRoute('moves:download'),
  protectRoute('moves:view:outgoing'),
  [setResultsOutgoing],
  download
)

router.get('/', redirectBaseUrl)
router.get(COLLECTION_VIEW_PATH, redirectView(DEFAULTS.TIME_PERIOD))
router.use(COLLECTION_BASE_PATH, viewRouter)

// Export
module.exports = {
  mountpath: MOUNTPATH,
  router,
}
