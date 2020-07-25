const { filter, orderBy } = require('lodash')

const presenters = require('../../../common/presenters')

function printRecord(req, res) {
  const { framework, personEscortRecord, move } = req
  const person = move?.profile?.person
  const assessmentAnswers = move?.profile?.assessment_answers
  const personalDetailsSummary = presenters.personToSummaryListComponent(person)
  const courtSummary = presenters.assessmentToSummaryListComponent(
    assessmentAnswers,
    'court'
  )
  const sections = orderBy(framework.sections, 'order').map(section => {
    const { steps } = section
    const stepSummaries = Object.entries(steps).map(
      presenters.frameworkStepToSummary(
        framework.questions,
        personEscortRecord.responses
      )
    )

    return {
      ...section,
      summarySteps: filter(stepSummaries),
    }
  })

  const locals = {
    sections,
    courtSummary,
    assessmentAnswers,
    move,
    personEscortRecord: req.personEscortRecord,
    personalDetailsSummary: {
      rows: personalDetailsSummary.rows.map(({ key, value }) => {
        return {
          key: {
            ...key,
            classes: 'govuk-!-font-weight-regular',
          },
          value,
        }
      }),
      classes: 'govuk-!-font-size-16',
    },
  }

  res.render('person-escort-record/views/print-record.njk', locals)
}

module.exports = printRecord
