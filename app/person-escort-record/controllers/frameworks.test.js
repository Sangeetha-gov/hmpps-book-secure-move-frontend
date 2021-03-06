const FormWizardController = require('../../../common/controllers/form-wizard')
const fieldHelpers = require('../../../common/helpers/field')
const frameworksHelpers = require('../../../common/helpers/frameworks')
const responseService = require('../../../common/services/framework-response')

const Controller = require('./frameworks')

const controller = new Controller({ route: '/' })

describe('Person Escort Record controllers', function () {
  describe('FrameworksController', function () {
    describe('#middlewareSetup()', function () {
      beforeEach(function () {
        sinon.stub(FormWizardController.prototype, 'middlewareSetup')
        sinon.stub(controller, 'use')

        controller.middlewareSetup()
      })

      it('should call parent method', function () {
        expect(FormWizardController.prototype.middlewareSetup).to.have.been
          .calledOnce
      })

      it('should call set models method', function () {
        expect(controller.use.getCall(0)).to.have.been.calledWithExactly(
          controller.setButtonText
        )
      })

      it('should call correct number of middleware', function () {
        expect(controller.use).to.be.callCount(1)
      })
    })

    describe('#setButtonText', function () {
      let mockReq, nextSpy

      beforeEach(function () {
        nextSpy = sinon.spy()
        mockReq = {
          form: {
            options: {},
          },
        }
      })

      context('by default', function () {
        beforeEach(function () {
          controller.setButtonText(mockReq, {}, nextSpy)
        })

        it('should use save and continue button text', function () {
          expect(mockReq.form.options.buttonText).to.equal(
            'actions::save_and_continue'
          )
        })

        it('should call next without error', function () {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })

      context('with interruption card step type', function () {
        beforeEach(function () {
          mockReq.form.options.stepType = 'interruption-card'
          controller.setButtonText(mockReq, {}, nextSpy)
        })

        it('should use continue button text', function () {
          expect(mockReq.form.options.buttonText).to.equal('actions::continue')
        })

        it('should call next without error', function () {
          expect(nextSpy).to.be.calledOnceWithExactly()
        })
      })
    })

    describe('#reduceResponses', function () {
      let response

      context('with `object` value type', function () {
        beforeEach(function () {
          response = controller.reduceResponses(
            {},
            {
              value: {
                option: 'Yes, I do',
                details: 'Lorem ipsum',
              },
              value_type: 'object',
              question: {
                key: 'object-response',
              },
            }
          )
        })

        it('should set field for option', function () {
          expect(response).to.have.property('object-response')
          expect(response['object-response']).to.equal('Yes, I do')
        })

        it('should set field for details', function () {
          expect(response).to.have.property('object-response--yes-i-do')
          expect(response['object-response--yes-i-do']).to.equal('Lorem ipsum')
        })

        it('should set correct amount of keys', function () {
          expect(Object.keys(response)).to.have.length(2)
        })
      })

      context('with `collection` value type', function () {
        beforeEach(function () {
          response = controller.reduceResponses(
            {},
            {
              value: [
                {
                  option: 'Check item one',
                  details: 'Lorem ipsum',
                },
                {
                  option: 'Check item two',
                  details: 'Lorem ipsum',
                },
              ],
              value_type: 'collection',
              question: {
                key: 'collection-response',
              },
            }
          )
        })

        it('should set field containing all options', function () {
          expect(response).to.have.property('collection-response')
          expect(response['collection-response']).to.deep.equal([
            'Check item one',
            'Check item two',
          ])
        })

        it('should set field for first option details', function () {
          const key = 'collection-response--check-item-one'
          expect(response).to.have.property(key)
          expect(response[key]).to.equal('Lorem ipsum')
        })

        it('should set field for second option details', function () {
          const key = 'collection-response--check-item-one'
          expect(response).to.have.property(key)
          expect(response[key]).to.equal('Lorem ipsum')
        })

        it('should set correct amount of keys', function () {
          expect(Object.keys(response)).to.have.length(3)
        })
      })

      context('with `string` value type', function () {
        beforeEach(function () {
          response = controller.reduceResponses(
            {},
            {
              value: 'Lorem ipsum',
              value_type: 'string',
              question: {
                key: 'string-response',
              },
            }
          )
        })

        it('should set string as value', function () {
          expect(response).to.have.property('string-response')
          expect(response['string-response']).to.equal('Lorem ipsum')
        })

        it('should set correct amount of keys', function () {
          expect(Object.keys(response)).to.have.length(1)
        })
      })

      context('with `array` value type', function () {
        beforeEach(function () {
          response = controller.reduceResponses(
            {},
            {
              value: ['Item one', 'Item two'],
              value_type: 'array',
              question: {
                key: 'array-response',
              },
            }
          )
        })

        it('should set array as value', function () {
          expect(response).to.have.property('array-response')
          expect(response['array-response']).to.deep.equal([
            'Item one',
            'Item two',
          ])
        })

        it('should set correct amount of keys', function () {
          expect(Object.keys(response)).to.have.length(1)
        })
      })

      context('with any other value type', function () {
        beforeEach(function () {
          response = controller.reduceResponses(
            {},
            {
              value: {
                option: 'Yes, I do',
                details: 'Lorem ipsum',
              },
              value_type: 'unknown',
              question: {
                key: 'unknown-response',
              },
            }
          )
        })

        it('should not set field', function () {
          expect(response).not.to.have.property('unknown-response')
        })

        it('should set correct amount of keys', function () {
          expect(Object.keys(response)).to.have.length(0)
        })
      })
    })

    describe('#getValues', function () {
      let callback
      const mockReq = {
        form: {
          options: {
            fields: {},
          },
        },
        personEscortRecord: {
          responses: [],
        },
      }

      beforeEach(function () {
        callback = sinon.spy()
        sinon
          .stub(Controller.prototype, 'reduceResponses')
          .callsFake((acc, { value, question }) => {
            acc[question.key] = value
            return acc
          })
        sinon
          .stub(FormWizardController.prototype, 'getValues')
          .callsFake((req, res, valuesCallback) => {
            valuesCallback(null, {
              foo: 'bar',
            })
          })
      })

      context('when parent method does not throw an error', function () {
        context('with no responses', function () {
          beforeEach(function () {
            controller.getValues(mockReq, {}, callback)
          })

          it('should invoke the callback', function () {
            expect(callback).to.be.calledOnceWithExactly(null, {
              foo: 'bar',
            })
          })
        })

        context('with responses', function () {
          beforeEach(function () {
            mockReq.form.options.fields = {
              'field-one': {},
              'field-two': {},
            }
            mockReq.personEscortRecord.responses = [
              { id: '1', value: 'Yes', question: { key: 'field-one' } },
              { id: '2', value: 'No', question: { key: 'field-two' } },
            ]
            controller.getValues(mockReq, {}, callback)
          })

          it('should call the reducer', function () {
            expect(Controller.prototype.reduceResponses).to.be.calledTwice
          })

          it('should invoke the callback', function () {
            expect(callback).to.be.calledOnceWithExactly(null, {
              foo: 'bar',
              'field-one': 'Yes',
              'field-two': 'No',
            })
          })
        })

        context('filtering', function () {
          context('when fields are not present', function () {
            beforeEach(function () {
              mockReq.form.options.fields = {}
              mockReq.personEscortRecord.responses = [
                { id: '1', value: 'Yes', question: { key: 'field-one' } },
                { id: '2', value: 'No', question: { key: 'field-two' } },
              ]
              controller.getValues(mockReq, {}, callback)
            })

            it('should not call the reducer', function () {
              expect(Controller.prototype.reduceResponses).not.to.be.called
            })

            it('should filter out responses', function () {
              expect(callback).to.be.calledOnceWithExactly(null, {
                foo: 'bar',
              })
            })
          })

          context('when response has no value', function () {
            beforeEach(function () {
              mockReq.form.options.fields = {
                'field-one': {},
                'field-two': {},
                'field-three': {},
              }
              mockReq.personEscortRecord.responses = [
                { id: '1', question: { key: 'field-one' } },
                { id: '2', value: null, question: { key: 'field-two' } },
                { id: '3', value: undefined, question: { key: 'field-three' } },
              ]
              controller.getValues(mockReq, {}, callback)
            })

            it('should not call the reducer', function () {
              expect(Controller.prototype.reduceResponses).not.to.be.called
            })

            it('should filter out responses', function () {
              expect(callback).to.be.calledOnceWithExactly(null, {
                foo: 'bar',
              })
            })
          })

          context('when response has no question', function () {
            beforeEach(function () {
              mockReq.form.options.fields = {
                'field-one': {},
                'field-two': {},
              }
              mockReq.personEscortRecord.responses = [
                { id: '1', value: 'Yes' },
                { id: '2', value: 'No' },
              ]
              controller.getValues(mockReq, {}, callback)
            })

            it('should not call the reducer', function () {
              expect(Controller.prototype.reduceResponses).not.to.be.called
            })

            it('should filter out responses', function () {
              expect(callback).to.be.calledOnceWithExactly(null, {
                foo: 'bar',
              })
            })
          })
        })

        context('existing values', function () {
          beforeEach(function () {
            mockReq.form.options.fields = {
              foo: {},
            }
            mockReq.personEscortRecord.responses = [
              { id: '1', value: 'Saved value', question: { key: 'foo' } },
            ]
            controller.getValues(mockReq, {}, callback)
          })

          it('should call the reducer', function () {
            expect(Controller.prototype.reduceResponses).to.be.calledOnce
          })

          it('should not override values from parent controller', function () {
            expect(callback).to.be.calledOnceWithExactly(null, {
              foo: 'bar',
            })
          })
        })
      })

      context('when parent method throws an error', function () {
        const mockError = new Error()

        beforeEach(function () {
          FormWizardController.prototype.getValues.callsFake(
            (req, res, valuesCallback) => {
              valuesCallback(mockError, {
                foo: 'bar',
              })
            }
          )
          controller.getValues(mockReq, {}, callback)
        })

        it('should invoke the callback with the error', function () {
          expect(callback).to.be.calledOnceWithExactly(mockError)
        })
      })
    })

    describe('#successHandler', function () {
      let mockReq, mockRes, nextSpy

      beforeEach(function () {
        mockReq = {
          body: {},
          baseUrl: '/base-url',
          form: {
            options: {
              steps: {
                '/': {},
                '/one': {},
                '/continued': {},
                '/two': {},
                '/two-continued': {},
                '/overview-step': {},
              },
            },
          },
        }
        mockRes = {
          redirect: sinon.stub(),
        }
        nextSpy = sinon.stub()

        sinon.stub(FormWizardController.prototype, 'successHandler')
        sinon.stub(FormWizardController.prototype, 'getNextStep').returns('/')
      })

      context('with save and return submission', function () {
        beforeEach(function () {
          mockReq.body = {
            save_and_return_to_overview: '1',
          }
          controller.successHandler(mockReq, mockRes, nextSpy)
        })

        it('should redirect to base URL with last step path', function () {
          expect(mockRes.redirect).to.have.been.calledOnceWithExactly(
            '/base-url/overview-step'
          )
        })

        it('should not call parent success handler', function () {
          expect(
            FormWizardController.prototype.successHandler
          ).not.to.have.been.called
        })
      })

      context('with standard submission', function () {
        context('with last framework step', function () {
          beforeEach(function () {
            mockReq.form.options.route = '/two-continued'
            FormWizardController.prototype.getNextStep.returns(
              '/full/path/to/step/two-continued'
            )
            controller.successHandler(mockReq, mockRes, nextSpy)
          })

          it('should redirect to base URL with last step path', function () {
            expect(mockRes.redirect).to.have.been.calledOnceWithExactly(
              '/base-url/overview-step'
            )
          })

          it('should not call parent success handler', function () {
            expect(
              FormWizardController.prototype.successHandler
            ).not.to.have.been.called
          })
        })

        context('with framework step that contains last step', function () {
          beforeEach(function () {
            mockReq.form.options.route = '/two'
            FormWizardController.prototype.getNextStep.returns(
              '/full/path/to/step/two-continued'
            )
            controller.successHandler(mockReq, mockRes, nextSpy)
          })

          it('should not redirect to base URL', function () {
            expect(mockRes.redirect).not.to.have.been.called
          })

          it('should call parent success handler', function () {
            expect(
              FormWizardController.prototype.successHandler
            ).to.have.been.calledOnce
          })
        })

        context(
          'with framework step that contains same end as last step',
          function () {
            beforeEach(function () {
              mockReq.form.options.route = '/continued'
              FormWizardController.prototype.getNextStep.returns(
                '/full/path/to/step/two-continued'
              )
              controller.successHandler(mockReq, mockRes, nextSpy)
            })

            it('should not redirect to base URL', function () {
              expect(mockRes.redirect).not.to.have.been.called
            })

            it('should call parent success handler', function () {
              expect(FormWizardController.prototype.successHandler).to.have.been
                .calledOnce
            })
          }
        )

        context('with all other steps', function () {
          beforeEach(function () {
            FormWizardController.prototype.getNextStep.returns('/two')
            controller.successHandler(mockReq, mockRes, nextSpy)
          })

          it('should not redirect to base URL', function () {
            expect(mockRes.redirect).not.to.have.been.called
          })

          it('should call parent success handler', function () {
            expect(
              FormWizardController.prototype.successHandler
            ).to.have.been.calledOnce
          })
        })
      })
    })

    describe('#saveValues', function () {
      const mockResponses = [
        { id: '1', value: 'Yes' },
        { id: '2', value: 'No' },
        { id: '3', value: 'Yes' },
        { id: '4', value: 'No' },
      ]
      const mockReq = {
        form: {
          options: {
            fields: {
              one: { name: 'one' },
              two: { name: 'two' },
              three: { name: 'three' },
            },
          },
          values: {
            foo: 'bar',
            fizz: 'buzz',
          },
        },
        personEscortRecord: {
          responses: mockResponses,
        },
      }
      let nextSpy

      beforeEach(function () {
        sinon.stub(responseService, 'update')
        sinon.stub(fieldHelpers, 'isAllowedDependent').returns(true)
        sinon
          .stub(frameworksHelpers, 'responsesToSaveReducer')
          .returns((acc, value) => {
            acc.push(value)
            return acc
          })
        sinon.stub(FormWizardController.prototype, 'saveValues')
        nextSpy = sinon.spy()
      })

      context('when promises resolve', function () {
        beforeEach(async function () {
          responseService.update.resolves({})

          await controller.saveValues(mockReq, {}, nextSpy)
        })

        it('should call reducer correctly', function () {
          expect(
            frameworksHelpers.responsesToSaveReducer
          ).to.be.calledOnceWithExactly(mockReq.form.values)
        })

        it('should call correct number of updates', function () {
          expect(responseService.update.callCount).to.equal(
            mockResponses.length
          )
        })

        it('should update each response correct', function () {
          mockResponses.forEach((response, i) => {
            expect(responseService.update.getCall(i)).to.be.calledWithExactly(
              mockResponses[i]
            )
          })
        })

        it('should call the super method', function () {
          expect(
            FormWizardController.prototype.saveValues
          ).to.be.calledOnceWithExactly(mockReq, {}, nextSpy)
        })

        it('should not call next', function () {
          expect(nextSpy).to.not.be.called
        })
      })

      context('when service rejects with error', function () {
        const error = new Error()

        beforeEach(async function () {
          responseService.update.rejects(error)

          await controller.saveValues(mockReq, {}, nextSpy)
        })

        it('should not call the super method', function () {
          expect(FormWizardController.prototype.saveValues).to.not.be.called
        })

        it('should call next with the error', function () {
          expect(nextSpy).to.be.calledOnceWithExactly(error)
        })
      })

      describe('dependent field filtering', function () {
        const mockResponsesWithDependents = [
          {
            id: '1',
            value: 'Yes',
            question: {
              key: 'question-1',
            },
          },
          {
            id: '2',
            value: 'No',
            question: {
              key: 'question-2',
            },
          },
          {
            id: '3',
            value: 'Yes',
            question: {
              key: 'question-3',
            },
          },
          {
            id: '4',
            value: 'No',
            question: {
              key: 'question-4',
            },
          },
        ]

        beforeEach(async function () {
          mockReq.personEscortRecord.responses = mockResponsesWithDependents
          responseService.update.resolves({})

          fieldHelpers.isAllowedDependent
            .withArgs(
              mockReq.form.options.fields,
              'question-2',
              mockReq.form.values
            )
            .returns(false)
            .withArgs(
              mockReq.form.options.fields,
              'question-4',
              mockReq.form.values
            )
            .returns(false)

          await controller.saveValues(mockReq, {}, nextSpy)
        })

        it('should call isAllowedDependent filter on responses', function () {
          expect(fieldHelpers.isAllowedDependent.callCount).to.equal(
            mockResponsesWithDependents.length
          )
        })

        it('should call isAllowedDependent filter correctly', function () {
          mockResponsesWithDependents.forEach(response => {
            expect(fieldHelpers.isAllowedDependent).to.be.calledWithExactly(
              mockReq.form.options.fields,
              response?.question?.key,
              mockReq.form.values
            )
          })
        })

        it('should save correct number of responses', function () {
          expect(responseService.update.callCount).to.equal(2)
        })

        it('should filter out dependent fields', function () {
          expect(responseService.update).to.be.calledWithExactly(
            mockResponsesWithDependents[0]
          )
          expect(responseService.update).to.be.calledWithExactly(
            mockResponsesWithDependents[2]
          )
        })
      })
    })
  })
})
