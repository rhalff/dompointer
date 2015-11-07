import {} from 'babel/register'
import { expect, assert } from 'chai'
import DomPointer from '../index'
import { createElement, click, copy } from './util'
import JediHTML from './fixture/jedi'

describe('DomPointer', () => {
  const html = `
    <div>
      <div id="idea">
        <h1 title="Heading" class="heading"></h1>
        <h3 class="sub title"></h3>
      </div>
    </div>`
  const targetEl = document.getElementById('target')

  describe('create()', () => {
    let dp
    let dp2
    it('Should instantiate', () => {
      dp = DomPointer.create(createElement(html))
      expect(dp).to.be.instanceOf(DomPointer)
    })
    it('create() should match setHTML', () => {
      dp = DomPointer.create(createElement(html))
      dp2 = DomPointer.fromHTML(html)
      expect([...dp.refs.keys()]).to.eql([...dp2.refs.keys()])
    })
    it('template refs should match initial refs fromHTML()', () => {
      expect([...dp2.template.refs.keys()]).to.eql([...dp2.refs.keys()])
    })
    it('template refs should match initial refs create()', () => {
      expect([...dp.template.refs.keys()]).to.eql([...dp.refs.keys()])
    })
  })

  it('fromHTML()', () => {
    DomPointer.fromHTML(html)
  })

  describe('setElement', () => {
    it('can set element', () => {
      const dp = DomPointer.fromHTML(html)
      dp.setElement(document.createElement('div'))
    })
    it('target type must be a NODE_ELEMENT', () => {
      const dp = DomPointer.fromHTML(html)
      expect(() => dp.setElement(document.createDocumentFragment()))
        .to.throw(Error)
    })
    it('Render() should throw if target element is not set', () => {
      const dp = DomPointer.fromHTML(html)
      expect(() => dp.render()).to.throw(Error)
    })
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

  it('Other template', () => {
    const dp = DomPointer.fromHTML(JediHTML)

    const expected = [
      ':0',
      ':0:0',
      ':0:0:0',
      ':0:0:0:0',
      ':0:0:0:1',
      ':0:0:1',
      ':0:0:1:0',
      ':0:0:1:0:0',
      ':0:0:1:0:0:0',
      ':0:0:1:0:0:0:0',
      ':0:0:1:0:0:1',
      ':0:0:1:0:0:1:0',
      ':0:0:1:0:0:1:1',
      ':0:0:1:0:1',
      ':0:0:1:0:1:0',
      ':0:0:1:0:1:0:0',
      ':0:0:1:0:1:1',
      ':0:0:1:0:1:1:0',
      ':0:0:1:0:1:1:1',
      ':0:0:1:1',
      ':0:0:1:1:0',
      ':0:0:1:1:1'
    ]

    expect(Array.from(dp.refs.keys())).eql(expected)
  })

  describe('setAttributes()', () => {
    it('remove attributed requires value', () => {
      const dp = DomPointer.fromHTML(html)
      expect(() => {
        dp.setAttributes([
          {path: ':0:0:0', op: 'remove', name: 'title'}
        ])
      }).to.throw(Error)
    })
    it('remove attribute', () => {
      const dp = DomPointer.fromHTML(html)

      expect(dp.refs.get(':0:0:0').hasAttribute('title')).eql(true)
      dp.setAttributes([
        { path: ':0:0:0', op: 'remove', name: 'title', val: 'Heading' }
      ])

      expect(dp.refs.get(':0:0:0').hasAttribute('title')).eql(false)
    })
    it('remove field from attribute', () => {
      const dp = DomPointer.fromHTML(html)
      dp.setAttributes([
        { path: ':0:0:1', op: 'remove', name: 'class', val: 'sub' },
      ])

      expect(dp.refs.get(':0:0:1').hasAttribute('class')).eql(true)
      expect(dp.refs.get(':0:0:1').getAttribute('class')).eql('title')
    })
    it('remove unknown field should throw', () => {
      const dp = DomPointer.fromHTML(html)

      expect(() => {
        dp.setAttributes([
          { path: ':0:0:1', op: 'remove', name: 'class', val: 'not-exist' },
        ])
      }).to.throw(/not found/)
    })
    it('add attribute', () => {
      const dp = DomPointer.fromHTML(html)

      dp.setAttributes([
        { path: ':0:0:1', op: 'add', name: 'class', val: 'test' }
      ])

      expect(dp.refs.get(':0:0:1').hasAttribute('class')).eql(true)
      expect(dp.refs.get(':0:0:1').getAttribute('class')).eql('sub title test')
    })
    describe('revert attributes', () => {
      const dpr = DomPointer.fromHTML(html)
      let change

      it('revert add', () => {
        change = [{ path: ':0:0:1', op: 'add', name: 'class', val: 'test' }]
        const orig = copy(change)
        dpr.setAttributes(change)
        dpr.revertAttributes(change)
        expect(dpr.refs.get(':0:0:1').hasAttribute('class')).eql(true)
        expect(dpr.refs.get(':0:0:1').getAttribute('class')).eql('sub title')
        expect(orig).to.eql(change)
      })

      it('revert remove', () => {
        change = [{ path: ':0:0:1', op: 'remove', name: 'class', val: 'title' }]
        const orig = copy(change)
        dpr.setAttributes(change)
        expect(dpr.refs.get(':0:0:1').getAttribute('class')).eql('sub')
        dpr.revertAttributes(change)
        expect(dpr.refs.get(':0:0:1').getAttribute('class')).eql('sub title')
        expect(orig).to.eql(change)
      })
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

  describe('alias()', () => {
    const dp = DomPointer.fromHTML(html)

    it('set alias', () => {
      dp.alias('parent', ':0:0')
      dp.alias('heading', ':0:0:0')
      dp.alias('subtitle', ':0:0:1')
      expect(dp.refs.get('heading')).eql(dp.refs.get(':0:0:0'))
      expect(dp.refs.get('subtitle')).eql(dp.refs.get(':0:0:1'))
    })

    it('auto alias attributes id & name', () => {
      expect(dp.refs.get('idea')).eql(dp.refs.get(':0:0'))
      expect(dp._aliases.has('idea')).eql(true)
    })

    it('alias should survive reset', () => {
      dp.reset()
      expect(dp.refs.get('heading')).eql(dp.refs.get(':0:0:0'))
      expect(dp.refs.get('subtitle')).eql(dp.refs.get(':0:0:1'))
    })

    it('set data with aliased parent', () => {
      dp.data(':0', 'Test', 'parent')
      expect(dp.refs.get(':0:0:0').innerHTML).eql('Test')
    })

    describe('_dealias()', () => {
      it('return path for alias', () => {
        expect(dp._dealias('idea')).eql(':0:0')
      })
      it('return path for path', () => {
        expect(dp._dealias(':0:0')).eql(':0:0')
      })
      it('throw if path does not exist', () => {
        expect(() => dp._dealias(':1:0:1')).to.throw(/Unknown path/)
      })
      it('throw if alias does not exist', () => {
        expect(() => dp._dealias('not_exist')).to.throw(/Unknown alias/)
      })
    })
  })

  describe('Events', () => {
    const dp = DomPointer.fromHTML(html)
    dp.setElement(document.createElement('div'))

    it('on()', (done) => {
      dp.on('click', () => done())
      expect(dp._handlers).to.have.ownProperty('click')
      click(dp.dom.node)
    })

    it('can only install one handler', () => {
      expect( () => dp.on('click') ).to.throw(Error)
    })

    it('off()', () => {
      expect(dp._handlers).to.have.ownProperty('click')
      dp.off('click')
      expect(dp._handlers).to.not.have.ownProperty('click')
    })

    it('can turn off all', () => {
      const bogus = function bogus() {}
      dp.on('click', bogus)
      dp.on('mouseover', bogus)
      dp.off()
      expect(dp._handlers).to.not.have.ownProperty('click')
      expect(dp._handlers).to.not.have.ownProperty('mouseover')
      expect(Object.keys(dp._handlers).length).to.eql(0)
    })
    it('persist when container element changes', (done) => {
      let clicks = 0
      dp.on('click', () => {
        if (++clicks === 2) {
          done()
        }
      })
      expect(dp._handlers).to.have.ownProperty('click')
      click(dp.dom.node)
      dp.setElement(document.createElement('div'))
      click(dp.dom.node)
    })
    it('persist throughout render', () => {
      expect(dp._handlers).to.have.ownProperty('click')
      dp.render()
      expect(dp._handlers).to.have.ownProperty('click')
      dp.render()
      expect(dp._handlers).to.have.ownProperty('click')
    })
  })

  describe('reset()', () => {
    it('should reset', () => {
      const dp = DomPointer.fromHTML('<div>Some text<!-- HERE --></div>')
      dp.reset()
    })
    it('should reset and remove', () => {
      const dp = DomPointer.fromHTML('<div>Some text<!-- HERE --></div>')
      const oldRef = dp.refs.get(':0')
      const oldSize = oldRef.size
      dp.reset(true)
      assert.isTrue(oldRef !== dp.refs.get(':0'))
      assert.isTrue(oldSize !== dp.refs.size)
    })
  })
})
