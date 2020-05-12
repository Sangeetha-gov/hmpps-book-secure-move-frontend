const { pick } = require('lodash')

const FormWizardController = require('../../../common/controllers/form-wizard')
const presenters = require('../../../common/presenters')
const singleRequestService = require('../../../common/services/single-request')
const filters = require('../../../config/nunjucks/filters')

class ReviewController extends FormWizardController {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.updateDateHint)
  }

  middlewareLocals() {
    super.middlewareLocals()
    this.use(this.setMoveSummary)
  }

  middlewareChecks() {
    super.middlewareChecks()
    this.use(this.checkStatus)
    this.use(this.canAccess)
  }

  checkStatus(req, res, next) {
    const { id, status } = res.locals.move

    if (status !== 'proposed') {
      return res.redirect(`/move/${id}`)
    }

    next()
  }

  canAccess(req, res, next) {
    const { canAccess, move } = res.locals

    if (canAccess('move:review', req.session.user.permissions)) {
      return next()
    }

    res.redirect(`/move/${move.id}`)
  }

  updateDateHint(req, res, next) {
    const { move_date: moveDate } = req.form.options.fields
    const { date_to: dateTo, date_from: dateFrom } = res.locals.move

    moveDate.hint.text = req.t(moveDate.hint.text, {
      context: dateTo ? 'with_date_range' : 'with_date',
      date: filters.formatDateRange([dateFrom, dateTo], 'and'),
    })

    next()
  }

  setMoveSummary(req, res, next) {
    const { move } = res.locals

    res.locals.person = move.person
    res.locals.moveSummary = presenters.moveToMetaListComponent(move)

    next()
  }

  async successHandler(req, res, next) {
    const { id: moveId } = res.locals.move
    const data = pick(
      req.sessionModel.toJSON(),
      Object.keys(req.form.options.allFields)
    )

    try {
      if (data.review_decision === 'reject') {
        await singleRequestService.reject(moveId, {
          comment: data.rejection_reason_comment,
        })
      }

      if (data.review_decision === 'approve') {
        await singleRequestService.approve(moveId, {
          date: data.move_date,
        })
      }

      req.journeyModel.reset()
      req.sessionModel.reset()

      res.redirect(
        data.review_decision === 'approve'
          ? `/move/${moveId}/confirmation`
          : `/move/${moveId}`
      )
    } catch (error) {
      next(error)
    }
  }
}

module.exports = ReviewController