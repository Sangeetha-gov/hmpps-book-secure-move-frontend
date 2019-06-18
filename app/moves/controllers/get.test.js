const presenters = require('../../../common/presenters')

const controllers = require('./')

const { data: mockMove } = require('../../../test/fixtures/api-client/move.get.deserialized.json')

describe('Moves controllers', function () {
  describe('#get()', function () {
    let req, res

    beforeEach(function () {
      sinon.stub(presenters, 'moveToMetaListComponent').returnsArg(0)
      sinon.stub(presenters, 'personToSummaryListComponent').returnsArg(0)
      sinon.stub(presenters, 'assessmentToTagList').returnsArg(0)

      req = {}
      res = {
        render: sinon.spy(),
        locals: {
          move: mockMove,
        },
      }

      controllers.get(req, res)
    })

    it('should render a template', function () {
      expect(res.render.calledOnce).to.be.true
    })

    it('should contain fullname param', function () {
      const params = res.render.args[0][1]
      expect(params).to.have.property('fullname')
      expect(params.fullname).to.equal(`${mockMove.person.last_name}, ${mockMove.person.first_names}`)
    })

    it('should contain a move summary param', function () {
      const params = res.render.args[0][1]
      expect(params).to.have.property('moveSummary')
      expect(params.moveSummary).to.equal(mockMove)
    })

    it('should contain personal details summary param', function () {
      const params = res.render.args[0][1]
      expect(params).to.have.property('personalDetailsSummary')
      expect(params.personalDetailsSummary).to.equal(mockMove.person)
    })

    it('should contain tag list param', function () {
      const params = res.render.args[0][1]
      expect(params).to.have.property('tagList')
      expect(params.tagList).to.equal(mockMove.person.assessment_answers)
    })
  })
})
