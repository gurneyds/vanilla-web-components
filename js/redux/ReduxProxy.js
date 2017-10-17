(function() {
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

    // The page will call this method to set the reducers
    set reducers(reducersArray) {
      this._reducers = reducersArray;
    }

    _setupInitialState() {
      console.log("initial state called");
      return {
        people: []
      }
    }

    // This is just for development purposes
    // Maybe the reducers could be passed in from the outside via a property on this component??
    _setupReducers() {
      console.log("setting up reducers");
      // TODO - connect with initial state somehow
      var personReducer = function(state = [], action) {
      console.log('Person reducer called with state:' + JSON.stringify(state) + " action:" + JSON.stringify(action));

      if(action.type === 'ADD-PERSON') {
          console.log('Adding a person');
          return state.concat(action.data);
      } else if(action.type === 'UPDATE-PERSON') {
          console.log('Updating a person');
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

    _setupEventListeners() {
      console.log("setting up event listeners");
      // Listen for events
      this.addEventListener('add_person', function(event){
        console.log("ReduxProxy received add-person event");

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

    _setupSubscribers() {
      console.log("setupSubscribers called");
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
