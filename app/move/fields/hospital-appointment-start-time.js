const { time: timeFormatter } = require('../../../common/formatters')
const { datetime: datetimeValidator, after } = require('../validators')

const hospitalAppointmentStartTime = {
  id: 'hospital_appointment__start_time',
  name: 'hospital_appointment__start_time',
  validate: ['required', datetimeValidator, after],
  formatter: [timeFormatter],
  component: 'govukInput',
  classes: 'govuk-input--width-10',
  autocomplete: 'off',
  label: {
    html: 'fields::hospital_appointment__start_time.label',
    classes: 'govuk-label--s',
  },
}

module.exports = hospitalAppointmentStartTime
