import { clean } from 'dom-clean'
import DomPointerBase from './base'

export default class DomPointer extends DomPointerBase {
  constructor() {
    super()

    /**
     *
     * Original cleaned source template
     *
     * @type {DocumentFragment}
     */
    this.template = new DomPointerBase(document.createDocumentFragment())

    /**
     *
     * Keeps track of installed Event handlers
     *
     * @type {Object}
     * @private
     */
    this._handlers = {}

    /**
     *
     * Contains the dom references
     *
     * @type {{}}
     */
    this.dom = new DomPointerBase()

    /**
     *
     * Contains the changed references
     *
     * @type {{}}
     */
    this.change = new Set()

    this.node = document.createDocumentFragment()
  }

  /**
   *
   * Set target element
   *
   * @param {HTMLElement} el Target element for rendering
   * @returns {DomPointer} This instance
   */
  setElement(el) {
    if (el && el.nodeType === Node.ELEMENT_NODE) {
      if (this.dom.node) {
        this._clearOn()
      }
      this.dom.node = el
      this._applyOn(this.dom.node)
      return this
    }
    throw Error('Element node type must be ELEMENT_NODE')
  }

  /**
   *
   * Takes a HTMLElement and returns it's path relative to the base element
   *
   * @param {HTMLElement} el A HTML Element
   * @return {String} Path to this element relative to the base element.
   */
  path(el) {
    let node = el
    const path = []
    while (node.parentNode) {
      path.push(Array.prototype.indexOf.call(node.parentNode.childNodes, node))
      if (node.parentNode === this.dom.node) {
        break
      }
      node = node.parentNode
    }
    return ':' + path.reverse().join(':')
  }

  /**
   *
   * Given some elements returns a named path map.
   *
   * @param {HTMLElement[]} els List of elements to include in the map
   * @returns {Object} Map with selected paths
   */
  paths(els) {
    const paths = {}
    for (const item of els) {
      paths[this.path(item)] = item
    }
    return paths
  }

  /**
   *
   * Create DomPointer from an existing element
   *
   * @param {HTMLElement} el HTMLElement
   * @param {Object} opts Options object
   * @return {DomPointer} Dom Pointer instance
   */
  static create(el, opts) {
    const dp = new DomPointer()
    dp.setOpts(opts)
    clean(el, dp._opts.comments)
    dp.setElement(el)
    dp.template.node.appendChild(
      el.cloneNode(true)
    )
    dp.reset()
    dp.template.parse(dp.template.node)
    return dp
  }

  /**
   *
   * Create DomPointer from a string of HTML
   *
   * Use setElement to set the target element for rendering
   *
   * @param {String} html HTML String
   * @param {Object} opts Options object
   * @return {DomPointer} Dom Pointer instance
   */
  static fromHTML(html, opts) {
    const dp = new DomPointer()
    dp.setOpts(opts)
    dp._setHTML(html)
    dp.reset()
    return dp
  }

  /**
   *
   * Set HTML
   *
   * @param {String} html HTML String
   * @returns {DomPointer} Dom Pointer instance
   */
  _setHTML(html) {
    const temp = document.createElement('div')
    temp.innerHTML = html
    clean(temp, this._opts.comments)
    while (temp.firstChild) {
      this.template.node.appendChild(temp.firstChild)
    }
    this.template.parse(this.template.node)
    return this
  }

  /**
   *
   * Retrieve or set data for this node.
   *
   * Usage:
   *
   *   dp.data(':0:0:1', data);
   *
   * @param {String} path path
   * @param {mixed} val value to set
   * @param {String} cpath Path of the container node (defaults to parentNode)
   * @param {Boolean} append Whether to append to the contents
   * @returns {DomPointer} Dom Pointer instance
   */
  data(path, val, cpath, append) {
    const fpath = cpath ? this._dealias(path, cpath) : this._dealias(path)
    const el = this.getRef(fpath)
    const method = el.nodeType === Node.TEXT_NODE ? 'nodeValue' : 'innerHTML'
    if (append) {
      el[method] += val
    } else {
      el[method] = val
    }
    this.change.add(fpath)
    return this
  }

  /**
   *
   * Add attribute
   *
   * Will add an attribute:
   *
   *  { op: 'add', path: ':0:1', name: 'class', val: 'warning' }
   *
   * If the attribute already exists will append the value separated by a space
   *
   * @param {HTMLElement} el HTML Element
   * @param {Object} change Change object
   * @param {String} change.op The operation
   * @param {String} change.path The target path
   * @param {String} change.name Attribute name
   * @param {String} change.val Attribute value
   * @returns {Void} Void
   * @private
   */
  _addAttribute(el, change) {
    const curr = el.getAttribute(change.name)
    if (curr) {
      el.setAttribute(change.name, [curr, change.val].join(' '))
    } else {
      el.setAttribute(change.name, change.val)
    }
  }

  /**
   *
   * Removes a value from an attribute
   *
   *  { op: 'remove', path: ':0:1', name: 'class', val: 'warning' }
   *  { op: 'remove', path: ':0:1', name: 'class', val: 'warning test' }
   *  { op: 'remove', path: ':0:1', name: 'class', val: ['warning', 'test'] }
   *
   * @param {HTMLElement} el HTML Element
   * @param {Object} change Change object
   * @param {String} change.op The operation
   * @param {String} change.path The target path
   * @param {String} change.name Attribute name
   * @param {String} change.val Attribute value
   * @returns {Void} Void
   * @private
   */
  _removeAttribute(el, change) {
    if (!change.hasOwnProperty('val')) {
      // TODO: generalize and require all props
      throw Error('must specify val to remove')
    }
    const curr = el.getAttribute(change.name)
    let items = []
    if (curr) {
      items = Array.isArray(curr) ? curr : curr.split(' ')
      const idx = items.indexOf(change.val)
      if (idx >= 0) {
        items.splice(idx, 1)
      } else {
        throw Error(`Attribute value ${change.val} not found`)
      }
    }

    if (items.length) {
      el.setAttribute(change.name, items.join(' '))
    } else {
      el.removeAttribute(change.name)
    }
  }

  /**
   *
   * Set Attributes
   *
   * @param {Object[]} map Attribute map
   * @returns {DomPointer} This instance
   */
  setAttributes(map = []) {
    for (const change of map) {
      const el = this.refs.get(change.path)
      switch (change.op) {
      case 'remove':
        this._removeAttribute(el, change)
        break
      case 'add':
      case 'change':
      default:
        this._addAttribute(el, change)
        break
      }
      this.change.add(this._dealias(change.path))
    }
    return this
  }

  /**
   *
   * Takes a changeset as used by setAttributes yet reverts all operations.
   *
   * @param {Object[]} map Attribute map
   * @returns {DomPointer} This instance
   */
  revertAttributes(map = []) {
    this.setAttributes(map.map(change => {
      return {
        path: change.path,
        op: change.op === 'remove' ? 'add' : 'remove',
        name: change.name,
        val: change.val // undefined is not set
      }
    }))
    return this
  }

  /**
   *
   * Add eventHandler
   *
   * @param {String} type Event type, e.g. click, mousemove etc.
   * @param {Function} handler Callback
   * @returns {DomPointer} Dom Pointer instance
   */
  on(type, handler) {
    if (this.dom.node) {
      if (this._handlers[type]) {
        throw Error(`Handler already defined for ${type}`)
      }
      this.dom.node.addEventListener(type, handler)
      this._handlers[type] = handler
      return this
    }
    throw Error('Container element not set')
  }

  /**
   *
   * Remove an event listener from the container element
   *
   * @param {String} type Event type, e.g. click, mousemove etc.
   * @returns {DomPointer} Dom Pointer instance
   */
  off(type) {
    if (this.dom.node) {
      if (!arguments.length) {
        Object.keys(this._handlers).forEach(kind => this.off(kind))
      } else {
        if (!this._handlers[type]) {
          throw Error('No event handler installed for ${type}')
        }
        this.dom.node.removeEventListener(type, this._handlers[type])
        delete this._handlers[type]
      }
      return this
    }
    throw Error('Container element not set')
  }

  /**
   *
   * Removes event handlers from the current container element.
   *
   * Mainly used before the container element is swapped.
   *
   * @private
   * @returns {undefined} Undefined
   */
  _clearOn() {
    Object.keys(this._handlers).forEach(type => {
      this.dom.node.removeEventListener(type, this._handlers[type])
    })
  }

  /**
   *
   * Applies the event handlers to current container element
   *
   * Assumes no handlers are yet installed on the element.
   *
   * @param {HTMLElement} el HTML Element
   * @private
   * @returns {undefined} Undefined
   */
  _applyOn(el) {
    Object.keys(this._handlers).forEach(type => {
      el.addEventListener(type, this._handlers[type])
    })
  }

  /**
   *
   * Resets and moves operation to the in-memory node fragment.
   * All operations will take place against node.
   *
   * Use the remove parameter to directly remove the current rendering
   * from the dom, else it will be replaced once render() is called again.
   *
   * When a fragment is placed it's references become live
   *
   * Reset sets the context to node again instead of what is present within the dom.
   *
   * @param {Boolean} remove Whether to remove the current rendering from the dom
   * @returns {DomPointer} Dom Pointer instance
   */
  reset(remove) {
    if (remove && this.dom.node) {
      this.dom.node.innerHTML = ''
    }
    this.refs.clear()
    this.node = document.createDocumentFragment()
    this.node.appendChild(
      this.template.node.cloneNode(true)
    )
    this.parse(this.node)
    return this
  }

  /**
   * (Re)renders  the template.
   *
   * When render is called the current swp empties and the context of the references will be the live dom.
   *
   * @return {HTMLElement} The old childNode
   */
  render() {
    if (this.dom.node) {
      if (!this.node) {
        throw Error('Empty swap')
      }

      // quick copy
      this.dom.refs = new Map(this.refs)
      this.dom._aliases = new Map(this._aliases)

      const workingSet = this.node.cloneNode(true)
      for (const path of this.change) {
        this.dom.refs.get(path).parentNode.replaceChild(
          this.refs.get(path).cloneNode(true), // new
          this.dom.refs.get(path) // old within the dom
        )
      }
      this.change.clear()
      this.node = workingSet
      return this.dom.node
    }
    throw Error('Target element not set, use setElement() first')
  }
}
