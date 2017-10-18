(function(eventListener) {
  console.log("Inside of PersonService.js");

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
          elName: 'person-list',
          funcName: 'data',
          callbackFn: function() {console.log('This is an optional callback function. If present it is called, otherwise the element is selected and the function is called.')},
          stateSelector: function(state) {return state.person;}
        }
      ]
    }
  );

  function setupReducers() {
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
      } else if(action.type === 'REMOVE_ALL_PERSON') {
        return [];
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

  // Pass all the info to the redux glue code
  reduxGlue.setMetaData( metaData )
})(document.querySelector('body')); // The event listener is passed in
