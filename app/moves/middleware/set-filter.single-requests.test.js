const presenters = require('../../../common/presenters')
const singleRequestService = require('../../../common/services/single-request')

const middleware = require('./set-filter.single-requests')

describe('Moves middleware', function() {
  describe('#setfilterSingleRequests()', function() {
    let next
    let req
    let res

    context('when service resolves', function() {
      const mockDateRange = ['2010-09-03', '2010-09-10']
      const mockLocationId = '123'

      beforeEach(async function() {
        sinon.stub(singleRequestService, 'getAll').resolves(4)
        sinon.stub(presenters, 'moveTypesToFilterComponent').returnsArg(0)
        next = sinon.spy()
        req = {
          baseUrl: '/moves',
          url: '/moves/week/2010-09-07/123/pending',
          params: {
            locationId: mockLocationId,
            date: '2010-09-07',
            period: 'week',
            status: 'pending',
          },
        }
        res = {
          locals: {
            dateRange: mockDateRange,
          },
        }
        await middleware(req, res, next)
      })

      it('sets req.filter', function() {
        expect(req.filter).to.deep.equal([
          {
            active: true,
            status: 'pending',
            label: 'statuses::pending',
            href: '/moves/week/2010-09-07/123/pending',
            value: 4,
          },
          {
            active: false,
            status: 'approved',
            label: 'statuses::approved',
            href: '/moves/week/2010-09-07/123/approved',
            value: 4,
          },
          {
            active: false,
            status: 'rejected',
            label: 'statuses::rejected',
            href: '/moves/week/2010-09-07/123/rejected',
            value: 4,
          },
        ])
      })

      it('calls the servive with correct arguments', async function() {
        expect(singleRequestService.getAll).to.have.been.calledWithExactly({
          isAggregation: true,
          status: 'pending',
          createdAtDate: mockDateRange,
          fromLocationId: mockLocationId,
        })
        expect(singleRequestService.getAll).to.have.been.calledWithExactly({
          isAggregation: true,
          status: 'approved',
          createdAtDate: mockDateRange,
          fromLocationId: mockLocationId,
        })
        expect(singleRequestService.getAll).to.have.been.calledWithExactly({
          isAggregation: true,
          status: 'rejected',
          createdAtDate: mockDateRange,
          fromLocationId: mockLocationId,
        })
      })

      it('calls the service on each item', async function() {
        expect(singleRequestService.getAll.callCount).to.equal(3)
      })

      it('calls the presenter on each element', async function() {
        expect(presenters.moveTypesToFilterComponent).to.have.been.calledThrice
      })

      it('calls next', function() {
        expect(next).to.have.been.calledWithExactly()
      })
    })

    context('when service fails', function() {
      const mockError = new Error('Error!')

      beforeEach(async function() {
        sinon.stub(singleRequestService, 'getAll').rejects(mockError)
        next = sinon.spy()
        req = {
          params: {},
        }
        res = {
          locals: {},
        }

        await middleware(req, res, next)
      })

      it('calls next with error', function() {
        expect(next).to.have.been.calledOnceWithExactly(mockError)
      })
    })
  })
})