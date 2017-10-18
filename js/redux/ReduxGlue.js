var reduxGlue = (function() {
  console.log("ReduxGlue internals");

  // The meta data drives all of the processing
  var _store;
  var _metaData;

  var setMetaData = function(metaData) {
    console.log("setMetaData called with:" + JSON.stringify(metaData));
    _metaData = metaData;
    _setupEventListeners(metaData);
    _setupSubscribers(metaData);

    _store = Redux.createStore(_reducers, _initialState);
  }

  setTimeout(function () {
    console.log("ReduxGlue after timeout");
    _store = Redux.createStore(_metaData.reducer, _metaData.initialState);
  });

  _setupEventListeners(metaData) {
    if(metaData && metaData.events) {
      var el = metaData.domEventListener;

      metaData.events.forEach(function(event){
        el.addEventListener(event.name, function(event){
          // By default dispatch the event action type and the event detail
          var action = {type: event.actionType, data: event.detail};

          // Call the action creator if provided
          if(event.actionCreator) {
            action = event.actionCreator();
          }

          // Dispatch the action with the event data
          this._store.dispatch(action);
        });
      });
    }
  }

  _setupSubscribers(metaData) {
    if(metaData && metaData.subscribers) {
      metaData.subscribers.forEach(function(subscriber){
        // Use the callback function if provided
        if(subscriber.callbackFn) {
          _store.subscribe(subscriber.callbackFn);
        } else {
          // Select the element and call the function name
          var el = subscriber.context.querySelector(subscriber.elName);
          if(el) {
            el.funcName();
          }
        }
      });
    }
  }

  return {
    setMetaData: setMetaData
  }
})();
