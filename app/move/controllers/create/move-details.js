const { get, map, omitBy, set } = require('lodash')

const fieldHelpers = require('../../../../common/helpers/field')
const referenceDataHelpers = require('../../../../common/helpers/reference-data')
const referenceDataService = require('../../../../common/services/reference-data')

const CreateBaseController = require('./base')

class MoveDetailsController extends CreateBaseController {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.setMoveTypes)
    this.use(this.setLocationItems('court', 'to_location_court_appearance'))
    this.use(this.setLocationItems('prison', 'to_location_prison_transfer'))
  }

  setLocationItems(locationType, fieldName) {
    return async (req, res, next) => {
      const { fields } = req.form.options

      if (!fields[fieldName]) {
        return next()
      }

      try {
        const locations = await referenceDataService.getLocationsByType(
          locationType
        )
        const items = fieldHelpers.insertInitialOption(
          locations
            .filter(referenceDataHelpers.filterDisabled())
            .map(fieldHelpers.mapReferenceDataToOption),
          locationType
        )

        set(req, `form.options.fields.${fieldName}.items`, items)
        next()
      } catch (error) {
        next(error)
      }
    }
  }

  setMoveTypes(req, res, next) {
    const permittedMoveTypes = get(req.session, 'user.permissions', [])
      .filter(permission => permission.includes('move:create:'))
      .map(permission => permission.replace('move:create:', ''))
    const existingItems = req.form.options.fields.move_type.items
    const permittedItems = existingItems.filter(item =>
      permittedMoveTypes.includes(item.value)
    )
    const removedConditionals = map(
      existingItems.filter(item => !permittedMoveTypes.includes(item.value)),
      'conditional'
    )

    // update move_type with only permitted items
    set(req, 'form.options.fields.move_type.items', permittedItems)

    // remove any conditionals fields that are no longer needed
    req.form.options.fields = omitBy(req.form.options.fields, (value, key) =>
      removedConditionals.includes(key)
    )

    next()
  }

  process(req, res, next) {
    const { move_type: moveType } = req.form.values
    const existingMoveType = req.sessionModel.get('move_type')

    // process locations
    req.form.values.to_location = req.form.values[`to_location_${moveType}`]

    if (moveType === 'prison_recall') {
      req.form.values.additional_information =
        req.form.values.prison_recall_comments
    }

    if (moveType !== 'prison_recall' && existingMoveType === 'prison_recall') {
      req.form.values.additional_information = null
    }

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
        req.sessionModel.set('to_location_type', locationDetail.location_type)
      }

      super.successHandler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = MoveDetailsController
