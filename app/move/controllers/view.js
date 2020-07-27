const { isEmpty, kebabCase, find, get, sortBy, uniqBy } = require('lodash')

const presenters = require('../../../common/presenters')
const componentService = require('../../../common/services/component')
const frameworksService = require('../../../common/services/frameworks')
const { FEATURE_FLAGS, FRAMEWORKS } = require('../../../config')
const updateSteps = require('../steps/update')

const getUpdateLinks = require('./view/view.update.links')
const getUpdateUrls = require('./view/view.update.urls')

const framework = frameworksService.getPersonEscortRecord()

function _mapAssessmentComponent(category) {
  let params = {}

  if (category.component === 'appPanelList') {
    params = presenters.assessmentCategoryToPanelComponent(category)
  }

  if (category.component === 'govukSummaryList') {
    params = presenters.assessmentToSummaryListComponent(category.answers)
  }

  return {
    ...category,
    params,
  }
}

module.exports = function view(req, res) {
  const { move, originalUrl } = req
  const {
    profile,
    status,
    cancellation_reason: cancellationReason,
    cancellation_reason_comment: cancellationComments,
    rejection_reason: rejectionReason,
  } = move
  const bannerStatuses = ['cancelled']
  const userPermissions = get(req.session, 'user.permissions')
  const updateUrls = getUpdateUrls(updateSteps, move.id, userPermissions)
  const updateActions = getUpdateLinks(updateSteps, updateUrls)
  const { person, assessment_answers: assessmentAnswers = [] } = profile || {}
  const personEscortRecord = req.personEscortRecord
  const personEscortRecordIsEnabled = FEATURE_FLAGS.PERSON_ESCORT_RECORD
  const personEscortRecordIsComplete =
    personEscortRecord &&
    !['not_started', 'in_progress'].includes(personEscortRecord?.status)
  const personEscortRecordUrl = `${originalUrl}/person-escort-record`
  const showPersonEscortRecordBanner =
    FEATURE_FLAGS.PERSON_ESCORT_RECORD &&
    personEscortRecord?.status !== 'confirmed' &&
    move.status === 'requested' &&
    move.profile?.id !== undefined
  const personEscortRecordtaskList = presenters.frameworkToTaskListComponent({
    baseUrl: `${personEscortRecordUrl}/`,
    frameworkSections: framework.sections,
    sectionProgress: personEscortRecord?.meta?.section_progress,
  })
  const personEscortRecordTagList = presenters.frameworkFlagsToTagList(
    personEscortRecord?.flags
  )
  const urls = {
    update: updateUrls,
  }
  const assessment = presenters
    .assessmentAnswersByCategory(assessmentAnswers)
    .filter(category => category.key !== 'court')
    .map(_mapAssessmentComponent)
  const courtSummary = presenters
    .assessmentAnswersByCategory(assessmentAnswers)
    .filter(category => category.key === 'court')
    .map(_mapAssessmentComponent)[0]

  const locals = {
    move,
    personEscortRecord,
    personEscortRecordIsEnabled,
    personEscortRecordIsComplete,
    personEscortRecordUrl,
    personEscortRecordtaskList,
    showPersonEscortRecordBanner,
    personEscortRecordTagList,
    moveSummary: presenters.moveToMetaListComponent(move, updateActions),
    personalDetailsSummary: presenters.personToSummaryListComponent(person),
    tagList: presenters.assessmentToTagList(assessmentAnswers),
    assessment,
    canCancelMove:
      (userPermissions.includes('move:cancel') &&
        move.status === 'requested' &&
        !move.allocation) ||
      (userPermissions.includes('move:cancel:proposed') &&
        move.status === 'proposed'),
    courtHearings: sortBy(move.court_hearings, 'start_time').map(
      courtHearing => {
        return {
          ...courtHearing,
          summaryList: presenters.courtHearingToSummaryListComponent(
            courtHearing
          ),
        }
      }
    ),
    courtSummary,
    // courtSummary: presenters.assessmentToSummaryListComponent(
    //   assessmentAnswers.filter(answer => answer.category === 'court')
    // ),
    assessmentSections: sortBy(framework.sections, 'order').map(section => {
      const sectionFlags = uniqBy(
        personEscortRecord?.flags.filter(
          flag => flag.question.section === section.key
        ),
        'title'
      )
      const flagsMap = {}
      const tagList = presenters.frameworkFlagsToTagList(sectionFlags)
      const responsesWithFlags = personEscortRecord?.responses
        .filter(response => response.flags.length > 0)
        .filter(response => response.question.section === section.key)
        .map(response => {
          delete response.person_escort_record
          delete response.question.framework
          response.flags.forEach(flag => {
            if (!flagsMap[flag.title]) {
              flagsMap[flag.title] = []
            }

            if (response.value_type === 'collection') {
              flagsMap[flag.title].push({
                ...response,
                value: response.value.filter(value => {
                  return value.option === flag.question_value
                }),
              })
            } else {
              flagsMap[flag.title].push(response)
            }
          })

          return response
        })

      const bookingAssessment = find(assessment, {
        key: FRAMEWORKS.assessmentAnswersMap[section.key],
      })

      return {
        key: section.key,
        name: section.name,
        url: `${personEscortRecordUrl}/${section.key}/overview`,
        // tagList,
        // flagsMap,
        // responsesWithFlags,
        bookingAssessment,
        panels: tagList.map(tag => {
          return {
            attributes: {
              id: kebabCase(tag.text),
            },
            tag,
            metaList: {
              classes: 'app-meta-list--divider',
              items: flagsMap[tag.text].map(response => {
                const responseHtml = componentService.getComponent(
                  'appFrameworkResponse',
                  {
                    value: isEmpty(response.value) ? undefined : response.value,
                    valueType: response.value_type,
                  }
                )
                const question = framework.questions[response.question.key]

                return {
                  value: {
                    html: `
                      <h4 class="govuk-heading-s govuk-!-margin-0">${question.description}</h4>
                      ${responseHtml}
                    `,
                  },
                }
              }),
            },
          }
        }),
      }
    }),
    messageTitle: bannerStatuses.includes(status)
      ? req.t('statuses::' + status, { context: cancellationReason })
      : undefined,
    messageContent: req.t('statuses::description', {
      context: rejectionReason || cancellationReason,
      comment: cancellationComments,
    }),
    updateLinks: updateActions,
    urls,
  }

  res.render('move/views/view', locals)
}
