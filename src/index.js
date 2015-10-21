import { clean } from 'dom-clean'

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

    this._opts = {
      comments: true
    }

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
  parse(el, _p = []) {
    for (let [idx, node] of Array.from(el.childNodes).entries()) {
      const arr = _p.slice()
      arr.push(idx)

      if (node.nodeType === Node.COMMENT_NODE) {
        node = this._convertCommentToTextNode(node)
      }

      this.refs.set(':' + arr.join(':'), node)

      if (node.childNodes.length) {
        return this.parse(node, arr)
      }
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
    this.el = el
    return this
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
    const fpath = cpath ? cpath + path : path
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

  setAttributes(map = []) {
    for (const change of map) {
      switch (change.op) {
      case 'remove':
        this.refs.get(change.path).removeAttribute(change.name)
        break
      case 'add':
      case 'change':
      default:
        this.refs.get(change.path).setAttribute(change.name, change.val)
        break
      }
    }
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
    if (remove) {
      this.el.parentNode.removeChild(this.el)
    }
    this.refs.clear()
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
    return this.el.replaceChild(this._swp, this.el.firstChild) // automatically clears this._swp
  }
}
