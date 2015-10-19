# Template Mapping


The template map names the relevant positions within the template.

Throughout the other kind of mapping definitions these names will be used to refer to the correct element within the template.


```javascript
{
  "item-heading":    ":0:0:0:0:0",
  "title":           ":0:0:1:1:0",
  "name":            ":0:0:1:1:1",
  "description":     ":0:0:1:1:2",
  "table-heading-1": ":0:0:1:1:3:0:0:0",
  "table-heading-2": ":0:0:1:1:3:0:0:1",
  "table-heading-3": ":0:0:1:1:3:0:0:2",
  "table-cell-1":    ":0:0:1:1:3:1:0:2:0:0",
  "table-cell-2":    ":0:0:1:1:3:1:0:2:0:1",
  "table-cell-3":    ":0:0:1:1:3:1:0:2:0:2"
}
```

Upon placement of the template the references to these names will be stored.

The template itself will be left untouched.

A template managed by a DomPointer instance, will always be kept as reference as a DocumentFragment.
This fragment is immutable, it keeps the orginal state.

All instances of the template are derived from this original template.

If a instance of the template which is placed within the dom is modified the references itself will
not be renumbered.

