Dom Pointer
==========

Positional Templating


```html
     <div id="example" class="panel panel-default">
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
    import DomPointer from 'dompointer'

    const el = document.querySelector('#example')
    const dp = DomPointer:create(el, { comments: false })
    dp.data(':0', 'Dom Pointer')
    dp.data(':1', 'Pointers for a simple template engine');
    dp.setAttibutes([
      { op: 'remove', 'path': ':0', name: 'class', val: 'panel-heading'}
      { op: 'add', 'path': ':0', name: 'class', val: 'panel-heading'}
    ])

```

Tests
-----

Client Side:

```
npm run test
```

Server Side:

```
TODO
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/rhalff/dompointer/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

