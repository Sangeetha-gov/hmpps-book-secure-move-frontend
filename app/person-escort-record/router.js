const router = require('express').Router()
const wizard = require('hmpo-form-wizard')

const {
  FrameworkSectionController,
  FrameworksController,
} = require('./controllers')
// const middleware = require('./middleware')

function defineFormWizards() {
  router.use('/:sectionKey', (req, res, next) => {
    const { sectionKey } = req.params
    const { sections, questions } = req.framework
    const section = sections[sectionKey]
    const firstStep = Object.values(section.steps)[0]

    // pulled from middleware
    req.frameworkSection = section

    const wizardConfig = {
      controller: FrameworksController,
      entryPoint: true,
      journeyName: `person-escort-record-${sectionKey}`,
      journeyPageTitle: 'Person escort record',
      name: `person-escort-record-${sectionKey}`,
      template: 'framework-step',
      templatePath: 'person-escort-record/views/',
    }
    const steps = {
      '/': {
        next: firstStep.slug,
        reset: true,
        resetJourney: true,
        skip: true,
      },
      ...section.steps,
      '/overview': {
        controller: FrameworkSectionController,
        entryPoint: true,
        reset: true,
        resetJourney: true,
        template: 'framework-section',
      },
    }

    return wizard(steps, questions, wizardConfig)(req, res, next)
  })

  return router

  // const { questions, sections } = framework

  // for (const sectionKey in sections) {
  //   const section = sections[sectionKey]
  //   const wizardConfig = {
  //     controller: FrameworksController,
  //     entryPoint: true,
  //     journeyName: `person-escort-record-${sectionKey}`,
  //     journeyPageTitle: 'Person escort record',
  //     name: `person-escort-record-${sectionKey}`,
  //     template: 'framework-step',
  //     templatePath: 'person-escort-record/views/',
  //   }
  //   const steps = {
  //     '/': {
  //       controller: FrameworkSectionController,
  //       reset: true,
  //       resetJourney: true,
  //       template: 'framework-section',
  //     },
  //     ...section.steps,
  //   }

  //   router.use(
  //     `/:personEscortRecordId/${sectionKey}`,
  //     middleware.setFrameworkSection(section),
  //     wizard(steps, questions, wizardConfig)
  //   )
  // }
}

module.exports = {
  defineFormWizards,
}
