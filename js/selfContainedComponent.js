(function() {
	var _styles = `
	<style>
		.container {
			border: 1px solid blue;
			display: grid;
			grid-template-columns: 1fr;
		}
		.url-contents {
			border: 1px solid red;
		}
		.error {
			color: red;
			border: 1px solid red;
			font-weight: bold;
			font-size: 200%;
		}
	</style>
	`;

	var _template = `
		<div class="error" style="display:none">
			An error has occurred ==> <span class="error-message"></span>
		</div>
		<div class="container">
			<div class="id"></div>
			<div class="user"></div>
			<div class="role"></div>
		</div>
	`;

	// Helper function to get a url
	var HttpClient = function() {
		this.get = function(url, successCallback, failCallback) {
			var request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200 && successCallback) {
					successCallback(request);
				} else if(request.readyState == 4 && request.status != 200 && failCallback) {
					failCallback(request);
				}
			}
			request.open( "GET", url, true );
			request.send( null );
		}
	}

	/*
	This is an example of a stand-alone component that would fetch it's own data
	*/
	class SelfContainedComponent extends HTMLElement {
		constructor() {
			super();

			const template = _styles + _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
			this._id = this.getAttribute('id');
			this._user = this.getAttribute('user');
			this._role = this.getAttribute('role');
			this._url = this.getAttribute('url');

			// If there is a url, then go fetch the data and display it
			if(this._url) {
				this._fetchData();
			} else {
				// Use the attributes
				var data = {
					id: this._id,
					user: this._user,
					role: this._role
				};
				this._render(data);
			}
		}

		_fetchData() {
			var client = new HttpClient();
			client.get(this._url, this._successCallback(this), this._failCallback(this));
		}

		disconnectedCallback() {
		}

		_successCallback(outer) {
			return function(response) {
				// TODO - Take a look at the response to see if it is the correct type and will convert to JSON
				outer._render(JSON.parse(response.responseText));
			}
		}

		_render(data) {
			this.shadowRoot.querySelector('.id').textContent = data.id;
			this.shadowRoot.querySelector('.user').textContent = data.user;
			this.shadowRoot.querySelector('.role').textContent = data.role;
		}

		_failCallback(outer) {
			return function(response) {
				outer.shadowRoot.querySelector('.container').style.display = "none";
				outer.shadowRoot.querySelector('.error').style.display = "block";
				outer.shadowRoot.querySelector('.error-message').textContent = " URL=" + response.responseURL + " with status " + response.status + " ==>" + response.statusText;
			}
		}

		get id() {
			return this._id || '';
		}

		set id(id) {
			this._id = id;
		}

		get user() {
			return this._user || '';
		}

		set user(user) {
			this._user = user;
		}

		get role() {
			return this._role || '';
		}

		set role(role) {
			this._role = role;
		}

		static get observedAttributes() { return ['id', 'user', 'role', 'url'] };

		attributeChangedCallback(name, oldValue, newValue) {
			if(name === 'url') {
				this._url = newValue;
				this._fetchData();
			} else {
				// Set the new value
				this['_' + name] = newValue;

				var data = {
					id: this.id,
					user: this.user,
					role: this.role
				};
				this._render(data);
			}
		}

		get value() {
			return this._value;
		}
		set value(value) {
			this._value = value;

			// Rule #6 The connectedCallback may not have been called at this point, so be sure and check (ie If the shadowRoot is present then we know that the connectedCallback has been called)
			// It is possible that this could be called before the connected callback sets up the sub-components, so
			// protect it by looking at the shadowRoot. If the shadowRoot is there, then we would expect the
			// sub-component to also be there.
			if(this.shadowRoot) {
				this.shadowRoot.querySelector('#value').textContent = value;

				// Pass the information to the sub-component
				var compF = this.shadowRoot.querySelector('comp-f');
				compF.value = this.value + '-child';
			}
		}
	}

	// Define our web component
	customElements.define('self-contained', SelfContainedComponent);
})();
