import {} from 'babel/register'
import { expect } from 'chai'
import DomPointer from '../index'
import { createElement } from './util'

describe('DomPointer', () => {
  const html = `
    <div>
      <div>
        <h1 title="Heading" class="heading"></h1>
        <h3 class="sub title"></h3>
      </div>
    </div>`
  const targetEl = document.getElementById('target')

  it('create()', () => {
    const dp = DomPointer.create(createElement(html))
    expect(dp).to.be.instanceOf(DomPointer)
  })

  it('fromHTML()', () => {
    DomPointer.fromHTML(html)
  })

  it('path()', () => {
    const dp = DomPointer.fromHTML(html)
    dp.setElement(targetEl)

    expect(dp.path(dp.refs.get(':0'))).eql(':0')
    expect(dp.path(dp.refs.get(':0:0'))).eql(':0:0')
    expect(dp.path(dp.refs.get(':0:0:0'))).eql(':0:0:0')
    expect(dp.path(dp.refs.get(':0:0:1'))).eql(':0:0:1')
  })

  it('paths()', () => {
    const dp = DomPointer.fromHTML(html)
    dp.setElement(targetEl)

    const refs = [
      dp.refs.get(':0'),
      dp.refs.get(':0:0'),
      dp.refs.get(':0:0:0'),
      dp.refs.get(':0:0:1')
    ]

    expect(dp.paths(refs)).eql({
      ':0': refs[0],
      ':0:0': refs[1],
      ':0:0:0': refs[2],
      ':0:0:1': refs[3]
    })
  })

  describe('setAttributes()', () => {
    it('Can remove attribute', () => {
      const dp = DomPointer.fromHTML(html)

      expect(dp.refs.get(':0:0:0').hasAttribute('title')).eql(true)
      dp.setAttributes([
        { path: ':0:0:0', op: 'remove', name: 'title' }
      ])

      expect(dp.refs.get(':0:0:0').hasAttribute('title')).eql(false)
    })
    it('Can remove field from attribute', () => {
      const dp = DomPointer.fromHTML(html)
      dp.setAttributes([
        { path: ':0:0:1', op: 'remove', name: 'class', val: 'sub' },
      ])

      expect(dp.refs.get(':0:0:1').hasAttribute('class')).eql(true)
      expect(dp.refs.get(':0:0:1').getAttribute('class')).eql('title')
    })
    it('Can add attribute', () => {
      const dp = DomPointer.fromHTML(html)

      dp.setAttributes([
        { path: ':0:0:1', op: 'add', name: 'class', val: 'test' }
      ])

      expect(dp.refs.get(':0:0:1').hasAttribute('class')).eql(true)
      expect(dp.refs.get(':0:0:1').getAttribute('class')).eql('sub title test')
    })
  })

  describe('data()', () => {
    it('Place data', () => {
      const dp = DomPointer.fromHTML(html)
      dp.data(':0:0:0', 'test1')
      dp.data(':0:0:1', 'test2')

      expect(dp.refs.get(':0:0:0').innerHTML).eql('test1')
      expect(dp.refs.get(':0:0:1').innerHTML).eql('test2')
    })

    it('Place data at comment position', () => {
      const dp = DomPointer.fromHTML('<div>Some text - <!-- HERE --></div>')

      dp.data(':0:1', 'Here you go')
      expect(dp.refs.get(':0:1').nodeType).eql(Node.TEXT_NODE)
      expect(dp.refs.get(':0:1').nodeValue).eql('Here you go')
      expect(dp.refs.get(':0').innerHTML).eql('Some text - Here you go')

      dp.data(':0:1', 'Here you go again')
      expect(dp.refs.get(':0:1').nodeType).eql(Node.TEXT_NODE)
      expect(dp.refs.get(':0:1').nodeValue).eql('Here you go again')
      expect(dp.refs.get(':0').innerHTML).eql('Some text - Here you go again')
    })
  })

  it('Strip/ignore comments', () => {
    const opts = { comments: false }
    const dp = DomPointer.fromHTML('<div>Some text<!-- HERE --></div>', opts)
    expect(() => dp.data(':0:1', 'Here ya go')).to.throw(Error)
    expect(dp.refs.get(':0').innerHTML).eql('Some text')
  })

  describe('reset()', () => {
    it('should reset', () => {
      const dp = DomPointer.fromHTML('<div>Some text<!-- HERE --></div>')
      dp.reset()
      // whole lot of tests
      // dp.reset()
    })
  })

  describe('alias()', () => {
    const dp = DomPointer.fromHTML(html)

    it('set alias', () => {
      dp.alias('heading', ':0:0:0')
      dp.alias('subtitle', ':0:0:1')
      expect(dp.refs.get('heading')).eql(dp.refs.get(':0:0:0'))
      expect(dp.refs.get('subtitle')).eql(dp.refs.get(':0:0:1'))
    })

    it('alias should survive reset', () => {
      dp.reset()
      expect(dp.refs.get('heading')).eql(dp.refs.get(':0:0:0'))
      expect(dp.refs.get('subtitle')).eql(dp.refs.get(':0:0:1'))
    })
  })
})
