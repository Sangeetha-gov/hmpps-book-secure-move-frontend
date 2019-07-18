const moveService = require('../../common/services/move')

module.exports = {
  setMove: async (req, res, next, moveId) => {
    if (!moveId) {
      return next()
    }

    try {
      const move = await moveService.getMoveById(moveId)

      res.locals.move = move.data

      next()
    } catch (error) {
      next(error)
    }
  },
}