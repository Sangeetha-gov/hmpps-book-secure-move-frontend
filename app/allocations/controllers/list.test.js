const presenters = require('../../../common/presenters')

const controller = require('./list')

describe('the controller of the allocations outgoing list view', function() {
  let locals
  let render
  let req
  beforeEach(function() {
    render = sinon.stub()
    sinon.stub(presenters, 'allocationsToTable').returns({
      head: [],
      rows: [],
    })
    req = {
      t: sinon.stub().returnsArg(0),
      pagination: {
        next: '/next',
        prev: '/prev',
      },
    }
    locals = {
      allocations: [
        {
          id: '123',
        },
        {
          id: '124',
        },
      ],
    }
    controller(req, {
      locals,
      render,
    })
  })
  it('invokes the presenter with res.locals.allocations', function() {
    expect(presenters.allocationsToTable).to.have.been.calledOnceWithExactly([
      {
        id: '123',
      },
      {
        id: '124',
      },
    ])
  })
  it('renders the template', function() {
    expect(render).to.have.been.calledOnceWithExactly(
      'allocations/views/list',
      {
        pageTitle: 'allocations::dashboard.heading',
        pagination: {
          next: '/next',
          prev: '/prev',
        },
        head: [],
        rows: [],
      }
    )
  })
})
