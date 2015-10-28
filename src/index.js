import { clean } from 'dom-clean'

const validAlias = /^[A-Za-z]+[\w\-]*$/

export default class DomPointer {
  constructor() {
    /**
     *
     * Original cleaned source template
     *
     * @type {DocumentFragment}
     */
    this.template = document.createDocumentFragment()

    /**
     *
     * Reference map
     *
     * If template is placed within the dom will point to the live dom.
     *
     * Otherwise it will point to the elements within the in-memory document fragment
     *
     * @type {Map}
     */
    this.refs = new Map()

    /**
     *
     * Cached alias mappings.
     *
     * Will be re-applied during each reset
     *
     * @type {Map}
     * @private
     */
    this._aliases = new Map()

    this._opts = {
      comments: true
    }

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
     * Target element where this template is rendered
     *
     * @type {HTMLElement}
     */
    this.el = undefined

    /**
     *
     * The dom being prepared, while it's not yet placed within the dom itself.
     *
     * @type {DocumentFragment}
     * @private
     */
    this._swp = document.createDocumentFragment()
  }

  _parse(el, _p = []) {
    for (let idx = 0; idx < el.childNodes.length; idx++) {
      let node = el.childNodes[idx]
      const arr = _p.slice()
      arr.push(idx)

      if (node.nodeType === Node.COMMENT_NODE) {
        node = this._convertCommentToTextNode(node)
      }
      this.refs.set(':' + arr.join(':'), node)

      if (node.childNodes.length) {
        this._parse(node, arr)
      }
    }
  }

  /**
   *
   * Parses the given element and puts the references into this.refs
   *
   * Also converts any comments to text nodes to make them addressable entities
   *
   * @param {HTMLElement} el The Element
   * @param {Array} _p private path
   * @returns {DomPointer} This instance
   */
  parse(el) {
    this._parse(el)

    for (const [alias, path] of this._aliases) {
      this._alias(alias, path)
    }

    return this
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
      this.el = el
      return this
    }
    throw Error('Element node type must be ELEMENT_NODE')
  }

  /**
   * Set Options
   *
   * @param {Object} opts Options object
   * @param {Boolean} opts.comments Whether to keep comments
   * @returns {DomPointer} This instance
   */
  setOpts(opts = {}) {
    for (const key of Object.keys(opts)) {
      this._opts[key] = opts[key]
    }
    return this
  }

  _alias(alias, path) {
    if (validAlias.test(alias)) {
      this.refs.set(alias, this.getRef(path))
      return this
    }

    throw Error('Invalid alias: ' + alias)
  }

  /**
   *
   * Alias
   *
   * @param {String} alias Alias name
   * @param {String} path Path to be aliased
   * @returns {DomPointer} This instance
   */
  alias(alias, path) {
    this._alias(alias, path)
    this._aliases.set(alias, path)
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
      if (node.parentNode === this.el) {
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
    dp.template.appendChild(
      el.cloneNode(true)
    )
    dp.reset()
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
    dp.setHTML(html)
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
  setHTML(html) {
    const temp = document.createElement('div')
    temp.innerHTML = html
    clean(temp, this._opts.comments)
    while (temp.firstChild) {
      this.template.appendChild(temp.firstChild)
    }
    return this
  }

  /**
   *
   * Dealias
   *
   * @param {String} path Path to be dealiased
   * @returns {String} Dealiased path
   * @private
   */
  _dealias(path) {
    return this._aliases.has(path) ? this._aliases.get(path) : path
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
    const fpath = cpath ? this._dealias(cpath) + path : path
    const el = this.getRef(fpath)
    const method = el.nodeType === Node.TEXT_NODE ? 'nodeValue' : 'innerHTML'
    if (append) {
      el[method] += val
    } else {
      el[method] = val
    }
    return this
  }

  /**
   *
   * @param {HTMLElement} el HTMLElement
   * @returns {TextElement} TextNode
   * @private
   */
  _convertCommentToTextNode(el) {
    const nc = document.createTextNode('')
    el.parentNode.replaceChild(nc, el)
    return nc
  }

  /**
   *
   * Get reference by path.
   *
   * @param {String} path path
   * @returns {HTMLElement} HTML Element
   */
  getRef(path) {
    if (this.refs.has(path)) {
      return this.refs.get(path)
    }

    throw Error('Unknown path: ' + path)
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
   * Removes an attribute
   *
   * Will remove the attribute entirely:
   *
   *  { op: 'remove', path: ':0:1', name: 'class' }
   *
   * If you specify a val and the attribute is a class
   * will only remove the value from the class list:
   *
   *  { op: 'remove', path: ':0:1', name: 'class', val: 'warning' }
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
    const curr = el.getAttribute(change.name)
    if (change.val) {
      if (curr) {
        const items = curr.split(' ')
        items.splice(
          items.indexOf(change.val), 1
        )
        el.setAttribute(change.name, items.join(' '))
      }
    } else {
      el.removeAttribute(change.name)
    }
  }

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
    }
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
    if (this.el) {
      if (this._handlers[type]) {
        throw Error(`Handler already defined for ${type}`)
      }
      this.el.addEventListener(type, handler)
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
    if (this.el) {
      if (!this._handlers[type]) {
        throw Error('No event handler installed for ${type}')
      }
      this.el.removeEventListener(type, this._handlers[type])
      delete this._handlers[type]
      return this
    }
    throw Error('Container element not set')
  }

  /**
   *
   * Resets and moves operation to the in-memory _swp fragment.
   * All operations will take place against _swp.
   *
   * Use the remove parameter to directly remove the current rendering
   * from the dom, else it will be replaced once render() is called again.
   *
   * When a fragment is placed it's references become live
   *
   * Reset sets the context to _swp again instead of what is present within the dom.
   *
   * @param {Boolean} remove Whether to remove the current rendering from the dom
   * @returns {DomPointer} Dom Pointer instance
   */
  reset(remove) {
    if (remove && this.el) {
      this.el.innerHTML = ''
    }
    this.refs.clear()
    this._swp = document.createDocumentFragment()
    this._swp.appendChild(
      this.template.cloneNode(true)
    )
    this.parse(this._swp)
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
    if (this.el) {
      this.el.innerHTML = ''
      return this.el.appendChild(this._swp) // automatically clears this._swp
    }
    throw Error('Target element not set, use setElement() first')
  }
}
