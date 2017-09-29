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

	/*
	This is a simple component that renders attribute values and allows an external source to set data properties
	*/
	class SimpleComponent extends HTMLElement {
		constructor() {
			super();
			console.log("SimpleComponent constructor called");

			const template = _styles + _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
			console.log("SimpleComponent connected callback called");
			this.id = this.getAttribute('id');
			this.user = this.getAttribute('user');
			this.role = this.getAttribute('role');
			this.data = "";
		}

		disconnectedCallback() {
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

		// This is a callback method that call by anyone wishing to set the data
		set componentData(data) {
			console.log("componentData caleld on SimpleComponent");
			this._data = data;
			this.id = data.id;
			this.user = data.user;
			this.role = data.role;
		}

		// This is to demonstrate the ability to use alternate properties
		set objectData(data) {
			console.log("objectData called on SimpleComponent");
			this.componentData(data);
		}

		static get observedAttributes() { return ['id', 'user', 'role'] };

		attributeChangedCallback(name, oldValue, newValue) {
			// If an attribute is null it gets converted into the string 'null'. That seems so wrong, but it's reality.
			if(newValue != oldValue && newValue && newValue != 'null') {
				// Set the new value
				this[name] = newValue;
			}
		}
	}

	// Define our web component
	customElements.define('simple-component', SimpleComponent);
})();
