const referenceDataService = require('../../../../common/services/reference-data')
const fieldHelpers = require('../../../../common/helpers/field')

const BaseController = require('./base')
const Controller = require('./assessment')
const controller = new Controller({ route: '/' })

describe('Move controllers', function() {
  describe('Assessment controller', function() {
    describe('#configure()', function() {
      let nextSpy
      let req

      beforeEach(function() {
        sinon.stub(BaseController.prototype, 'configure')
        sinon.stub(referenceDataService, 'getAssessmentQuestions')
        sinon.stub(fieldHelpers, 'populateAssessmentFields')
        nextSpy = sinon.spy()
      })

      context('when getAssessmentQuestions resolves', function() {
        const mockQuestionsResponse = [
          {
            id: 'af8cfc67-757c-4019-9d5e-618017de1617',
            type: 'assessment_questions',
            key: 'violent',
            category: 'risk',
            title: 'Violent',
            disabled_at: null,
          },
          {
            id: 'f2db9a8f-a5a9-40cf-875b-d1f5f62b2497',
            type: 'assessment_questions',
            key: 'escape',
            category: 'risk',
            title: 'Escape',
            disabled_at: null,
          },
        ]
        const mockPopulateAssessmentFieldsResponse = {
          foo: 'bar',
        }
        const mockFields = {
          first_names: {
            name: 'first_names',
          },
          violent: {
            skip: true,
            rows: 3,
            component: 'govukTextarea',
            classes: 'govuk-input--width-20',
            label: {
              text: 'fields::assessment_comment.required',
              classes: 'govuk-label--s',
            },
            validate: 'required',
            explicit: true,
          },
        }

        beforeEach(async function() {
          fieldHelpers.populateAssessmentFields.returns(
            mockPopulateAssessmentFieldsResponse
          )
          referenceDataService.getAssessmentQuestions.resolves(
            mockQuestionsResponse
          )
          req = {
            form: {
              options: {
                assessmentCategory: 'risk',
                fields: mockFields,
              },
            },
          }

          await controller.configure(req, {}, nextSpy)
        })

        it('invokes getAssessmentQuestions', function() {
          expect(
            referenceDataService.getAssessmentQuestions
          ).to.be.calledOnceWithExactly('risk')
        })

        it('should call populateAssessmentFields', function() {
          expect(
            fieldHelpers.populateAssessmentFields
          ).to.be.calledOnceWithExactly(mockFields, mockQuestionsResponse)
        })

        it('should set fields to populateAssessmentFields reponse', function() {
          expect(req.form.options.fields).to.deep.equal(
            mockPopulateAssessmentFieldsResponse
          )
        })

        it('should set questions on request', function() {
          expect(req.questions).to.deep.equal(mockQuestionsResponse)
        })

        it('should call parent configure method', function() {
          expect(
            BaseController.prototype.configure
          ).to.be.calledOnceWithExactly(req, {}, nextSpy)
        })
      })

      context('when getAssessmentQuestions returns an error', function() {
        const errorMock = new Error('Problem')
        const req = {
          form: {
            options: {
              fields: {
                risk: {
                  name: 'risk',
                  items: [],
                },
              },
            },
          },
        }

        beforeEach(async function() {
          referenceDataService.getAssessmentQuestions.throws(errorMock)

          await controller.configure(req, {}, nextSpy)
        })

        it('should call next with the error', function() {
          expect(nextSpy).to.be.calledWith(errorMock)
        })

        it('should call next once', function() {
          expect(nextSpy).to.be.calledOnce
        })

        it('should not mutate request object', function() {
          expect(req).to.deep.equal(req)
        })

        it('should not call parent configure method', function() {
          expect(BaseController.prototype.configure).not.to.be.called
        })
      })
    })

    describe('#saveValues()', function() {
      let nextSpy
      const mockFields = {
        risk: {
          multiple: true,
          items: [
            {
              key: 'violent',
              text: 'Violent',
              value: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
            },
            {
              key: 'escape',
              text: 'Escape',
              value: '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
            },
            {
              key: 'self',
              text: 'Self',
              value: '534b05af-8b55-4a37-9f36-d36a60f04aa8',
            },
          ],
        },
      }

      beforeEach(function() {
        sinon.stub(BaseController.prototype, 'saveValues')
        nextSpy = sinon.spy()
      })

      context('with no previous session values', function() {
        let req

        beforeEach(function() {
          req = {
            questions: [
              {
                id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
                type: 'assessment_questions',
                key: 'violent',
                category: 'risk',
                title: 'Violent',
              },
            ],
            form: {
              options: {
                fields: mockFields,
                assessmentCategory: 'risk',
              },
              values: {
                risk: ['a1f6a3b5-a448-4a78-8cf7-6659a71661c2'],
                violent: 'Additional comments',
              },
            },
            sessionModel: {
              get: sinon.stub().returns(),
              set: sinon.spy(),
              unset: sinon.spy(),
            },
          }

          controller.saveValues(req, {}, nextSpy)
        })

        it('should save values on assessment property', function() {
          expect(req.form.values.assessment).to.deep.equal({
            risk: [
              {
                comments: 'Additional comments',
                assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
              },
            ],
          })
        })

        it('should flatten values on assessment_answers property', function() {
          expect(req.form.values.person.assessment_answers).to.deep.equal([
            {
              comments: 'Additional comments',
              assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
            },
          ])
        })

        it('should call parent configure method', function() {
          expect(
            BaseController.prototype.saveValues
          ).to.be.calledOnceWithExactly(req, {}, nextSpy)
        })
      })

      context('with previous session values', function() {
        let req, sessionGetStub

        beforeEach(function() {
          sessionGetStub = sinon.stub()
          req = {
            questions: [
              {
                id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
                type: 'assessment_questions',
                key: 'violent',
                category: 'risk',
                title: 'Violent',
              },
            ],
            form: {
              options: {
                assessmentCategory: 'risk',
                fields: mockFields,
              },
              values: {
                risk: ['a1f6a3b5-a448-4a78-8cf7-6659a71661c2'],
                violent: 'Additional comments',
              },
            },
            sessionModel: {
              get: sessionGetStub,
              set: sinon.spy(),
              unset: sinon.spy(),
            },
          }

          sessionGetStub.withArgs('person').returns({
            first_names: 'Steve',
            last_name: 'Smith',
          })
          sessionGetStub.withArgs('assessment').returns({
            risk: [
              {
                comments: '',
                assessment_question_id: '534b05af-8b55-4a37-9f36-d36a60f04aa8',
              },
            ],
            health: [
              {
                comments: '',
                assessment_question_id: '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
              },
            ],
          })

          controller.saveValues(req, {}, nextSpy)
        })

        it('should overwrite values for current field', function() {
          expect(req.form.values.assessment.risk).to.deep.equal([
            {
              comments: 'Additional comments',
              assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
            },
          ])
        })

        it('should not mutate other assessment fields', function() {
          expect(req.form.values.assessment.health).to.deep.equal([
            {
              comments: '',
              assessment_question_id: '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
            },
          ])
        })

        it('should flatten values on assessment_answers property', function() {
          expect(req.form.values.person.assessment_answers).to.deep.equal([
            {
              comments: 'Additional comments',
              assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
            },
            {
              comments: '',
              assessment_question_id: '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
            },
          ])
        })

        it('should call parent configure method', function() {
          expect(
            BaseController.prototype.saveValues
          ).to.be.calledOnceWithExactly(req, {}, nextSpy)
        })
      })

      context('with empty values in form', function() {
        let req

        beforeEach(function() {
          req = {
            questions: [
              {
                id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
                type: 'assessment_questions',
                key: 'violent',
                category: 'risk',
                title: 'Violent',
              },
            ],
            form: {
              options: {
                assessmentCategory: 'risk',
                fields: mockFields,
              },
              values: {
                risk: ['', 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2', '', false],
                violent: '',
              },
            },
            sessionModel: {
              get: sinon.stub().returns(),
              set: sinon.spy(),
              unset: sinon.spy(),
            },
          }

          controller.saveValues(req, {}, nextSpy)
        })

        it('should remove empty values', function() {
          expect(req.form.values.assessment).to.deep.equal({
            risk: [
              {
                comments: '',
                assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
              },
            ],
          })
        })

        it('should flatten values on assessment_answers property', function() {
          expect(req.form.values.person.assessment_answers).to.deep.equal([
            {
              comments: '',
              assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
            },
          ])
        })
      })

      context('with multiple values in form', function() {
        let req

        beforeEach(function() {
          req = {
            questions: [
              {
                id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
                type: 'assessment_questions',
                key: 'violent',
                category: 'risk',
              },
              {
                id: '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
                type: 'assessment_questions',
                key: 'escape',
                category: 'risk',
              },
              {
                id: '534b05af-8b55-4a37-9f36-d36a60f04aa8',
                type: 'assessment_questions',
                key: 'self',
                category: 'risk',
              },
              {
                id: '29f8177c-2cf8-41e8-b1ad-1f66c3a1fda0',
                type: 'assessment_questions',
                key: 'bully',
                category: 'risk',
              },
            ],
            form: {
              options: {
                assessmentCategory: 'risk',
                fields: mockFields,
              },
              values: {
                risk: [
                  '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
                  'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
                  '534b05af-8b55-4a37-9f36-d36a60f04aa8',
                ],
                violent_explicit: 'Violent comments',
                violent: 'Violent comments',
                escape: 'Escape comments',
                self: 'Self comments',
                bully_explicit: '29f8177c-2cf8-41e8-b1ad-1f66c3a1fda0',
                bully: 'Bully comments',
              },
            },
            sessionModel: {
              get: sinon.stub().returns(),
              set: sinon.spy(),
              unset: sinon.spy(),
            },
          }

          controller.saveValues(req, {}, nextSpy)
        })

        it('should include all values', function() {
          expect(req.form.values.assessment).to.deep.equal({
            risk: [
              {
                comments: 'Violent comments',
                assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
              },
              {
                comments: 'Escape comments',
                assessment_question_id: '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
              },
              {
                comments: 'Self comments',
                assessment_question_id: '534b05af-8b55-4a37-9f36-d36a60f04aa8',
              },
              {
                comments: 'Bully comments',
                assessment_question_id: '29f8177c-2cf8-41e8-b1ad-1f66c3a1fda0',
              },
            ],
          })
        })

        it('should includes all flatten values on assessment_answers property', function() {
          expect(req.form.values.person.assessment_answers.length).to.equal(4)
          expect(req.form.values.person.assessment_answers).to.deep.equal([
            {
              comments: 'Violent comments',
              assessment_question_id: 'a1f6a3b5-a448-4a78-8cf7-6659a71661c2',
            },
            {
              comments: 'Escape comments',
              assessment_question_id: '7360ea7b-f4c2-4a09-88fd-5e3b57de1a47',
            },
            {
              comments: 'Self comments',
              assessment_question_id: '534b05af-8b55-4a37-9f36-d36a60f04aa8',
            },
            {
              comments: 'Bully comments',
              assessment_question_id: '29f8177c-2cf8-41e8-b1ad-1f66c3a1fda0',
            },
          ])
        })
      })
    })
  })
})
