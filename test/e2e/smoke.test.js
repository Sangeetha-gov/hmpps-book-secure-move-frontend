import { movesByDay } from './_routes'
import { policeUser, stcUser, supplierUser } from './roles'
import { page, movesDashboardPage } from './pages'

const users = [
  {
    name: 'Police user',
    role: policeUser,
    username: 'End-to-End Test Police',
    homeButton: movesDashboardPage.nodes.createMoveButton,
  },
  {
    name: 'STC user',
    role: stcUser,
    username: 'End-to-End Test STC',
    homeButton: movesDashboardPage.nodes.createMoveButton,
  },
  {
    name: 'Supplier user',
    role: supplierUser,
    username: 'End-to-End Test Supplier',
    homeButton: movesDashboardPage.nodes.downloadMovesLink,
  },
]

users.forEach(user => {
  fixture(`Smoke test (${user.name})`).beforeEach(async t => {
    await t.useRole(user.role).navigateTo(movesByDay)
  })

  test('Sign in/sign out, navigate days and load without errors', async t => {
    await t
      .expect(page.nodes.appHeader.exists)
      .ok()
      .expect(page.nodes.username.innerText)
      .eql(user.username)
      .expect(user.homeButton.exists)
      .ok()
      // Navigate
      .expect(page.nodes.pageHeading.innerText)
      .eql('Today')
      .click(movesDashboardPage.nodes.pagination.previousLink)
      .expect(page.nodes.pageHeading.innerText)
      .eql('Yesterday')
      .click(movesDashboardPage.nodes.pagination.todayLink)
      .expect(page.nodes.pageHeading.innerText)
      .eql('Today')
      .click(movesDashboardPage.nodes.pagination.nextLink)
      .expect(page.nodes.pageHeading.innerText)
      .eql('Tomorrow')
      // Sign out
      .click(page.nodes.signOutLink)
      .expect(page.nodes.signInHeader.exists)
      .ok()
  })
})
