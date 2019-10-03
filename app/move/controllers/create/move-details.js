const { set } = require('lodash')
const { format, startOfToday, startOfTomorrow, parseISO } = require('date-fns')

const CreateBaseController = require('./base')
const filters = require('../../../../config/nunjucks/filters')
const fieldHelpers = require('../../../../common/helpers/field')
const referenceDataService = require('../../../../common/services/reference-data')
const referenceDataHelpers = require('../../../../common/helpers/reference-data')

class MoveDetailsController extends CreateBaseController {
  async configure(req, res, next) {
    try {
      const courtLocations = await referenceDataService.getLocationsByType(
        'court'
      )

      const { date_type: dateType } = req.form.options.fields
      const courtItems = fieldHelpers.insertInitialOption(
        courtLocations
          .filter(referenceDataHelpers.filterDisabled())
          .map(fieldHelpers.mapReferenceDataToOption),
        'court'
      )

      set(
        req,
        'form.options.fields.to_location_court_appearance.items',
        courtItems
      )

      // translate date type options early to cater for date injection
      const { items } = dateType
      items[0].text = req.t(items[0].text, {
        date: filters.formatDateWithDay(res.locals.TODAY),
      })
      items[1].text = req.t(items[1].text, {
        date: filters.formatDateWithDay(res.locals.TOMORROW),
      })

      super.configure(req, res, next)
    } catch (error) {
      next(error)
    }
  }

  process(req, res, next) {
    const { date_type: dateType, move_type: moveType } = req.form.values

    // process move date
    let moveDate

    if (dateType === 'custom') {
      moveDate = parseISO(req.form.values.date_custom)
    } else {
      req.form.values.date_custom = ''
      moveDate = dateType === 'today' ? startOfToday() : startOfTomorrow()
    }

    req.form.values.date = format(moveDate, 'yyyy-MM-dd')

    // process locations
    req.form.values.to_location = req.form.values[`to_location_${moveType}`]
    // if req.session.currentLocation doesn't exist the parent controller will error
    req.form.values.from_location = req.session.currentLocation.id

    next()
  }

  async successHandler(req, res, next) {
    try {
      const { to_location: toLocationId } = req.sessionModel.toJSON()

      if (toLocationId) {
        const locationDetail = await referenceDataService.getLocationById(
          toLocationId
        )

        req.sessionModel.set('to_location', locationDetail)
      }

      super.successHandler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = MoveDetailsController