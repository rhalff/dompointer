const validAlias = /^[A-Za-z]+[\w\-]*$/

export default class DomPointerBase {
  constructor() {
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

    /**
     * The values of these attributes will be used
     * to automatically register aliases
     *
     * @type {string[]}
     * @private
     */
    this.aliasAttrs = ['id', 'name']

    this._opts = {
      comments: true
    }

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

      const path = ':' + arr.join(':')

      this.refs.set(path, node)

      if (node.nodeType === Node.ELEMENT_NODE) {
        for (const attr of this.aliasAttrs) {
          const val = node.getAttribute(attr)
          if (val) {
            this._alias(val, path)
            break
          }
        }
      }

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
      this._aliases.set(alias, path)
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
  }

  /**
   *
   * Dealias a path
   *
   * Both path or container path can be an alias.
   *
   * Will returned the resolved path
   *
   * Logic for nested aliases is not there yet.
   *
   * These aliases would be scoped to the enclosing container.
   *
   * @param {String} path Path to be dealiased
   * @param {String} cpath Container path
   * @returns {String} Dealiased path
   * @private
   */
  _dealias(path, cpath) {
    const fpath = cpath ? this._dealias(cpath) : ''
    if (path[0] === ':') {
      this.getRef(fpath + path) // ensure it exists
      return fpath + path
    }
    if (this._aliases.has(path)) {
      return this._aliases.get(path)
    }
    throw Error(`Unknown alias ${path}`)
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
}
