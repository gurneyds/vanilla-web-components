(function() {
	var _styles = `
	<style>
		.container {
			border: 1px solid blue;
			display: grid;
			grid-template-columns: 1fr;
			margin:10px;
		}
		.container > div {
			margin-left: 5px;
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
			<div>ID:<span class="id"></span></div>
			<div>User:<span class="user"></span></div>
			<div>Role:<span class="role"></span></div>
			<div><button id="addButton">Add</button></div>
			<div><button id="updateButton">Update</button></div>
			<div><button id="deleteButton">Delete</button></div>
		</div>
	`;

	/*
	This is a simple component that renders attribute values and allows an external source to set data properties
	*/
	class PersonComponent extends HTMLElement {
		constructor() {
			super();
			console.log("PersonComponent constructor called");

			const template = _styles + _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
			console.log("PersonComponent connected callback called");
			this.id = this.getAttribute('id');
			this.user = this.getAttribute('user');
			this.role = this.getAttribute('role');
			this.data = "";

			this.shadowRoot.querySelector('#addButton').addEventListener('click', this._sendEvent(this, 'add_person'));
	 		this.shadowRoot.querySelector('#updateButton').addEventListener('click', this._sendEvent(this, 'update_person'));
			this.shadowRoot.querySelector('#deleteButton').addEventListener('click', this._sendEvent(this, 'delete_person'));
		}

	_sendEvent(context, eventName) {
	  var that = context;
	  return function(event) {
		  var person = {
			id: that.id,
			user: that.user,
			role: that.role
		  };

		  // Emit an event for the add
		  var event = new CustomEvent(eventName, {
			detail: person,
			bubbles: true,
			cancelable: true
		  });
		  that.dispatchEvent(event);
		  console.log("personComponent " + eventName + " event emitted");
		};
	  };

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

		// This is a callback method that can be called by anyone wishing to set the data
		set person(data) {
			this._data = data;
			this.id = data.id;
			this.user = data.user;
			this.role = data.role;
		}

		// This is to demonstrate the ability to use alternate properties
		set objectData(data) {
			this.componentData = data;
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
	customElements.define('person-component', PersonComponent);
})();
