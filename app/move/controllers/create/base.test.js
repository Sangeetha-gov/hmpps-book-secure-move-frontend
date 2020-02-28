const FormController = require('hmpo-form-wizard').Controller
const timezoneMock = require('timezone-mock')

const CreateBaseController = require('./base')

const controller = new CreateBaseController({ route: '/' })

describe('Move controllers', function() {
  describe('Create base controller', function() {
    describe('#middlewareChecks()', function() {
      beforeEach(function() {
        sinon.stub(FormController.prototype, 'middlewareChecks')
        sinon.stub(controller, 'use')

        controller.middlewareChecks()
      })

      it('should call parent method', function() {
        expect(FormController.prototype.middlewareChecks).to.have.been
          .calledOnce
      })

      it('should call check current location method', function() {
        expect(controller.use).to.have.been.calledWith(
          controller.checkCurrentLocation
        )
      })
    })

    describe('#middlewareLocals()', function() {
      beforeEach(function() {
        sinon.stub(FormController.prototype, 'middlewareLocals')
        sinon.stub(controller, 'use')

        controller.middlewareLocals()
      })

      it('should call parent method', function() {
        expect(FormController.prototype.middlewareLocals).to.have.been
          .calledOnce
      })

      it('should call set button text method', function() {
        expect(controller.use.getCall(0)).to.have.been.calledWithExactly(
          controller.setButtonText
        )
      })

      it('should call set cancel url method', function() {
        expect(controller.use.getCall(1)).to.have.been.calledWithExactly(
          controller.setCancelUrl
        )
      })

      it('should call set move summary method', function() {
        expect(controller.use.getCall(2)).to.have.been.calledWithExactly(
          controller.setMoveSummary
        )
      })

      it('should call set journey timer method', function() {
        expect(controller.use.getCall(3)).to.have.been.calledWithExactly(
          controller.setJourneyTimer
        )
      })

      it('should call correct number of middleware', function() {
        expect(controller.use).to.be.callCount(4)
      })
    })

    describe('#setButtonText()', function() {
      let req, nextSpy

      beforeEach(function() {
        nextSpy = sinon.spy()
        req = {
          form: {
            options: {
              steps: {
                '/': {},
                '/step-one': {},
                '/last-step': {},
              },
            },
          },
        }
        sinon.stub(FormController.prototype, 'getNextStep')
      })

      context('with buttonText option', function() {
        beforeEach(function() {
          req.form.options.buttonText = 'Override button text'
          FormController.prototype.getNextStep.returns('/')

          controller.setButtonText(req, {}, nextSpy)
        })

        it('should set cancel url correctly', function() {
          expect(req.form.options.buttonText).to.equal('Override button text')
        })

        it('should call next', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })

      context('with no buttonText option', function() {
        context('when step is not penultimate step', function() {
          beforeEach(function() {
            FormController.prototype.getNextStep.returns('/step-one')

            controller.setButtonText(req, {}, nextSpy)
          })

          it('should set cancel url correctly', function() {
            expect(req.form.options.buttonText).to.equal('actions::continue')
          })

          it('should call next', function() {
            expect(nextSpy).to.be.calledOnceWithExactly()
          })
        })

        context('when step is penultimate step', function() {
          beforeEach(function() {
            FormController.prototype.getNextStep.returns('/last-step')

            controller.setButtonText(req, {}, nextSpy)
          })

          it('should set cancel url correctly', function() {
            expect(req.form.options.buttonText).to.equal(
              'actions::schedule_move'
            )
          })

          it('should call next', function() {
            expect(nextSpy).to.be.calledOnceWithExactly()
          })
        })
      })
    })

    describe('#setCancelUrl()', function() {
      let res, nextSpy

      beforeEach(function() {
        nextSpy = sinon.spy()
        res = {
          locals: {},
        }
      })

      context('with no moves url local', function() {
        beforeEach(function() {
          controller.setCancelUrl({}, res, nextSpy)
        })

        it('should set cancel url correctly', function() {
          expect(res.locals).to.have.property('cancelUrl')
          expect(res.locals.cancelUrl).to.be.undefined
        })

        it('should call next', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })

      context('with moves url local', function() {
        beforeEach(function() {
          res.locals.MOVES_URL = '/moves?move-date=2019-10-10'
          controller.setCancelUrl({}, res, nextSpy)
        })

        it('should set cancel url moves url', function() {
          expect(res.locals).to.have.property('cancelUrl')
          expect(res.locals.cancelUrl).to.equal('/moves?move-date=2019-10-10')
        })

        it('should call next', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })
    })

    describe('#checkCurrentLocation()', function() {
      let req, nextSpy

      beforeEach(function() {
        nextSpy = sinon.spy()
        req = {
          session: {},
        }
      })

      context('when current location exists', function() {
        beforeEach(function() {
          req.session = {
            currentLocation: {},
          }
          controller.checkCurrentLocation(req, {}, nextSpy)
        })

        it('should call next without error', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })

      context('when no current location exists', function() {
        beforeEach(function() {
          controller.checkCurrentLocation(req, {}, nextSpy)
        })

        it('should call next with error', function() {
          expect(nextSpy).to.be.calledOnce
          expect(nextSpy.args[0][0]).to.be.an('error')
          expect(nextSpy.args[0][0].message).to.equal(
            'Current location is not set in session'
          )
          expect(nextSpy.args[0][0].code).to.equal('MISSING_LOCATION')
        })
      })
    })

    describe('#setMoveSummary()', function() {
      let req, res, nextSpy

      const mockPerson = {
        first_names: 'Mr',
        fullname: 'Benn, Mr',
        last_name: 'Benn',
      }
      const mockSessionModel = overrides => {
        const sessionModel = {
          date: '2019-06-09',
          time_due: '2000-01-01T14:00:00Z',
          move_type: 'court_appearance',
          to_location: {
            title: 'Mock to location',
          },
          additional_information: 'Additional information',
          person: mockPerson,
          ...overrides,
        }

        return {
          ...sessionModel,
          toJSON: () => sessionModel,
          get: () => sessionModel.person,
        }
      }
      const expectedMoveSummary = {
        items: [
          { key: { text: 'From' }, value: { text: 'Mock location' } },
          {
            key: { text: 'To' },
            value: { text: 'Mock to location — Additional information' },
          },
          { key: { text: 'Date' }, value: { text: 'Sunday 9 Jun 2019' } },
          { key: { text: 'Time due' }, value: { text: '2pm' } },
        ],
      }

      beforeEach(function() {
        timezoneMock.register('UTC')
        nextSpy = sinon.spy()
        req = {
          session: {
            currentLocation: {
              title: 'Mock location',
            },
          },
        }
        res = {
          locals: {},
        }
      })

      afterEach(function() {
        timezoneMock.unregister()
      })

      context('when current location exists', function() {
        beforeEach(async function() {
          req.sessionModel = mockSessionModel()

          await controller.setMoveSummary(req, res, nextSpy)
        })

        it('should set locals as expected', function() {
          expect(res.locals).to.deep.equal({
            person: mockPerson,
            moveSummary: expectedMoveSummary,
          })
        })

        it('should call next without error', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })

      context('without move_type', function() {
        beforeEach(async function() {
          req.sessionModel = mockSessionModel({
            move_type: '',
          })

          await controller.setMoveSummary(req, res, nextSpy)
        })

        it('should set locals as expected', function() {
          expect(res.locals).to.deep.equal({
            person: mockPerson,
            moveSummary: {},
          })
        })

        it('should call next without error', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })
    })

    describe('#setJourneyTimer()', function() {
      let req, nextSpy

      beforeEach(function() {
        this.clock = sinon.useFakeTimers(new Date('2017-08-10').getTime())
        req = {
          sessionModel: {
            get: sinon.stub(),
            set: sinon.stub(),
          },
        }
        nextSpy = sinon.spy()
      })

      context('with no timestamp in the session', function() {
        beforeEach(function() {
          req.sessionModel.get.withArgs('journeyTimestamp').returns(undefined)
          controller.setJourneyTimer(req, {}, nextSpy)
        })

        it('should set timestamp', function() {
          expect(req.sessionModel.set).to.be.calledOnceWithExactly(
            'journeyTimestamp',
            1502323200000
          )
        })

        it('should call next', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })

      context('with timestamp in the session', function() {
        const mockTimestamp = 11212121212

        beforeEach(function() {
          req.sessionModel.get
            .withArgs('journeyTimestamp')
            .returns(mockTimestamp)
          controller.setJourneyTimer(req, {}, nextSpy)
        })

        it('should not set timestamp', function() {
          expect(req.sessionModel.set).not.to.be.called
        })

        it('should call next', function() {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })
    })

    describe('#saveValues()', function() {
      let req, nextSpy
      const currentLocationMock = {
        id: '12345',
        location_type: 'police',
        can_upload_documents: true,
      }

      beforeEach(function() {
        sinon.stub(FormController.prototype, 'saveValues')
        req = {
          form: {
            values: {},
          },
          session: {
            currentLocation: currentLocationMock,
          },
        }
        nextSpy = sinon.spy()
        controller.saveValues(req, {}, nextSpy)
      })

      it('should set current location ID', function() {
        expect(req.form.values.from_location).to.equal(currentLocationMock.id)
      })

      it('should set from location type', function() {
        expect(req.form.values.from_location_type).to.equal(
          currentLocationMock.location_type
        )
      })

      it('should set can upload documents values', function() {
        expect(req.form.values.can_upload_documents).to.equal(
          currentLocationMock.can_upload_documents
        )
      })

      it('should call parent method', function() {
        expect(FormController.prototype.saveValues).to.be.calledOnceWithExactly(
          req,
          {},
          nextSpy
        )
      })
    })
  })
})
