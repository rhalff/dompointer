import { clean } from 'dom-clean'

export default class DomPointer {

  constructor() {
    this.template = document.createDocumentFragment()
    this.refs = new Map()
    this.data = new Map()
    this.replace = false
    this.maps {
      data: new Map()
    }
    this.change = {
      attrs: []
    }
  }

  parse(el, _p = []) {
    for (const [idx, node] of Array.from(el.childNodes).entries()) {
      const arr = _p.slice()
      arr.push(idx)

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
   * @param el
   */
  setElement(el) {
    this.el = el
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
      path.push(Array.prototype.indexOf.call(node.parentNode.children, node))
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
   * @param {HTMLElement|String} el HTML or HTMLElement
   * @return {DomPointer} Dom Pointer instance
   */
  static create(el) {
    clean(el)
    const dp = new DomPointer()
    dp.setElement(el)
    dp.template.appendChild(
      el.cloneNode(true)
    )
  }

  /**
   *
   * Create DomPointer from a string of HTML
   *
   * Use setElement to set the target element for rendering
   *
   * @param {HTMLElement|String} el HTML or HTMLElement
   * @return {DomPointer} Dom Pointer instance
   */
  static fromHTML(html) {
    const dp = new DomPointer()
    dp.setHTML(html)
    return dp
  }

  setHTML(html) {
    const temp = document.createElement('div')
    temp.innerHTML = html;
    clean(temp)
    while (temp.firstChild) {
      this.template.appendChild(temp.firstChild)
    }
    this.replace = true
    return this
  }

  /**
   *
   * Retrieve or set data for this node.
   *
   * Dompointer will not do named by itself.
   * Named is to work with by the maps, those maps resolve it to paths.
   *
   * Usage:
   *
   *   dp.data(':0:0:1', data);
   *   dp.data(el, data);
   *
   * @param {String} path path
   * @param {mixed} val value to set
   * @param {mixed} cpath Path of the container node (defaults to parentNode)
   */
  data(path, data, cpath, append) {
    const fpath = cpath ? cpath + path : path
    const el = this.getRef(fpath)

    // keep track of data we place.
    this.data.set(fpath, data)
  }

  /**
   *
   * Get reference by path.
   *
   * @param {String} path path
   * @param {String} cpath Container path
   * @returns {*}
   */
  getRef(path) {

    if (this.refs.has(path)) {
      return this.refs.get(path)
    }

    throw Error('Unknown path: ' + path)
  }

  /**
   *
   * Attach another dom pointer template
   * to this one.
   *
   */
  attach(dp, path) {
  }

  /**
   *
   * Supplies the maps associated with this template.
   *
   * @param name
   * @param {String} type map type, 'data|template'
   * @param map
   */
  link = function(name, type, map) {
    if (this.maps.hasOwnProperty(type)) {
      this.maps[type][name] = map
    } else {
      throw Error('Unkown mapping type: ' + type)
    }
  }

  setAttributes(map = [])  {
    this.change.attrs = map
    this.change.attrs.dirty = true
  }

  _init() {
     if (!this.refs.size) {
       if (this.replace) {
         this.el.innerHTML = ''
         this.el.appendChild(
           // not sure if I have to clone but I think so.
           this.template.cloneNode(true)
         )
         this.replace = false
       }
       this.parse(this.el)
     }
  }
  _applyAttributes() {
    const attrs = this.change.attrs
    if (attrs.dirty && attrs.length) {
      for(let change of attrs) {
        switch (change.op) {
          case 'add':
          case 'change':
            this.refs.get(change.path).setAttribute(change.name, change.val)
            break
          case 'remove':
            this.refs.get(change.path).removeAttribute(change.name)
            break
        }
        attrs.dirty = false
      }
    }
  }

  _applyData() {
    if (this.data.dirty) {

    }
  }

  /**
   * (Re)renders  the template.
   */
  render() {
    this._init()
    this._applyAttributes()
    this._applyData()
  }

}
