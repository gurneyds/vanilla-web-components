(function() {
	var _styles = `
	<style>
		.container {
			border: 1px solid blue;
			display: grid;
			grid-template-columns: 1fr;
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
			this.id = this.getAttribute('id');
			this.user = this.getAttribute('user');
			this.role = this.getAttribute('role');
			this.src = this.getAttribute('src');

			// If there is a src, then go fetch the data and display it
			if(this._src) {
				this._fetchData();
			}
		}

		_fetchData() {
			var client = new HttpClient();
			client.get(this._src, this._successCallback(this), this._failCallback(this));
		}

		disconnectedCallback() {
		}

		_successCallback(outer) {
			return function(response) {
				// TODO - Take a look at the response to see if it is the correct type and will convert to JSON
				var data = JSON.parse(response.responseText);

				// The setters will update the ui
				outer.id = data.id;
				outer.user = data.user;
				outer.role = data.role;
			}
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
			this.shadowRoot.querySelector('.id').textContent = id;
			this.setAttribute('id', id);
		}

		get user() {
			return this._user || '';
		}

		set user(user) {
			this._user = user;
			this.shadowRoot.querySelector('.user').textContent = user;
			this.setAttribute('user', user);
		}

		get role() {
			return this._role || '';
		}

		set role(role) {
			this._role = role;
			this.shadowRoot.querySelector('.role').textContent = role;
			this.setAttribute('role', role);
		}

		get src() {
			return this._src;
		}

		set src(src) {
			this._src = src;
			this.setAttribute('src', src);
		}

		static get observedAttributes() { return ['id', 'user', 'role', 'src'] };

		attributeChangedCallback(name, oldValue, newValue) {
			// If an attribute is null it gets converted into the string 'null'. That seems so wrong, but it's reality.
			if(newValue != oldValue && newValue && newValue != 'null') {
				if(name === 'src') {
					this._src = newValue;
					this._fetchData();
				} else {
					// Set the new value
					this[name] = newValue;
				}
			}
		}
	}

	// Define our web component
	customElements.define('self-contained', SelfContainedComponent);
})();
