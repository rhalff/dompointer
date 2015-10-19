# Example

As example we will take the flux-challenge.

The following HTML is used:

```HTML
<div class="app-container">
  <div class="css-root">
    <h1 class="css-planet-monitor">Obi-Wan currently on Tatooine</h1>

    <section class="css-scrollable-list">
      <ul class="css-slots">
        <li class="css-slot">
          <h3>Jorak Uln</h3>
          <h6>Homeworld: Korriban</h6>
        </li>
        <li class="css-slot">
          <h3>Skere Kaan</h3>
          <h6>Homeworld: Coruscant</h6>
        </li>
        <li class="css-slot">
          <h3>Na'daz</h3>
          <h6>Homeworld: Ryloth</h6>
        </li>
        <li class="css-slot">
          <h3>Kas'im</h3>
          <h6>Homeworld: Nal Hutta</h6>
        </li>
        <li class="css-slot">
          <h3>Darth Bane</h3>
          <h6>Homeworld: Apatros</h6>
        </li>
      </ul>

      <div class="css-scroll-buttons">
        <button class="css-button-up"></button>
        <button class="css-button-down"></button>
      </div>
    </section>
  </div>
</div>
```

DOM Pointer itself does not know any variable declarations nor logic.
We will use HTML comments to give the reader of the template an idea what is the purpose of the template.

Slightly modified our base template will be:

```HTML
<div class="app-container">
  <div class="css-root">
    <h1 class="css-planet-monitor">Obi-Wan currently on <!-- The Current Planet --></h1>

    <section class="css-scrollable-list">
      <ul class="css-slots">
        <li class="css-slot">
          <h3><!-- Jedi Slot 1 --></h3>
          <h6>Homeworld: <!-- Homeworld Slot 1 --></h6>
        </li>
        <li class="css-slot">
          <h3><!-- Jedi Slot 2 --></h3>
          <h6>Homeworld: <!-- Homeworld Slot 2 --></h6>
        </li>        
        <li class="css-slot">
          <h3><!-- Jedi Slot 3 --></h3>
          <h6>Homeworld: <!-- Homeworld Slot 3 --></h6>
        </li>
        <li class="css-slot">
          <h3><!-- Jedi Slot 4 --></h3>
          <h6>Homeworld: <!-- Homeworld Slot 4 --></h6>
        </li>
        <li class="css-slot">
          <h3><!-- Jedi Slot 5 --></h3>
          <h6>Homeworld: <!-- Homeworld Slot 5 --></h6>
        </li>
      </ul>
      <div class="css-scroll-buttons">
        <button class="css-button-up"></button>
        <button class="css-button-down"></button>
      </div>
    </section>
  </div>
</div>
```

Now we have our template prepared we can begin creating our template mapping.
We will define which part of the template are important to use.

In our case these will be:

  - The current planet within the h1 header.
  - The five different slots
  - The nested h3 and h6 parts within each slot
  - The up button
  - The down button

To make our lives a bit easier and not having to hand count all the positions we can use the `dp` utility which comes with Dom Pointer.


```bash
$ dp dashboard.html | grep -E 'h1|css-slot|h3|h6|css-button'

:0:0: h1 class="css-planet-monitor"
:0:1:0: ul class="css-slots"
:0:1:0:0: li class="css-slot"
:0:1:0:0:0: h3
:0:1:0:0:1: h6
:0:1:0:1: li class="css-slot"
:0:1:0:1:0: h3
:0:1:0:1:1: h6
:0:1:0:2: li class="css-slot"
:0:1:0:2:0: h3
:0:1:0:2:1: h6
:0:1:0:3: li class="css-slot"
:0:1:0:3:0: h3
:0:1:0:3:1: h6
:0:1:0:4: li class="css-slot"
:0:1:0:4:0: h3
:0:1:0:4:1: h6
:0:1:1:0: button class="css-button-up"
:0:1:1:1: button class="css-button-down"

```

Given this information we can build the template map:
```JSON
{
  "planet-monitor": ":0:0",
  "slot-1": ":0:1:0:0",
  "slot-2": ":0:1:0:1",
  "slot-3": ":0:1:0:2",
  "slot-4": ":0:1:0:3",
  "slot-5": ":0:1:0:4",
  "button-up": ":0:1:1:0",
  "button-down": ":0:1:1:1"
}
```

This map tells us which references we should keep for this template.
These will be the only ones available for the rest of our mappings.
Or at least the ones we can reference by name.

We can still access child nodes by numeric path relative to their named ancestors.

### Data Mapping

The first thing we will determine is our data needs, for each use case of this template we will define a data map.

The first one is easy, we will need to change the title for the current planet.

The data structure which will provide input for this will look like:
```JSON
{
  "id": 1,
  "name": "Planet Name"
}
```

The data map for this will look like:

```JSON
{
  "planet-monitor": "name"
}
```

Left is the named path `planet-monitor` and on the right is the (dotted) path to our object property which in this case is just `name`.

This map will need a name, so we can refer to it once our data arrives, we'll name it `planet-name`.

```javascript
dp.link('planet-name', 'data', dmap);
```

The next thing we need  to do is to define data maps for all those slots. While the requirements of our example really require slots and not just a simple repeat, we'll have to define data maps for all of them.

The data will look something like:
```JSON
{
  "id":2941,
  "name":"Exar Kun",
  "homeworld": {
    "id": 58,
    "name": "Coruscant"
  }
}
```

And thus our data map looks like:
```JSON
{
  "slot1": {
    ":0": "name",
    ":1": "homeworld.name" 
  }
}
```

The reason we do not define the other slots within this map is directly related to the input data. If we would receive all the slots at once we *could* define them all at once, but we'll
get the data for the slots and different moments.

Assuming we have defined the maps for all five slots, we can now add them:
```javascript
dp.link('slot-1', 'data', dmapSlot1);
dp.link('slot-2', 'data', dmapSlot2);
dp.link('slot-3', 'data', dmapSlot3);
dp.link('slot-4', 'data', dmapSlot4);
dp.link('slot-5', 'data', dmapSlot5);
```

Our template is already becoming a lot more smarter. We've defined all possible data inputs and learned the engine where to place this incoming data.

To update the template at any moment with new data we can use:
```javascript
// update slot 1
dp.data('slot-1', someJedi);

// change planet
dp.data('planet-name', newPlanet);
```

Remember, we know the references, we've defined them ourselves.

### Event Mapping


While the requirements of the example are fairly simple, all we are left to do is define the events for the buttons.

```javascript
dp.addEventHandler('click', 'button-up', upHandler);
dp.addEventHandler('click', 'button-down', downHandler);
```
TODO: these should be also within event maps, this will be important when we are starting to use states.

The handlers itself will receive an event object.

### Attribute Mapping

The state of the attributes and classes for this example will mostly stay the same.
There are only two state changes defined and this will occur within the slots when we will have to red mark a dark Jedi and when scroll must be deactivated (IIRC).

Although in this case the state changes are dependent on the input data we will not let the
data trigger this change automatically.

We will define the states of these attributes in attribute maps. This separation is important.
Because we might just as well have state changes within the template which are not related to any of the data which is currently being displayed within the template itself.

Having made this distinction, we can now use the attribute map while filling the template.
Because in our case it does depend on the incomming data and well have to switch the state along with the data change. (TODO: can be done in a lot of other ways also, predefined selectors for example)

```JAVASCRIPT
dp.data('planet-name', newPlanet, { state: 'is-dark' }); // something like that.
```

Where a state can include an attribute map or event map.


Disabled button state:
```JSON
{
  "button-up": {
    "class": "css-button-disabled"
  }
}
```

Dark-Jedi state (ok this must be made re-useable classlike):
```JSON
{
  ":": {
    "class": "dark-jedi" // where : means self
  }
}
```

Class states are short lived... + - none

TODO: need to define when a state seizes to exist. one case is on data refresh.

 - \+ will persist the class
 - \- will permanently remove the class
 - none will make it short lived.

Also decided whether attributes and class should be separated or treated as one.

### States

The template map and the data maps for our base definition.
An instance of dom pointer will contain exactly one template and might have
multiple data maps defined.

The attribute maps and eventMaps are always contained within a state.

For attributes the default state is what is defined within the initial template. 

Thus the default attribute map for our template looks like:

```JSON
{
  "planet-monitor": { "class": "css-planet-monitor" },
  "slot-1": { "class": "css-slot" },
  "slot-2": { "class": "css-slot" },
  "slot-3": { "class": "css-slot" },
  "slot-4": { "class": "css-slot" },
  "slot-5": { "class": "css-slot" },
  "button-up": { "class": "css-button-up" },
  "button-down": { "class": "css-button-down" }
}
```

This attribute maps is automatically constructed, when our template is loaded.



### Modification

Still being alpha software dom pointer does not have any UI based editors yet. This makes modifying the initial html more problematic because we will also have to change the definitions in our template map.

For now these should indeed be updated by hand.