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
	</style>
	`;

	var _template = `
		<div class="container">
			<div class="id">1234</div>
			<div class="user">Frank</div>
			<div class="role">Typist</div>
		</div>
	`;

	// Helper function to get a url
	var HttpClient = function() {
		this.get = function(url, callback) {
			var request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200 && callback) {
					callback(request.responseText);
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
			this._url = this.getAttribute('url');

			// If there is a url, then go fetch the data and display it
			if(this._url) {
				var client = new HttpClient();
				client.get(this._url, this._render(this));
			}
		}

		disconnectedCallback() {
		}

		_render(outer) {
			function _innerRender(response) {
				var data = JSON.parse(response);
				outer.shadowRoot.querySelector('.id').textContent = data.id;
				outer.shadowRoot.querySelector('.user').textContent = data.user;
				outer.shadowRoot.querySelector('.role').textContent = data.role;
			}
			return _innerRender;
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
