const proxyquire = require('proxyquire')
const FormController = require('hmpo-form-wizard').Controller

const Controller = proxyquire('./save', {
  '../../../moves': {
    mountpath: '/moves',
  },
})
const moveService = require('../../../../common/services/move')
const personService = require('../../../../common/services/person')
const filters = require('../../../../config/nunjucks/filters')

const controller = new Controller({ route: '/' })

const mockPerson = {
  id: '3333',
  fullname: 'Full name',
}
const mockMove = {
  id: '4444',
  date: '2019-10-10',
  to_location: {
    title: 'To location',
  },
  person: mockPerson,
}
const valuesMock = {
  'csrf-secret': 'secret',
  errors: null,
  errorValues: {
    reference: '',
    to_location: 'Court',
    from_location: 'Prison',
  },
  reference: '',
  to_location: 'Court',
  from_location: 'Prison',
  person: {
    first_names: 'Steve',
    last_name: 'Smith',
  },
}

describe('Move controllers', function() {
  describe('Save', function() {
    describe('#saveValues()', function() {
      let req, nextSpy

      beforeEach(function() {
        nextSpy = sinon.spy()
        req = {
          form: {
            values: {},
          },
          sessionModel: {
            set: sinon.stub(),
            toJSON: () => valuesMock,
          },
        }
      })

      context('when move save is successful', function() {
        beforeEach(async function() {
          sinon.spy(FormController.prototype, 'configure')
          sinon.stub(moveService, 'create').resolves(mockMove)
          sinon.stub(personService, 'update').resolves(mockPerson)
          await controller.saveValues(req, {}, nextSpy)
        })

        it('should filter out correct properties', function() {
          expect(moveService.create).to.be.calledWith({
            reference: '',
            to_location: 'Court',
            from_location: 'Prison',
            person: {
              first_names: 'Steve',
              last_name: 'Smith',
            },
          })
        })

        it('should call person update', function() {
          expect(personService.update).to.be.calledWith(valuesMock.person)
        })

        it('should set response to session model', function() {
          expect(req.sessionModel.set).to.be.calledWith('move', mockMove)
        })

        it('should not throw an error', function() {
          expect(nextSpy).to.be.calledOnce
          expect(nextSpy).to.be.calledWith()
        })
      })

      context('when save fails', function() {
        const errorMock = new Error('Problem')

        beforeEach(async function() {
          sinon.stub(moveService, 'create').throws(errorMock)
          await controller.saveValues(req, {}, nextSpy)
        })

        it('should call next with the error', function() {
          expect(nextSpy).to.be.calledWith(errorMock)
        })

        it('should call next once', function() {
          expect(nextSpy).to.be.calledOnce
        })

        it('should not set person response on form values', function() {
          expect(req.form.values).not.to.have.property('person')
        })
      })
    })

    describe('#successHandler()', function() {
      let req, res

      beforeEach(function() {
        req = {
          form: {
            values: {},
          },
          sessionModel: {
            get: sinon.stub(),
            reset: sinon.stub(),
          },
          journeyModel: {
            reset: sinon.stub(),
          },
        }
        res = {
          redirect: sinon.stub(),
        }

        sinon.stub(filters, 'formatDateWithDay').returnsArg(0)
      })

      context('by default', function() {
        beforeEach(function() {
          req.sessionModel.get.withArgs('move').returns(mockMove)
          controller.successHandler(req, res)
        })

        it('should reset the journey', function() {
          expect(req.journeyModel.reset).to.have.been.calledOnce
        })

        it('should reset the session', function() {
          expect(req.sessionModel.reset).to.have.been.calledOnce
        })

        it('should redirect correctly', function() {
          expect(res.redirect).to.have.been.calledOnce
          expect(res.redirect).to.have.been.calledWith(
            `/move/${mockMove.id}/confirmation`
          )
        })
      })
    })
  })
})