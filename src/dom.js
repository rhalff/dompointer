import DomPointerBase from './base'

export default class DomPointerDom extends DomPointerBase {
  constructor() {
    super()
    /**
     *
     * The documentFragment or HTMLElement acted upon
     *
     * @type {DocumentFragment|HTMLElement}
     * @private
     */
    this.node = null
  }
}
