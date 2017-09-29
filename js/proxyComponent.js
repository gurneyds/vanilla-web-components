(function() {
	var _template = `
	<div class="error" style="display:none">
		An error has occurred ==> <span class="error-message"></span>
	</div>
	<div class="container">
		Proxy component
		<slot name="slot1"></slot>
		<slot name="slot2"></slot>
		<slot name="slot3"></slot>
	</div>
	`;

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

	function prepareForWalk(node) {
		return function() {
			var rootNode = node;

			// Discover sub-components that have a data property
			return walkTheDOM(node,
				function(node){
					if(Reflect.has(node, 'componentData')) {
						console.log("found data property. Node type:" + node.nodeType);
						rootNode._listeners.push(node);
					}
				}
			);
		}
	}

	// Recursively walk the DOM and call the callback function
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
	This is an example of a proxy component that provides data to one or more sub-components1
	*/
	class ProxyComponent extends HTMLElement {
		constructor() {
			super();
			console.log("ProxyComponent constructor called");

			const template = _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;

			// After construction nodes that have the componentData property are stored here
			this._listeners = [];
		}

		connectedCallback() {
			console.log("ProxyComponent connectedCallback called");
			this.id = this.getAttribute('id');
			this.user = this.getAttribute('user');
			this.role = this.getAttribute('role');
			this.src = this.getAttribute('src');

			// Use a timeout because the slot components haven't been created yet
			setTimeout(prepareForWalk(this), 1);

			// If there is a src, then go fetch the data and display it
			if(this._src) {
				this._fetchData();
			}
		}

		_fetchData() {
			getData(this._src, this._successCallback(this), this._failCallback(this));
		}

		disconnectedCallback() {
		}

		_successCallback(outer) {
			return function(data) {
				// Forward the information to the sub-components
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
