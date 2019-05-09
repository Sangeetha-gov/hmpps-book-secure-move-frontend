const { render, getExamples } = require('../../../test/unit/component-helpers')

const examples = getExamples('pagination')

describe('Pagination component', () => {
  context('default', () => {
    it('should render previous link', () => {
      const $ = render('pagination', examples.default)

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--prev')
      const $itemText = $item.find('.app-pagination__link-text')
      const $itemLink = $item.find('a')

      expect($itemText.text()).to.equal('Previous')
      expect($itemLink.attr('href')).to.equal('/previous-page')
    })

    it('should render next link', () => {
      const $ = render('pagination', examples.default)

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--next')
      const $itemText = $item.find('.app-pagination__link-text')
      const $itemLink = $item.find('a')

      expect($itemText.text()).to.equal('Next')
      expect($itemLink.attr('href')).to.equal('/next-page')
    })
  })

  context('without next or previous', () => {
    it('should not render previous link', () => {
      const $ = render('pagination', {})

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--prev')
      expect($item.length).to.equal(0)
    })

    it('should not render next link', () => {
      const $ = render('pagination', {})

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--next')
      expect($item.length).to.equal(0)
    })
  })

  context('with classes', () => {
    it('should render classes', () => {
      const $ = render('pagination', {
        classes: 'app-pagination--custom-class',
      })

      const $component = $('.app-pagination')
      expect($component.hasClass('app-pagination--custom-class')).to.be.true
    })
  })

  context('with labels', () => {
    it('should render previous label', () => {
      const $ = render('pagination', {
        previous: {
          href: '/page-1',
          label: '1 of 300',
        },
      })

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--prev')
      const $itemLabel = $item.find('.app-pagination__link-label')
      const $itemLink = $item.find('a')

      expect($itemLabel.text().trim()).to.equal('1 of 300')
      expect($itemLink.attr('href')).to.equal('/page-1')
    })

    it('should render next label', () => {
      const $ = render('pagination', {
        next: {
          href: '/page-3',
          label: '3 of 300',
        },
      })

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--next')
      const $itemLabel = $item.find('.app-pagination__link-label')
      const $itemLink = $item.find('a')

      expect($itemLabel.text().trim()).to.equal('3 of 300')
      expect($itemLink.attr('href')).to.equal('/page-3')
    })
  })

  context('with custom text', () => {
    it('should render previous text', () => {
      const $ = render('pagination', {
        previous: {
          href: '/previous-day',
          text: 'Previous day',
        },
      })

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--prev')
      const $itemText = $item.find('.app-pagination__link-text')
      const $itemLink = $item.find('a')

      expect($itemText.text().trim()).to.equal('Previous day')
      expect($itemLink.attr('href')).to.equal('/previous-day')
    })

    it('should render next label', () => {
      const $ = render('pagination', {
        next: {
          href: '/next-day',
          text: 'Next day',
        },
      })

      const $component = $('.app-pagination')
      const $item = $component.find('.app-pagination__list-item--next')
      const $itemText = $item.find('.app-pagination__link-text')
      const $itemLink = $item.find('a')

      expect($itemText.text().trim()).to.equal('Next day')
      expect($itemLink.attr('href')).to.equal('/next-day')
    })
  })
})
