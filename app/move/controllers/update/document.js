const { get } = require('lodash')

const moveService = require('../../../../common/services/move')
const DocumentUploadController = require('../create/document')

const UpdateBase = require('./base')

class UpdateDocumentUploadController extends UpdateBase {
  configure(req, res, next) {
    const canUploadDocuments = get(
      req,
      'session.currentLocation.can_upload_documents'
    )
    if (!canUploadDocuments) {
      const error = new Error(
        'Document upload is not possible for this location'
      )
      error.statusCode = 404
      return next(error)
    }
    DocumentUploadController.prototype.configure.apply(this, [req, res, next])
  }

  getUpdateValues(req, res) {
    const move = req.getMove()
    if (!move) {
      return {}
    }
    const values = {}
    if (req.initialStep) {
      req.sessionModel.set('documents', move.documents)
    }
    values.documents = req.sessionModel.get('documents')
    return values
  }

  async successHandler(req, res, next) {
    if (req.xhr) {
      return DocumentUploadController.prototype.successHandler.apply(this, [
        req,
        res,
        next,
      ])
    }
    try {
      await moveService.update({
        id: req.getMoveId(),
        documents: req.form.values.documents,
      })
      return res.redirect(this.getBaseUrl(req))
    } catch (err) {
      next(err)
    }
  }
}

UpdateBase.mixin(UpdateDocumentUploadController, DocumentUploadController)

module.exports = UpdateDocumentUploadController