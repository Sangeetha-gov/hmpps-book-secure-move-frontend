const { kebabCase, groupBy, mapValues, values } = require('lodash')

const i18n = require('../../config/i18n')
const filters = require('../../config/nunjucks/filters')

function _mapAnswer({
  title,
  comments,
  nomis_alert_description: alertDescription,
  created_at: createdAt,
}) {
  let html = ''

  if (alertDescription) {
    html = `<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">${alertDescription}</h4>`
  }

  html += comments || ''

  if (alertDescription) {
    html += `<div class="govuk-!-margin-top-2 govuk-!-font-size-16">${i18n.t(
      'created_on'
    )} ${filters.formatDateWithDay(createdAt)}</div>`
  }

  return `
    <div>
      ${html}
    </div>
  `
  return {
    key: {
      text: title,
    },
    value: {
      html:
        html ||
        `<span class="app-secondary-text-colour">${i18n.t(
          'empty_response'
        )}</span>`,
    },
  }
}

module.exports = function assessmentToSummaryListComponent(
  answers = [],
  filterCategory
) {
  const groupedByTitle = groupBy(answers, 'title')
  const rows = mapValues(groupedByTitle, (answers, title) => {
    return {
      key: {
        text: title,
      },
      value: {
        html: answers
          .map(_mapAnswer)
          .join(
            '<hr class="govuk-section-break govuk-section-break--s govuk-section-break--visible">'
          ),
      },
    }
  })
  // const rows = answers.map(_mapAnswer)

  return {
    rows: values(rows),
  }
}
