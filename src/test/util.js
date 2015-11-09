import { clean } from 'dom-clean'
export function createElement(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  clean(div)
  return div
}

export function printFrag(df) {
  const inner = document.createElement('div')
  for (const node of df.childNodes) {
    inner.appendChild(node.cloneNode(true))
  }
  console.log(inner.innerHTML)
}

export function click(el) {
  const ev = document.createEvent('MouseEvents')
  ev.initMouseEvent( /* deprecated but works */
    'click',
    true, true,
    document.defaultView,
    0, 0, 0, 0, 0,
    false, false, false,
    0,
    null, null
  )
  el.dispatchEvent(ev)
}

export function copy(obj) {
  return JSON.parse(JSON.stringify(obj))
}
