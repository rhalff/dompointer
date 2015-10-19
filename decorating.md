# Decorating

So, we would need another map for the decorations.
{
  name: ourDecorator(params)
}
In which case when we process name, we will use a non-innerHTML
decorator, and do whatever needs to be done with ns & name.

For these decorators to be data like, they should also be named.
And all will only accept one parameter, where the params are an
object of data.

Decorator Map:

 "item-heading": "innerHTML",
 "title": "innerHTML",
 "name": "somethingFancy",
 "description": "innerHTML",
 "table-heading-1": "innerHTML",
 "table-heading-2": "innerHTML",
 "table-heading-3": "innerHTML",
 "table-cell-1": "innerHTML",
 "table-cell-2": "innerHTML",
 "table-cell-3": "innerHTML"

First decorator which comes to mind is actually a sub template.
A characteristic of these decorators is, that whatever the
pointer points to, it's innerHTML it's children will be replaced.

The decorators never will expect existing children.

 - innerHTML (default) (probably give it a different name)
             Is actually not a decorator, it will be the default
             when no decorator is present.

 - template  (sub template)
 - join      (just flatten it)
 - list      (create a list) (neh)
 - etc.

Anyway should solve this, because it's rather important for it
to be useful.

I could use the filter syntax here, or a variant of it.
Or just how simph worked.

e.g.

"name": "somethingFancy|param1:param2"

I still miss some kind of composition map which sub templates
should also use. Cause subtemplates create the problem of pointing to
them. And the best way of pointing to them is using id's.
So let it be an uuid.



module.exports = dataMap;

var dataMap = {
  "item-heading": "name",
  "title": "name",
  // goes to string, must know how to flatten the array.
  "name": ["ns","name"],
  "description": "description",
  // not within the data, so in a way does not belong to
  // the data also. it's more of a statics data.
  // so would need an extra static map for that
  "table-heading-1": "Title",
  "table-heading-2": "",
  "table-heading-3": "",

  // ok this ain't gonna work yet.
  "table-cell-1": "ports.input.app.title.",
  "table-cell-2": "",
  "table-cell-3": ""
};

/**
 * not totally correct
 * also little decorations come to mind ns:name
 * a decoration which is input data dependend.
 * and thus not really belong to the template.
 **/