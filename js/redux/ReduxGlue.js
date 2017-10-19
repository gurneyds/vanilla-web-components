var reduxGlue = (function() {
  // The meta data drives all of the processing
  var _store;
  var _metaData;

  var setMetaData = function(metaData) {
    _metaData = metaData;
    _store = Redux.createStore(metaData.reducer, metaData.initialState);

    // These must be called after the store is setup so that the subscribers can be attached
    _setupEventListeners(metaData);
    _store.subscribe(_subscriber());
  }

  // This is done to make sure that the page elements are ready
  setTimeout(function () {
    _store = Redux.createStore(_metaData.reducer, _metaData.initialState);
  });

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

          // Dispatch the action with the event data
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

            // Use the callback function if provided
            if(subscriber.callbackFn) {
              subscriber.callbackFn(data);
            } else {
              // Select the element and call the function name
              var el = subscriber.context.querySelector(subscriber.elName);
              if(el) {
                // TODO - this probably won't work, funcName is a string
                var el = subscriber.context.querySelector(subscriber.elName);
    //            el.funcName()
              }
            }
          });
      }
    }
  }

  return {
    setMetaData: setMetaData
  }
})();
