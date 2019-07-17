const middleware = require('./development')

describe('Development specific middleware', function () {
  let nextSpy

  beforeEach(function () {
    nextSpy = sinon.spy()
  })

  describe('#bypassAuth()', function () {
    let req

    beforeEach(function () {
      req = {
        session: {},
      }
    })

    context('when should not bypass', function () {
      beforeEach(function () {
        middleware.bypassAuth(false)(req, {}, nextSpy)
      })

      it('should not set auth expiry', function () {
        expect(req.session).not.to.have.property('authExpiry')
      })

      it('should call next', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })
    })

    context('when should bypass', function () {
      beforeEach(function () {
        this.clock = sinon.useFakeTimers(new Date('2017-08-10').getTime())

        middleware.bypassAuth(true)(req, {}, nextSpy)
      })

      afterEach(function () {
        this.clock.restore()
      })

      it('should not set auth expiry 30 days in future', function () {
        expect(req.session).to.have.property('authExpiry')
        expect(req.session.authExpiry).to.equal(1504915200)
      })

      it('should call next', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })
    })
  })

  describe('#setUserPermissions()', function () {
    let req

    beforeEach(function () {
      req = {
        session: {
          user: {
            permissions: [],
          },
        },
      }
    })

    context('with permissions', function () {
      beforeEach(function () {
        middleware.setUserPermissions('one,two,three')(req, {}, nextSpy)
      })

      it('should update permissions', function () {
        expect(req.session.user.permissions).to.deep.equal([
          'one',
          'two',
          'three',
        ])
      })

      it('should call next', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })
    })

    context('without permissions', function () {
      beforeEach(function () {
        middleware.setUserPermissions()(req, {}, nextSpy)
      })

      it('should not update permissions', function () {
        expect(req.session.user.permissions).to.deep.equal([])
      })

      it('should call next', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })
    })

    context('when no user exists', function () {
      beforeEach(function () {
        req.session = {}
        middleware.setUserPermissions('one,two,three')(req, {}, nextSpy)
      })

      it('should create a user', function () {
        expect(req.session).to.have.property('user')
      })

      it('should set permissions', function () {
        expect(req.session.user.permissions).to.deep.equal([
          'one',
          'two',
          'three',
        ])
      })

      it('should call next', function () {
        expect(nextSpy).to.be.calledOnceWithExactly()
      })
    })
  })
})
