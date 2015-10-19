Dom Pointer
==========

Positional Templating


```html
     <div class="panel panel-default">
        <!-- Default panel contents -->
        <div class="panel-heading">Panel heading</div>
        <div class="panel-body">
          <p>Some default panel content here.</p>
        </div>

        <!-- List group -->
        <ul class="list-group">
          <li class="list-group-item">Cras justo odio</li>
          <li class="list-group-item">Dapibus ac facilisis in</li>
          <li class="list-group-item">Morbi leo risus</li>
          <li class="list-group-item">Porta ac consectetur ac</li>
          <li class="list-group-item">Vestibulum at eros</li>
        </ul>
      </div>
    </div>
```

```

    var map = [];
    map.push(':0');   // panel-heading
    map.push(':1');   // panel-body
    map.push(':2:0'); // first list item
    map.push(':2:*'); // all list items

    dp =  new DomPointer(document.querySelector('.panel'), map);

    var refs = dp.getRefs();
    refs[':0'].style.fontSize = '2em';
    refs[':0'].innerHTML = 'Dom Pointer';
    refs[':1'].innerHTML = 'Pointers for a simple template engine';
    refs[':2:0'].style.fontWeight = 'bold';

    $(refs[':2:*']).css('color', 'blue');

```

Tests
-----

Client Side:

```
grunt test
```

Server Side:

```
TODO
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/rhalff/dompointer/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

