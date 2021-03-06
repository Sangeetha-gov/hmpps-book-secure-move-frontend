import AllocationJourney from './allocation-journey'
import CancelMovePage from './cancel-move'
import CreateMovePage from './create-move'
import DashboardPage from './dashboard'
import MoveDetailPage from './move-detail'
import MovesDashboardPage from './moves-dashboard'
import Page from './page'
import UpdateMovePage from './update-move'

const page = new Page()
const allocationJourney = new AllocationJourney()
const moveDetailPage = new MoveDetailPage()
const movesDashboardPage = new MovesDashboardPage()
const createMovePage = new CreateMovePage()
const cancelMovePage = new CancelMovePage()
const dashboardPage = new DashboardPage()

export {
  page,
  allocationJourney,
  moveDetailPage,
  movesDashboardPage,
  createMovePage,
  cancelMovePage,
  dashboardPage,
  UpdateMovePage,
}
