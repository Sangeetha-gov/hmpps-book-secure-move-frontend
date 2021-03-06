const allocationService = require('../../common/services/allocation')
const moveService = require('../../common/services/move')

const middleware = require('./middleware')

const moveStub = { foo: 'bar' }
const moveWithAllocationStub = {
  foo: 'bar',
  allocation: { id: '#allocationId', fizz: 'buzz' },
}
const allocationStub = { fizz: 'buzz' }
const mockMoveId = '6904dea1-017f-48d8-a5ad-2723dee9d146'
const errorStub = new Error('Problem')

describe('Move middleware', function () {
  describe('#setMove()', function () {
    let req, res, nextSpy

    beforeEach(function () {
      req = {}
      res = {}
      nextSpy = sinon.spy()
    })

    context('when no move ID exists', function () {
      beforeEach(async function () {
        sinon.stub(moveService, 'getById').resolves(moveStub)

        await middleware.setMove(req, res, nextSpy)
      })

      it('should call next with no argument', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })

      it('should not call API with move ID', function () {
        expect(moveService.getById).not.to.be.called
      })

      it('should not set response data to request object', function () {
        expect(req).not.to.have.property('move')
      })
    })

    context('when move ID exists', function () {
      context('when API call returns succesfully', function () {
        beforeEach(async function () {
          sinon.stub(moveService, 'getById').resolves(moveStub)

          await middleware.setMove(req, res, nextSpy, mockMoveId)
        })

        it('should call API with move ID', function () {
          expect(moveService.getById).to.be.calledWith(mockMoveId)
        })

        it('should set response data to request object', function () {
          expect(req).to.have.property('move')
          expect(req.move).to.equal(moveStub)
        })

        it('should call next with no argument', function () {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })

      context('when API call returns an error', function () {
        beforeEach(async function () {
          sinon.stub(moveService, 'getById').throws(errorStub)

          await middleware.setMove({}, res, nextSpy, mockMoveId)
        })

        it('should not set response data to request object', function () {
          expect(req).not.to.have.property('move')
        })

        it('should send error to next function', function () {
          expect(nextSpy).to.be.calledOnceWithExactly(errorStub)
        })
      })
    })
  })

  describe('#setPersonEscortRecord()', function () {
    let mockReq, nextSpy

    beforeEach(function () {
      nextSpy = sinon.spy()
      mockReq = {}
    })

    context('without Person Escort Record', function () {
      beforeEach(function () {
        middleware.setPersonEscortRecord(mockReq, {}, nextSpy)
      })

      it('should not set request property', function () {
        expect(mockReq).not.to.contain.property('personEscortRecord')
      })

      it('should call next', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })
    })

    context('with Person Escort Record', function () {
      beforeEach(function () {
        mockReq = {
          move: {
            profile: {
              person_escort_record: {
                id: '12345',
              },
            },
          },
        }
        middleware.setPersonEscortRecord(mockReq, {}, nextSpy)
      })

      it('should set request property', function () {
        expect(mockReq).to.contain.property('personEscortRecord')
        expect(mockReq.personEscortRecord).to.deep.equal({
          id: '12345',
        })
      })

      it('should call next', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })
    })
  })

  describe('#setAllocation()', function () {
    let req, res, nextSpy

    beforeEach(function () {
      sinon.stub(allocationService, 'getById')

      req = {}
      res = {}
      nextSpy = sinon.spy()
    })

    context('when no move exists', function () {
      beforeEach(async function () {
        await middleware.setAllocation(req, res, nextSpy)
      })

      it('should call next with no argument', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })

      it('should not call service', function () {
        expect(allocationService.getById).not.to.be.called
      })

      it('should not set response data on request object', function () {
        expect(req).not.to.have.property('allocation')
      })
    })

    context('when move exists', function () {
      beforeEach(function () {
        req.move = moveStub
      })

      context('when move does not contain allocation', function () {
        beforeEach(async function () {
          await middleware.setAllocation({}, res, nextSpy)
        })

        it('should call next with no argument', function () {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })

        it('should not call service', function () {
          expect(allocationService.getById).not.to.be.called
        })

        it('should not set response data on request object', function () {
          expect(req).not.to.have.property('allocation')
        })
      })

      context('when move contains allocation', function () {
        beforeEach(function () {
          req.move = moveWithAllocationStub
        })

        context('when API call returns succesfully', function () {
          beforeEach(async function () {
            allocationService.getById.resolves(allocationStub)
            await middleware.setAllocation(req, res, nextSpy)
          })

          it('should call API with allocation ID', function () {
            expect(allocationService.getById).to.be.calledOnceWithExactly(
              '#allocationId'
            )
          })

          it('should set response data to locals object', function () {
            expect(req).to.have.property('allocation')
            expect(req.allocation).to.equal(allocationStub)
          })

          it('should call next with no argument', function () {
            expect(nextSpy).to.be.calledOnceWithExactly()
          })
        })

        context('when API call returns an error', function () {
          beforeEach(async function () {
            allocationService.getById.throws(errorStub)
            await middleware.setAllocation(req, res, nextSpy)
          })

          it('should not set response data on request object', function () {
            expect(req).not.to.have.property('allocation')
          })

          it('should send error to next function', function () {
            expect(nextSpy).to.be.calledOnceWithExactly(errorStub)
          })
        })
      })
    })
  })
})
