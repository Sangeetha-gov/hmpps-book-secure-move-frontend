const middleware = require('./set-body.allocations')

describe('Allocations middleware', function() {
  describe('#setBodyAllocations()', function() {
    let mockRes, mockReq, nextSpy

    beforeEach(function() {
      nextSpy = sinon.spy()
      mockRes = {}
      mockReq = {
        params: {
          dateRange: ['2020-10-10', '2020-10-10'],
          locationId: '7ebc8717-ff5b-4be0-8515-3e308e92700f',
        },
        query: {
          status: 'pending',
        },
      }

      middleware(mockReq, mockRes, nextSpy)
    })

    it('should assign req.body correctly', function() {
      expect(mockReq.body.allocations).to.deep.equal({
        status: 'pending',
        moveDate: ['2020-10-10', '2020-10-10'],
        fromLocationId: '7ebc8717-ff5b-4be0-8515-3e308e92700f',
      })
    })

    it('should call next', function() {
      expect(nextSpy).to.be.calledOnceWithExactly()
    })
  })
})