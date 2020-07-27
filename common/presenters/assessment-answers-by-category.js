const { groupBy, sortBy, mapValues } = require('lodash')

const {
  TAG_CATEGORY_WHITELIST,
  ASSESSMENT_ANSWERS_MAP,
} = require('../../config')
const { filterExpired } = require('../helpers/reference-data')

module.exports = function assessmentAnswersByCategory(assessmentAnswers = []) {
  // const grouped = groupBy(assessmentAnswers, 'category')
  // const mapped = mapValues(grouped, (answers, category) => {
  //   const params = ASSESSMENT_ANSWERS_MAP[category]

  //   return {
  //     ...params,
  //     answers,
  //     key: category,
  //   }
  // })

  // return sortBy(mapped, 'sortOrder')

  const mapped = mapValues(ASSESSMENT_ANSWERS_MAP, (params, category) => {
    const answers = assessmentAnswers
      .filter(answer => answer.category === category)
      .filter(filterExpired)

    return {
      ...params,
      answers,
      key: category,
    }
  })

  return sortBy(mapped, 'sortOrder')
}
