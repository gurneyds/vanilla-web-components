(function() {
	var _template = `
	<div class="error" style="display:none">
		An error has occurred ==> <span class="error-message"></span>
	</div>
	<div class="container">
		<slot name="slot1"></slot>
		<slot name="slot2"></slot>
		<slot name="slot3"></slot>
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
					rootNode._callbackNames.forEach(function(name){
						// NOTE: If a given node has more than one callback names that match, all callbacks will be called
						// in the order that they were discovered
						if(Reflect.has(node, name)) {
							// If this name has not been seen yet, create it
							if(!rootNode._listeners[name]) {
								rootNode._listeners[name] = [];
							}

							// Add this node to the name
							rootNode._listeners[name].push(node);
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

	/*
	Proxy component that provides data to one or more sub-components1
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
			this.src = this.getAttribute('src');
			this._callbackNames = (this.getAttribute('callbackNames') || '').split(',');

			// Trim any whitespace
			this._callbackNames = this._callbackNames.map(function(name){
				return name.trim();
			});

			// Use a timeout because the slot components haven't been created yet
			// This will also fetch the data if a src attribute was provided
			setTimeout(prepareForWalk(this), 1);
		}

		_fetchData() {
			getData(this._src, this._successCallback(this), this._failCallback(this));
		}

		disconnectedCallback() {
		}

		_successCallback(outer) {
			return function(data) {
				if(outer._callbackNames && outer._callbackNames.length > 0) {
					// Forward the information to the sub-components
					outer._callbackNames.forEach(function(name){
						if(outer._listeners && outer._listeners[name]){
							outer._listeners[name].forEach(function(listener){
								listener[name] = data;
							})
						}
					});
				}
			}
		}

		_failCallback(outer) {
			return function(response) {
				outer.shadowRoot.querySelector('.container').style.display = "none";
				outer.shadowRoot.querySelector('.error').style.display = "block";
				outer.shadowRoot.querySelector('.error-message').textContent = " URL=" + response.responseURL + " with status " + response.status + " ==>" + response.statusText;
			}
		}

		get src() {
			return this._src;
		}

		set src(src) {
			this._src = src;
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
