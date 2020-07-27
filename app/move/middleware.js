const allocationService = require('../../common/services/allocation')
const moveService = require('../../common/services/move')
const personEscortRecordService = require('../../common/services/person-escort-record')

module.exports = {
  setMove: async (req, res, next, moveId) => {
    if (!moveId) {
      return next()
    }

    try {
      req.move = await moveService.getById(moveId)
      next()
    } catch (error) {
      next(error)
    }
  },

  // setPersonEscortRecord: (req, res, next) => {
  //   const personEscortRecord = req.move?.profile?.person_escort_record

  //   if (personEscortRecord) {
  //     req.personEscortRecord = personEscortRecord
  //   }

  //   next()
  // },

  setPersonEscortRecord: async (req, res, next) => {
    const recordId = req.move?.profile?.person_escort_record?.id

    if (!recordId) {
      return next()
    }

    try {
      // TODO: Don't call every time. Look to make use of `include` on move to get the record from the move in one call where possible
      req.personEscortRecord = await personEscortRecordService.getById(recordId)
      next()
    } catch (error) {
      next(error)
    }
  },

  setAllocation: async (req, res, next) => {
    const { allocation } = req.move || {}

    if (!allocation) {
      return next()
    }

    try {
      req.allocation = await allocationService.getById(allocation.id)
      next()
    } catch (error) {
      next(error)
    }
  },
}
