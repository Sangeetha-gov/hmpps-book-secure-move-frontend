const frameworksService = require('../../common/services/frameworks')
const personEscortRecordService = require('../../common/services/person-escort-record')

function setFramework(framework) {
  return (req, res, next) => {
    req.framework = framework
    next()
  }
}

function setFrameworkSection(frameworkSection) {
  return (req, res, next) => {
    req.frameworkSection = frameworkSection
    next()
  }
}

async function setPersonEscortRecord(req, res, next) {
  const recordId =
    req.params?.personEscortRecordId || req?.personEscortRecord?.id

  if (!recordId) {
    return next()
  }

  try {
    // TODO: Don't call every time. Look to make use of `include` on move to get the record from the move in one call where possible
    const personEscortRecord = await personEscortRecordService.getById(recordId)

    req.personEscortRecord = personEscortRecord
    req.framework = frameworksService.getPersonEscortRecord(
      personEscortRecord.version
    )

    next()
  } catch (error) {
    if (error.code === 'MISSING_FRAMEWORK') {
      console.log(req.personEscortRecord)
      return res.render('person-escort-record/views/framework-missing', {
        profileId: req.personEscortRecord.profile.id,
      })
    }

    next(error)
  }
}

module.exports = {
  setFramework,
  setFrameworkSection,
  setPersonEscortRecord,
}
