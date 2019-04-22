const index = require('./get.controller')

describe('Index app', function () {
  describe('#getController()', function () {
    it('should render a template', function () {
      const req = {}
      const res = {
        render: sinon.spy(),
      }

      index(req, res)

      expect(res.render.calledOnce).to.be.true
    })
  })
})
