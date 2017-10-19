(function(eventListener) {
  // Setup the metaData for the ReduxGlue module
  var metaData =
    {
      initialState:{
        people: []
      },
      domEventListener: eventListener,
      events: [
        {
          name: 'add_person',
          actionType: 'ADD-PERSON'
        },
        {
          name: 'update_person',
          actionType: 'UPDATE-PERSON'
        },
        {
          name: 'delete_person',
          actionType: 'DELETE-PERSON'
        },
        {
          name: 'remove_all_person',
          actionCreator: function() { return {type: 'REMOVE_ALL_PERSON'} }
        }
      ],
      reducer:setupReducers(),
      subscribers: [
        {
          // Provide enough information to find a function in a component
          context: eventListener, // This is the context from which the element is selected. This could be important for shadow dom elements
          elName: 'person-list',
          funcName: 'data',

          // Or just supply a callback function - which could be a method in a component
          callbackFn: function(data) {myCallbackFn(data);},
          // Not sure we need this. If we have an internal subscriber, then this could filter the state tree
          stateSelector: function(state) {return state.people;}
        }
      ]
    };

  function myCallbackFn(data) {
    console.log('Made it to the callbackFn');
    eventListener.querySelector('person-list').setData(data);
  }

  // TODO - we would probably want to externalize the reducers, but that would require gulp or webpack
  function setupReducers() {
    var personReducer = function(state = [], action) {
      console.log('Person reducer called with state:' + JSON.stringify(state) + " action:" + JSON.stringify(action));

      if(action.type === 'ADD-PERSON') {
        state.push(action.data);
        return state;
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
      } else if(action.type === 'REMOVE_ALL_PERSON') {
        return state.filter(function(person){return false;});
      } else {
        return state;
      }
    }

    // Return a single function - this is not needed for a single reducer. If there is more than one reducer, then this is necessary
    return Redux.combineReducers(
      {
        people: personReducer
      }
     );
  }

  // Pass all the info to the redux glue code
  reduxGlue.setMetaData( metaData )
})(document.querySelector('body')); // The event listener is passed in
