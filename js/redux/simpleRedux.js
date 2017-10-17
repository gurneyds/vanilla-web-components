// This is a simple example of using redux
var redux = require('redux');

var initialState =
  {
    names: [],
    offices: []
  };

var namesReducer = function(state = initialState.names, action) {
  if(action.type === 'ADD_NAME') {
    return state.concat(action.data);
  } else if(action.type === 'REMOVE_NAME') {
    return state.filter(name => {
      if(name && name.id !== action.data.id) {
        return name;
      }
    });
  } else if(action.type === 'RESET_NAME') {
    return [];
  } else if(action.type === 'UPDATE_NAME') {
    return state.map(name => {
      if(name.id === action.data.id) {
        return action.data;
      } else {
        return name;
      }
    });
  }
  return state;
}

var officesReducer = function(state = initialState.offices, action) {
  if(action.type === 'ADD_OFFICE') {
    return state.concat(action.data);
  } else if(action.type === 'REMOVE_OFFICE') {
    return state.filter(office => {
      if(office && office.id !== action.data.id) {
        return office;
      }
    });
  } else if(action.type === 'RESET_OFFICE') {
    return [];
  } else if(action.type === 'UPDATE_OFFICE') {
      return state.map(name => {
        if(name.id === action.data.id) {
          return action.data;
        } else {
          return name;
        }
      });
}
  return state;
}

var reducers = redux.combineReducers(
  {
    names: namesReducer,
    offices: officesReducer
  }
 );

// Create the store, pass in the reducer and the initial state
var store = redux.createStore(reducers, initialState);

// subscribers
var mySubscriber = function(state) {
  console.log("mySubscriber called with state:" + JSON.stringify(state));
}

// Register the subscriber
store.subscribe(() => mySubscriber(store.getState()));

// Dispatch an event
store.dispatch( {type: 'ADD_NAME', data: {id:1, name:'George', role:'Manager'}} );
store.dispatch( {type: 'ADD_NAME', data: {id:2, name:'Henry', role:'QA'}} );
store.dispatch( {type: 'UPDATE_NAME', data: {id:2, name:'Henry2', role:'QA2'}} );
store.dispatch( {type: 'ADD_OFFICE', data: {id:10, name:'FSB', location:'Lehi'}} );
store.dispatch( {type: 'ADD_OFFICE', data: {id:11, name:'ROB', location:'Riverton'}} );
store.dispatch( {type: 'UPDATE_OFFICE', data: {id:11, name:'ROB2', location:'Riverton2'}} );
store.dispatch( {type: 'REMOVE_OFFICE', data: {id:11}} );
store.dispatch( {type: 'RESET_OFFICE'} );
store.dispatch( {type: 'REMOVE_NAME', data: {id:1}} );
store.dispatch( {type: 'RESET_NAME'} );
