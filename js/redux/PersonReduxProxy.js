(function() {
  var _template = `
    <script src="js/redux/ReduxProxy.js"></script>
  `;

  var actionMap =
    {
      add_person:'ADD-PERSON',
      update_person: 'UPDATE-PERSON',
      delete_person: 'DELETE-PERSON'
    };

  function InitialState() {
    return {
      people: []
    }
  }

  class PersonReduxProxy extends ReduxProxy {
    constructor() {
      super();
      console.log("PersonReduxProxy constructor called");
      this.attachShadow({mode: 'open'}).innerHTML = template;
    }

    connectedCallback() {
      console.log("PersonReduxProxy connectedCallback called");
      // events
      this._setupEventListeners();

      // action creator
      // reducers
      this._setupReducers();

      // subscriber
      this._setupSubscribers();
    }

    disconnectedCallback() {
    }

    _setupReducers() {
      var personReducer = function(state = [], action) {
        console.log('Person reducer called with state:' + JSON.stringify(state) + " action:" + JSON.stringify(action));

        if(action.type === 'ADD-PERSON') {
            return state.concat(action.data);
        } else if(action.type === 'UPDATE-PERSON') {
            return state.map(function(person){
              if(person.id === action.data.id) {
                return action.data;
              } else {
                return person;
              }
            });
        } else if(action.type === 'DELETE-PERSON') {
          return state.filter(function(person){
            if(person.id === action.data.id) {
              return false;
            } else {
              return true;
            }
          });
        } else {
          return state;
        }
      }

      // Return a single function
      var combinedReducers = Redux.combineReducers(
        {
          people: personReducer
        }
       );

       // Give this to the superclass
       this.addReducer(combinedReducers);
    }

    _setupEventListeners() {
      // Listen for events
      this.addEventListener('add_person', function(event){
        // Map the event to an action type and dispatch
        var actionType = actionMap['add_person'];

        // Dispatch the action with the event data
        this._store.dispatch( {type: actionType, data: event.detail} );
      });

      this.addEventListener('update_person', function(event){
        // Map the event to an action type and dispatch
        var actionType = actionMap['update_person'];

        // Dispatch the action with the event data
        this._store.dispatch( {type: actionType, data: event.detail} );
      });

      this.addEventListener('delete_person', function(event){
        // Map the event to an action type and dispatch
        var actionType = actionMap['delete_person'];

        // Dispatch the action with the event data
        this._store.dispatch( {type: actionType, data: event.detail} );
      });
    }

    // This component is a subscriber to the redux events
    _listener(context) {
      return function() {
        var personList = context.querySelector('person-list');

        if(personList) {
          // TODO - maybe use an attribute to specify the selector within the state tree?
          personList.setData(context._store.getState().people);
        }
      }
    }

    _setupSubscribers() {
//      this._store.subscribe(this._listener(this));
      this.addSubscriber(this._listener(this));
    }

  	static get observedAttributes() { return [] };

    attributeChangedCallback(name, oldValue, newValue) {
      // If an attribute is null it gets converted into the string 'null'. That seems so wrong, but it's reality.
      if(newValue != oldValue && newValue && newValue != 'null') {
        // Set the new value
        this[name] = newValue;
      }
    }
  }

  // Define our web component
  customElements.define('person-redux-proxy', PersonReduxProxy);
})();
