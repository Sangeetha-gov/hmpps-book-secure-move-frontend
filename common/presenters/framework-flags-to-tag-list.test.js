const proxyquire = require('proxyquire')

const mockFlagSettings = {
  alert: {
    tagClass: 'app-tag--destructive',
    sortOrder: 1,
  },
  warning: {
    tagClass: 'app-tag--warning',
    sortOrder: 2,
  },
}

const presenter = proxyquire('./framework-flags-to-tag-list', {
  '../../config': {
    FRAMEWORKS: {
      FLAG_SETTINGS: mockFlagSettings,
    },
  },
})

describe('Presenters', function () {
  describe('#assessmentToTagList()', function () {
    beforeEach(function () {
      presenter()()
    })
  })
})
