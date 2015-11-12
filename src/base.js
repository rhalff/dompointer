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
    this.aliases = new Map()

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
     * The documentFragment or HTMLElement acted upon
     *
     * @type {DocumentFragment|HTMLElement}
     * @private
     */
    this.node = document.createDocumentFragment()
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

      // do alias maintainance here.
      // keep the aliases but remove them from refs
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
    this.refs.clear()
    this._parse(el || this.node)

    for (const [alias, path] of this.aliases) {
      if (this.refs.has(path)) {
        this._alias(alias, path)
      } else {
        // alias is not within the view at the moment
        this.refs.set(alias, null)
      }
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
      this.aliases.set(alias, path)
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
    // TODO: do this smarter
    // _aliases could be a
    this.dom.aliases.set(alias, path)
    this.template.aliases.set(alias, path)
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
  dealias(path, cpath) {
    const fpath = cpath ? this.dealias(cpath) : ''
    if (path[0] === ':') {
      this.getRef(fpath + path) // ensure it exists
      return fpath + path
    }
    if (this.aliases.has(path)) {
      return this.aliases.get(path)
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
   * Set Node
   *
   * @param {HTMLElement|DocumentFragment} node And HTMLElement or DocumentFragment
   * @returns {DomPointer} This instance
   */
  setNode(node) {
    this.node = node
    this.parse()
    return this
  }

  /**
   *
   * Resolves a path
   *
   * e.g.
   * listItem is :0:4
   * listItem[0] becomes :0:4
   * listItem[1] becomes :0:5
   * listItem[2] becomes :0:6
   *
   * @param {String} path Path to be resolved
   * @returns {String} The resolved path
   */
  resolve(path) {
    if (path.indexOf('[') >= 0) {
      const match = path.match(/(\w+)\[(\d+)\]/)
      if (match.length === 3) {
        const ret = this.dealias(match[1]).split(':')
        ret.pop()
        ret.push(match[2])
        return ret.join(':')
      }
    }
    return path
  }

  /**
   *
   * Get reference by path.
   *
   * @param {String} path path
   * @returns {HTMLElement} HTML Element
   */
  getRef(path) {
    let _path = path
    if (this.refs.has(_path)) {
      return this.refs.get(_path)
    }

    _path = this.resolve(path)
    if (this.refs.has(_path)) {
      return this.refs.get(_path)
    }

    // support @attr
    const arr = _path.split('@')
    if (arr[1] && this.refs.has(arr[0])) {
      return this.refs.get(arr[0])
    }

    throw Error('Unknown path: ' + _path)
  }

  /**
   *
   * Update reference by path.
   *
   * used to update a path.
   *
   * Will automatically update the alias if one is defined
   *
   * @param {String} path path
   * @param {HTMLElement} el HTML Element
   * @returns {HTMLElement} HTML Element
   */
  updateRef(path, el) {
    this.getRef(path)
    this.refs.set(path, el)
  }
}
