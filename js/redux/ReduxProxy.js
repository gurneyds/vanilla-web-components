(function() {
  var _template = `
    <div class="container">
      <slot></slot>
    </div>
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

  class ReduxProxy extends HTMLElement {
    constructor() {
      super();
      this._reducers = [];

      this.attachShadow({mode: 'open'}).innerHTML = _template;
    }

    connectedCallback() {
      console.log("connected callback");
      var initialState = this._setupInitialState();
      var reducers = this._setupReducers();
      this._store = Redux.createStore(reducers, initialState);
      this._setupSubscribers();
      this._setupEventListeners();
    }

    disconnectedCallback() {
    }

    // TODO Maybe the page will call this method to set the reducers??
    set reducers(reducersArray) {
      this._reducers = reducersArray;
    }

    // TODO - maybe have the outside caller pass this in? Or a subclass?
    _setupInitialState() {
      return {
        people: []
      }
    }

    // This is just for development purposes
    // TODO Maybe the reducers could be passed in from the outside via a property on this component??
    _setupReducers() {
      // TODO - connect with initial state somehow
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
      return Redux.combineReducers(
        {
          people: personReducer
        }
       );
    }

    // TODO - maybe a subclass would set this up, or attribute would specify the eventname/actiontype mapping
    _setupEventListeners() {
      console.log("setting up event listeners");
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

    // TODO - maybe a subclass would setup the subscribers, or maybe some attributes to specify a callback function
    // and walk the DOM to find nodes that have the callback function
    _setupSubscribers() {
      this._store.subscribe(this._listener(this));
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
  customElements.define('redux-proxy', ReduxProxy);
})();
