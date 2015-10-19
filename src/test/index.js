import {} from 'babel/register'
import { expect } from 'chai'
import DomPointer from '../index'
import { createElement } from './util'

const complies = (dp) => {
  expect(
      [...dp.refs.keys()]
  ).eql(
      [':0', ':0:0', ':0:0:0', ':0:0:1']
  )

  expect(dp.refs.get(':0')).eql(dp.el
          .firstChild
  )

  expect(dp.refs.get(':0:0')).eql(dp.el
          .firstChild
          .firstChild
  )

  expect(dp.refs.get(':0:0:0')).eql(dp.el
          .firstChild
          .firstChild
          .firstChild
  )

  expect(dp.refs.get(':0:0:1')).eql(dp.el
          .firstChild
          .firstChild
          .childNodes[1]
  )
}

describe('DomPointer', () => {
  const html = `
    <div>
      <div>
        <h3 title="H3"></h3>
        <h6></h6>
      </div>
    </div>`
  const targetEl = document.getElementById('target')

  it('create()', () => {
    DomPointer.create(createElement(html))
  })

  it('fromHTML()', () => {
    DomPointer.fromHTML(html)
  })

  it('path()', () => {
    const dp = DomPointer.fromHTML(html)
    dp.setElement(targetEl)
    dp.render()
    expect(dp.path(dp.refs.get(':0'))).eql(':0')
    expect(dp.path(dp.refs.get(':0:0'))).eql(':0:0')
    expect(dp.path(dp.refs.get(':0:0:0'))).eql(':0:0:0')
    expect(dp.path(dp.refs.get(':0:0:1'))).eql(':0:0:1')
  })

  it('paths()', () => {

    const dp = DomPointer.fromHTML(html)
    dp.setElement(targetEl)
    dp.render()

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

  it('setAttributes()', () => {
    const dp = DomPointer.fromHTML(html)
    dp.setElement(targetEl)
    dp.setAttributes([
      { path: ':0:0:0', op: 'remove', name: 'title' },
      { path: ':0:0:1', op: 'add', name: 'title', val: 'My Title' }
    ])
    dp.render()
    expect(dp.refs.get(':0:0:0').hasAttribute('title')).eql(false)
    expect(dp.refs.get(':0:0:1').getAttribute('title')).eql('My Title')
  })
})
