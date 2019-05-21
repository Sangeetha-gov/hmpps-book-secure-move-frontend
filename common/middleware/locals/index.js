const getAssetPath = require('./get-asset-path')

module.exports = function setLocals (req, res, next) {
  res.locals = Object.assign({}, res.locals, {
    getAssetPath,
  })

  next()
}
