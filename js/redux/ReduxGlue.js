var reduxGlue = (function() {
  // The meta data drives all of the processing
  // the reducer can be passed in separately from the metaData if desired
  var _store;
  var _metaData;
  var _reducer;

  var setMetaData = function(metaData) {
    // TODO - There could be some code to validate the metaData

    _metaData = metaData;
    if(_metaData.reducer) {
      _reducer = metaData.reducer;
    }
    _createStore();
  }

  var setReducer = function(reducer) {
    _reducer = reducer;
    _createStore();
  }

  // Make sure that we have both a reducer and the meta data before creating the store
  var _createStore = function() {
    if(_reducer && _metaData) {
      _store = Redux.createStore(_reducer, _metaData.initialState);

      // These must be called after the store is setup so that the subscribers can be attached
      _setupEventListeners(_metaData);

      // An internal subscriber is used so that we can use a state selector before pasing to the subscribers
      _store.subscribe(_subscriber());
    }
  }

  var _setupEventListeners = function(metaData) {
    if(metaData && metaData.events) {
      var el = metaData.domEventListener;

      var store = _store;
      metaData.events.forEach(function(metaEvent){
        el.addEventListener(metaEvent.name, function(event){
          // By default dispatch the event action type and the event detail
          var action = {type: metaEvent.actionType, data: event.detail};

          // Call the action creator if provided
          if(metaEvent.actionCreator) {
            action = metaEvent.actionCreator();
          }

          // Dispatch the action with the event data detail
          store.dispatch(action);
        });
      });
    }
  }

  var _subscriber = function() {
    var metaData = _metaData;
    var theStore = _store;
    return function(myData) {
      if(metaData && metaData.subscribers) {
        var state = theStore.getState();

          metaData.subscribers.forEach(function(subscriber){
            var data = state;
            if(subscriber.stateSelector) {
              data = subscriber.stateSelector(state);
            }

            // Determine what the user has provided for a callback
            if(subscriber.callbackInfo) {
              if(typeof subscriber.callbackInfo === 'function') {
                // Call the function
                subscriber.callbackInfo(data);
              } else {
                // Now check to see that we have both a selector and a property
                var selectorParts = subscriber.callbackInfo.split(".");

                if(selectorParts.length === 2) {
                  // Select the element and call the function name
                  var el = subscriber.context.querySelector(selectorParts[0]);
                  if(el && el != null) {
                    var el = subscriber.context.querySelector(subscriber.elName);
                      el[selectorParts[1]] = data;
                  } else {
                    throw 'Cannot notify subscriber:"' + subscriber.name + '" because the calback selector element named:"' + subscriber.elName + '" did not find the element';
                  }
                } else {
                  throw 'Missing property for the subscriber:"' + subscriber.name + '". The callbackInfo must have both a selector and a property of the form name.property';
                }
              }
            } else {
              throw 'Missing callback information for subscriber:"' + subscriber.name + '"';
            }
          });
      }
    }
  }

  return {
    setMetaData: setMetaData,
    setReducer: setReducer
  }
})();
