# Source Listing

```HTML
<ul>
  <li class="item-{{$index}}">
    <!-- index --> - <!-- Firstname --> <!-- Lastname -->
  </li>
</ul>
```

How to do that index thing, I would think just prepare it.
Unrelated to whether it is the index or not.

Something like:

```JSON
item.index
item.name.first
item.name.last
```

```JSON
[
  "persons": [
    { "id": 1, "firstname": "Rob", "lastname": "Halff" }
    { "id": 2, "firstname": "Robb", "lastname": "Halff" }
  ]
]
```

```JSON
{
  "template": {
    {
      "list-item": ":0:0"
    }
  },

  //  
  "data": {
    "default": {
      "list-item": {
         "path": "persons",
         "attrs": {
           "class": {
             "add": "item-${$index}"
           }
         },
         "items": {
           ":0": "id",
           ":1": "firstname",
           ":2": "lastname"
         }
      }
    }
  }

}
```