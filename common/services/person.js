const { mapValues, uniqBy } = require('lodash')

const apiClient = require('../lib/api-client')()

const personService = {
  transform(person = {}) {
    return {
      ...person,
      fullname: [person.last_name, person.first_names]
        .filter(Boolean)
        .join(', '),
    }
  },

  format(data) {
    const existingIdentifiers = data.identifiers || []
    const relationshipKeys = ['gender', 'ethnicity']
    const identifierKeys = [
      'police_national_computer',
      'criminal_records_office',
      'prison_number',
      'niche_reference',
      'athena_reference',
    ]

    const formatted = mapValues(data, (value, key) => {
      if (typeof value === 'string') {
        if (relationshipKeys.includes(key)) {
          return { id: value }
        }

        if (identifierKeys.includes(key)) {
          return { value, identifier_type: key }
        }
      }

      return value
    })

    const identifiers = uniqBy(
      [
        ...identifierKeys.map(key => formatted[key]).filter(Boolean),
        ...existingIdentifiers,
      ],
      'identifier_type'
    )

    return {
      ...formatted,
      identifiers,
    }
  },

  create(data) {
    return apiClient
      .create('person', personService.format(data))
      .then(response => response.data)
  },

  update(data) {
    if (!data.id) {
      return
    }

    return apiClient
      .update('person', personService.format(data))
      .then(response => response.data)
  },
}

module.exports = personService
