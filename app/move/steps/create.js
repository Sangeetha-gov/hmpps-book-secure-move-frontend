const {
  PersonalDetails,
  Assessment,
  MoveDetails,
  Save,
  PersonSearch,
  PersonSearchResults,
  Document,
} = require('../controllers/create')

module.exports = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'person-search',
  },
  '/person-search': {
    controller: PersonSearch,
    buttonText: 'actions::search',
    template: 'move/views/create/person-search',
    pageTitle: 'moves::steps.person_search.heading',
    next: [
      {
        field: 'is_manual_person_creation',
        value: true,
        next: 'personal-details',
      },
      'person-search-results',
    ],
    fields: ['filter.police_national_computer'],
  },
  '/person-search-results': {
    controller: PersonSearchResults,
    template: 'move/views/create/person-search-results',
    pageTitle: 'moves::steps.person_search_results.heading',
    next: [
      {
        field: 'is_manual_person_creation',
        value: true,
        next: 'personal-details',
      },
      'move-details',
    ],
    fields: ['people'],
  },
  '/personal-details': {
    backLink: 'person-search',
    controller: PersonalDetails,
    pageTitle: 'moves::steps.personal_details.heading',
    next: 'move-details',
    fields: [
      'police_national_computer',
      'last_name',
      'first_names',
      'date_of_birth',
      'ethnicity',
      'gender',
      'gender_additional_information',
    ],
  },
  '/move-details': {
    controller: MoveDetails,
    template: 'move/views/create/move-details',
    pageTitle: 'moves::steps.move_details.heading',
    next: [
      {
        field: 'move_type',
        value: 'court_appearance',
        next: 'court-information',
      },
      'risk-information',
    ],
    fields: [
      'from_location',
      'to_location',
      'move_type',
      'to_location_court_appearance',
      'additional_information',
      'date',
      'date_type',
      'date_custom',
    ],
  },
  '/agreement-status': {
    pageTitle: 'moves::agreement_status.heading',
    fields: ['move_agreed', 'move_agreed_by'],
  },
  '/court-information': {
    controller: Assessment,
    pageTitle: 'moves::steps.court_information.heading',
    assessmentCategory: 'court',
    next: 'risk-information',
    fields: ['solicitor', 'interpreter', 'other_court'],
  },
  '/risk-information': {
    controller: Assessment,
    assessmentCategory: 'risk',
    pageTitle: 'moves::steps.risk_information.heading',
    next: 'health-information',
    fields: [
      'violent',
      'escape',
      'hold_separately',
      'self_harm',
      'concealed_items',
      'other_risks',
    ],
  },
  '/health-information': {
    controller: Assessment,
    assessmentCategory: 'health',
    next: [
      {
        field: 'can_upload_documents',
        value: true,
        next: 'document',
      },
      'save',
    ],
    pageTitle: 'moves::steps.health_information.heading',
    fields: [
      'special_diet_or_allergy',
      'health_issue',
      'medication',
      'wheelchair',
      'pregnant',
      'other_health',
      'special_vehicle',
    ],
  },
  '/document': {
    enctype: 'multipart/form-data',
    controller: Document,
    next: 'save',
    pageTitle: 'moves::steps.document.heading',
    fields: ['documents'],
  },
  '/save': {
    skip: true,
    controller: Save,
  },
}
