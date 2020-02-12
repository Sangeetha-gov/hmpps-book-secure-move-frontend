const multer = require('multer')
const { reject } = require('lodash')

const CreateBaseController = require('./base')
const documentService = require('../../../../common/services/document')
const { FILE_UPLOADS } = require('../../../../config')

const upload = multer({
  dest: FILE_UPLOADS.UPLOAD_DIR,
  limits: {
    fileSize: FILE_UPLOADS.MAX_FILE_SIZE,
  },
})

class DocumentUploadController extends CreateBaseController {
  configure(req, res, next) {
    req.form.options.fields.documents.xhrUrl = req.originalUrl
    super.configure(req, res, next)
  }

  middlewareSetup() {
    super.middlewareSetup()
    this.use(upload.array('documents'))
    // must be called after multer to correctly parse the form body
    this.use(this.setNextStep)
  }

  setNextStep(req, res, next) {
    if (req.body.upload || req.body.delete) {
      req.form.options.next = req.originalUrl
    }
    next()
  }

  async saveValues(req, res, next) {
    const sessionDocuments = req.sessionModel.get('documents') || []
    const { delete: deletedId } = req.body
    let documents = []

    try {
      if (req.files) {
        req.uploaded = await Promise.all(
          req.files.map(file => documentService.create(file))
        )
        documents = [...sessionDocuments, ...req.uploaded]
      }

      if (deletedId) {
        await documentService.destroy(deletedId)
        documents = reject(sessionDocuments, { id: deletedId })
      }

      req.form.values.documents = documents

      super.saveValues(req, res, next)
    } catch (error) {
      next(error)
    }
  }

  errorHandler(err, req, res, next) {
    const isXhr = req.xhr
    let uploadError

    if (err instanceof multer.MulterError) {
      const key = err.field

      uploadError = {
        [key]: new this.Error(key, { type: err.code }, req, res),
      }

      if (isXhr) {
        return res.status(500).send(req.t(`validation::${err.code}`))
      }
    }

    super.errorHandler(uploadError || err, req, res, next)
  }

  successHandler(req, res, next) {
    const isXhr = req.xhr

    if (isXhr) {
      const response =
        req.uploaded && req.uploaded.length === 1
          ? req.uploaded[0]
          : req.uploaded

      return res.status(200).json(response || [])
    }

    super.successHandler(req, res, next)
  }
}

module.exports = DocumentUploadController
