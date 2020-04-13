const i18n = require('../../config/i18n')
const filters = require('../../config/nunjucks/filters')

module.exports = function courtHearingsToSummaryListComponent({
  comments,
  start_time: startTime,
  case_number: caseNumber,
  case_type: caseType,
  case_start_date: caseStartDate,
} = {}) {
  const startedOn = i18n.t('moves::detail.court_hearing.started_on', {
    datestring: filters.formatDate(caseStartDate),
    datetime: filters.formatDate(caseStartDate, 'yyyy-MM-dd'),
  })
  const startedOnString = caseStartDate ? ` (${startedOn})` : ''

  const rows = [
    {
      key: {
        text: i18n.t('moves::detail.court_hearing.time_of_hearing'),
      },
      value: {
        html: startTime
          ? `<time datetime="${startTime}">${filters.formatTime(
              startTime
            )}</time>`
          : undefined,
      },
    },
    {
      key: {
        text: i18n.t('moves::detail.court_hearing.case_number'),
      },
      value: {
        html: caseNumber ? caseNumber + startedOnString : undefined,
      },
    },
    {
      key: {
        text: i18n.t('moves::detail.court_hearing.case_type'),
      },
      value: {
        text: caseType,
      },
    },
    {
      key: {
        text: i18n.t('moves::detail.court_hearing.comments'),
      },
      value: {
        text: comments,
      },
    },
  ]

  return {
    classes: 'govuk-!-margin-bottom-2',
    rows: rows.filter(row => row.value.text || row.value.html),
  }
}
