(function(eventListener) {
  // Setup the metaData for the ReduxGlue module
  var metaData =
    {
      domEventListener: eventListener,
      events: [
        {
          // Event name
          name: 'add_person',

          // Action type to dispatch with the event data detail
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

          // If provided the action creator function is called and passed to the dispatcher
          actionCreator: function() { return {type: 'REMOVE_ALL_PERSON'} }
        }
      ],
      reducer:setupReducers(),
      subscribers: [
        {
          // This is here entirely for error reporting
          name: '<person-list>',

          // callbackInfo can either be a selector string and property  (selector.property)
          // or a function
          callbackInfo2: 'person-list.data',
          callbackInfo: function(data) {myCallbackFn(data);},

          // This is optional. If provided the function receives the state and can return a portion of the state tree
          stateSelector: function(state) {return state.people;}
        }
      ]
    };

  function myCallbackFn(data) {
    console.log('Made it to the callbackFn');
    eventListener.querySelector('person-list').data = data;
  }

  // TODO - we would probably want to externalize the reducers, but that would require gulp or webpack
  // The method setReducer(reducer) could be called on ReduxGlue
  function setupReducers() {
    var personReducer = function(state = [], action) {
      if(action == null) {
        return state;
      }

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
      } else if(action.type === 'REMOVE_ALL_PERSON') {
        return [];
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
