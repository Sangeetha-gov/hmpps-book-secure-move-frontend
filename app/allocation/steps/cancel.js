const { cancelControllers } = require('../controllers')

module.exports = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'reason',
  },
  '/reason': {
    template: 'cancel-reason',
    controller: cancelControllers.CancelController,
    pageTitle: 'allocations::allocation_cancel_reasons.page_title',
    buttonText: 'actions::cancel_move_confirmation',
    buttonClasses: 'govuk-button--warning',
  },
}