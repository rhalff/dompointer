# Source Listing (Compact)

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


```JSON
{
  "template": {
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
  },

  "data": {
    "planet": {
      "planet-monitor": "name"
    },
    "slot1": {
      "slot-1": {
        ":0": "name",
        ":1:1": "homeworld.name"
      }
    },
    "slot2": {
      "slot-2": {
        ":0": "name",
        ":1:1": "homeworld.name"
      }
    },
    "slot3": {
      "slot-3": {
        ":0": "name",
        ":1:1": "homeworld.name"
      }
    },
    "slot4": {
      "slot-4": {
        ":0": "name",
        ":1:1": "homeworld.name"
      }
    },
    "slot5": {
      "slot-5": {
        ":0": "name",
        ":1:1": "homeworld.name"
      }
    }
  },

  "state": {

     "move-up": {
       "button-up": {
         "events": {
           "click": "MOVE.UP"
         }
       }
     },

     "move-down": {
       "button-down": {
         "events": {
           "click": "MOVE.DOWN"
         }
       }
     },

     "disable-up": {
        "button-up": {
          "attributes": {
            "class": {
              "add": "css-button-disabled"
            }
          },
          "events": {}
        }
     },

     "disable-down": {
        "button-down": {
          "attributes": {
            "class": {
              "add": "css-button-disabled"
            }
          }
        }
     },

     "dark-jedi-found": {
        ":": {
          "attributes": {
            "class": {
              "add": "dark-jedi"
             }
          }
        }
     }
  }

```

*app.js*
```javascript

dp.map(map);

/*
dp.link('planet-name', 'data', dmap);
dp.link('slot-1', 'data', dmapSlot1);
dp.link('slot-2', 'data', dmapSlot2);
dp.link('slot-3', 'data', dmapSlot3);
dp.link('slot-4', 'data', dmapSlot4);
dp.link('slot-5', 'data', dmapSlot5);
*/
// update slot 1
dp.data('slot-1', someJedi);

// change planet
dp.data('planet-name', newPlanet);
```
