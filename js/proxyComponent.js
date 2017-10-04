(function() {
	var _template = `
	<div class="error" style="display:none">
		An error has occurred ==> <span class="error-message"></span>
	</div>
	<div class="container">
		<slot></slot>
	</div>
	`;

	// Helper method to fetch data
	function getData(url, successCallback, failCallback) {
		fetch(url).then(function(response) {
			var contentType = response.headers.get("content-type");
			if(response.status === 200 && contentType && contentType.includes("application/json") && successCallback) {
				response.json().then(function(data){
					successCallback(data);
				});
			} else {
				failCallback(response);
			}
		})
		.catch(function(error) {
			console.log(error);
		});
	}

	// Helper method to walk the come and collect nodes that would like to receive data
	function prepareForWalk(node) {
		return function() {
			var rootNode = node;

			// Discover sub-components that have a data property
			walkTheDOM(node,
				function(node){
					// Check to see if the node contains any of the callback names
					rootNode._callbacks.forEach(function(cb){
						// NOTE: If a given node has more than one callback names that match, all callbacks will be called
						// in the order that they were discovered
						// TODO - Reflect will not work in IE11 - need to find another way to do this
						if(Reflect.has(node, cb.callback)) {
							// If this name has not been seen yet, create it
							if(!rootNode._listeners[cb.callback]) {
								rootNode._listeners[cb.callback] = [];
							}

							// Add this node to the name
							rootNode._listeners[cb.callback].push(node);
						}
					});
				}
			);

			// Now request the data
			// If there is a src, then go fetch the data and display it
			if(rootNode._src) {
				rootNode._fetchData();
			}
		}
	}

	// Recursively walk the DOM and call the callback function for all node that are elements
	function walkTheDOM(node, func) {
		// Only interested in node elements
		if(node.nodeType === 1) {
			func(node);
		}
		node = node.firstChild;
		while (node) {
			walkTheDOM(node, func);
			node = node.nextSibling;
		}
	}

	var DATA_RECEIVED_EVENT_NAME = 'proxy-comp-data-received';

	/*
	Proxy component that provides data to one or more sub-components
	Attributes:
		src: specifies where to get the data
		callbacks: specifies the name(s) of callbacks to discover in sub-components and to call when the data has been received
		data-received-event-name: specifies the name of the event that will be emitted when the data is received. A listeners could
			be provided that would intercept the data, transform it and then call back into the event target with some new data

		Example usage:
		<proxy-component src="/myPath/getData" callbacks="person,address,contact" data-received-event-name="myCustomEventName"></proxy-component>
	*/
	class ProxyComponent extends HTMLElement {
		constructor() {
			super();

			const template = _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;

			// Nodes that have the specified callback name(s) are stored here
			// Each object has a key (callback name) and an array of listeners
			this._listeners = {};
		}

		connectedCallback() {
			this.id = this.getAttribute('id');
			this.user = this.getAttribute('user');
			this.role = this.getAttribute('role');
			this._dataReceivedEventName = this.getAttribute('data-received-event-name') || DATA_RECEIVED_EVENT_NAME;
			this._callbackNames = (this.getAttribute('callbackNames') || '').split(',');

			// Trim any whitespace
			this._callbackNames = this._callbackNames.map(function(name){
				return name.trim();
			});

			this._prepareCallbacks();

			// Use a timeout because the slot components haven't been created yet
			// This will also fetch the data if a src attribute was provided
			setTimeout(prepareForWalk(this), 1);
		}

		/* Callbacks can have the following forms:
		 1-) organization:*			This will call organization and pass thru all of the data
		 2-) person:user			This will call person and only pass thru the user portion of the data
		 3-) person					This will call person and only pass thru the person portion of the data
		 4-) person:user.person		This will call person and only pass thru the user.person portion of the data

		 This function creates a data structure for the function name and the subTree
		*/
		_prepareCallbacks() {
			this._callbacks = [];
			var callbacks = this.getAttribute('callbacks') ? this.getAttribute('callbacks').split(',') : null;

			if(callbacks) {
				var that = this;
				callbacks.forEach(function(text){
					var parts = text.split(":");
					var subTree = '*';
					if(parts[1]){
						parts[1] = parts[1].trim();
						if(parts[1] != '*') {
							subTree = parts[1];
						}
					} else {
						subTree = parts[0].trim();
					}

					that._callbacks.push({callback: parts[0].trim(), subTree: subTree});
				})
			}
		}

		_fetchData() {
			getData(this._src, this._successCallback(this), this._failCallback(this));
		}

		disconnectedCallback() {
		}

		_successCallback(outer) {
			return function(data) {
				// Emit an event for anyone interested in this data
				var event = new CustomEvent(outer._dataReceivedEventName, {
					detail:data,
					bubbles: true,
					cancelable: true
				});
				if(outer.dispatchEvent(event)) {
					// This will send the original data - not the transformed data
					outer._notifyListeners(data);
				}//else {
					// The intercepter will call set the transformed data by calling the data property
				//}
			}
		}

		_failCallback(outer) {
			return function(response) {
				outer.shadowRoot.querySelector('.container').style.display = "none";
				outer.shadowRoot.querySelector('.error').style.display = "block";
				outer.shadowRoot.querySelector('.error-message').textContent = " URL=" + response.responseURL + " with status " + response.status + " ==>" + response.statusText;
			}
		}

		// Send the data to the listeners
		_notifyListeners(data) {
			if(this._callbacks && this._callbacks.length > 0) {
				var that = this;
				// Forward the information to the sub-components
				this._callbacks.forEach(function(cb){
					if(that._listeners && that._listeners[cb.callback]){
						that._listeners[cb.callback].forEach(function(listener){
							// This is the data that will be sent to the listener
							var sendData = data;

							// See the comments above for the cases
							if(cb.subTree === '*') {
								sendData = data;				// Send all data
							} else if(cb.subTree != null) {
								sendData = data[cb.subTree];	// Send a portion of the data - with the name of the subTree
							} else if(cb.subTree === '') {
								sendData = data[cb.callback];		// Send a portion of the data - with the same name as the callback
							}

							listener[cb.callback] = sendData;
						})
					}
				});
			}
		}

		set data(data) {
			this._notifyListeners(data);
		}

		get src() {
			return this._src;
		}

		set src(src) {
			this.setAttribute('src', src);
		}

		static get observedAttributes() { return ['src'] };

		attributeChangedCallback(name, oldValue, newValue) {
			// If an attribute is null it gets converted into the string 'null'. That seems so wrong, but it's reality.
			if(newValue != oldValue && newValue && newValue != 'null') {
				if(name === 'src') {
					this._src = newValue;
					this._fetchData();
				}
			}
		}
	}

	// Define our web component
	customElements.define('proxy-component', ProxyComponent);
})();
