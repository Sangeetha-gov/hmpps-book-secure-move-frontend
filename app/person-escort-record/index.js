// NPM dependencies
const router = require('express').Router({ mergeParams: true })

// Local dependencies
const { uuidRegex } = require('../../common/helpers/url')
const frameworksService = require('../../common/services/frameworks')

const confirmApp = require('./app/confirm')
const newApp = require('./app/new')
const { frameworkOverviewController } = require('./controllers')
const { setFramework, setPersonEscortRecord } = require('./middleware')
const { defineFormWizards } = require('./router')

const frameworkWizard = defineFormWizards()

// Define shared middleware
router.use(setPersonEscortRecord)
router.use(frameworkWizard)

// Define sub-apps
router.use(newApp.mountpath, newApp.router)
router.use(confirmApp.mountpath, confirmApp.router)

// Define routes
router.get('/', frameworkOverviewController)

// Export
module.exports = {
  router,
  mountpath: `/person-escort-record/:personEscortRecordId(${uuidRegex})?`,
}
