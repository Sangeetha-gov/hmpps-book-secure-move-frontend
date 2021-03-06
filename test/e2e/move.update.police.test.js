import { addDays, format } from 'date-fns'

import {
  createCourtMove,
  checkUpdateLinks,
  checkUpdatePagesAccessible,
  checkPoliceNationalComputerReadOnly,
  checkUpdatePersonalDetails,
  checkUpdateRiskInformation,
  checkUpdateHealthInformation,
  checkUpdateCourtInformation,
  checkUpdateMoveDetails,
  checkUpdateMoveDate,
} from './_move'
import { policeUser } from './_roles'
import { home, getMove } from './_routes'

fixture('Existing move from Police Custody to Court').beforeEach(async t => {
  await t.useRole(policeUser).navigateTo(home)
  await createCourtMove()
})

test('With existing PNC number', async t => {
  await checkUpdateLinks([
    'personal_details',
    'risk',
    'health',
    'court',
    'move',
    'date',
  ])

  await checkPoliceNationalComputerReadOnly()

  await t.navigateTo(getMove(t.ctx.move.id))
  await checkUpdatePersonalDetails({
    exclude: ['policeNationalComputer'],
  })

  await checkUpdateRiskInformation()
  await checkUpdateHealthInformation()
  await checkUpdateCourtInformation()
  await checkUpdateMoveDetails()
  await checkUpdateMoveDate()

  const anotherDate = format(addDays(new Date(), 3), 'iiii d MMM yyyy')
  await checkUpdateMoveDate(anotherDate)

  await checkUpdatePagesAccessible([
    'personal_details',
    'risk',
    'health',
    'court',
    'move',
    'date',
  ])
})

test.before(async t => {
  await t.useRole(policeUser).navigateTo(home)
  await createCourtMove({
    personOverrides: {
      policeNationalComputer: undefined,
    },
  })
})('Without existing PNC number', async t => {
  await checkUpdatePersonalDetails({
    include: ['policeNationalComputer'],
  })
})

fixture.beforeEach(async t => {
  await t.useRole(policeUser).navigateTo(home)
  await createCourtMove({
    moveOverrides: {
      move_type: 'prison_recall',
    },
  })
})('Existing move from Police Custody to Prison (recall)')

test('User should be able to update move details', async t => {
  await checkUpdateMoveDetails()
})
