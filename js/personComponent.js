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
			<div>ID:<span class="readonly id"></span><input type="text" class="edit editId"></input></div>
			<div>User:<span class="readonly user"></span><input type="text" class="edit editUser"></input></div>
			<div>Role:<span class="readonly role"></span><input type="text" class="edit editRole"></input></div>
			<div><button id="addButton">Add</button></div>
			<div><button id="updateButton">Update</button></div>
			<div><button id="deleteButton">Delete</button></div>
			<div><button id="editButton">Edit</button></div>
      <div><button id="resetButton">Reset</button></div>
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
			this.id2 = this.getAttribute('id');
			this.user = this.getAttribute('user');
			this.role = this.getAttribute('role');
			this.editMode = false;
			if(this.getAttribute('editMode') == "true") {
				this.editMode = true;
			}
			this.data = "";

			this.shadowRoot.querySelector('#addButton').addEventListener('click', this._sendEvent(this, 'add_person'));
			this.shadowRoot.querySelector('#updateButton').addEventListener('click', this._sendEvent(this, 'update_person'));
			this.shadowRoot.querySelector('#deleteButton').addEventListener('click', this._sendEvent(this, 'delete_person'));
			this.shadowRoot.querySelector('#editButton').addEventListener('click', this._toggleEdit(this));
      this.shadowRoot.querySelector('#resetButton').addEventListener('click', this._sendEvent(this, 'remove_all_person'));
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
			return this.shadowRoot.querySelector('.editId').value || '';
		}

		set id(id) {
			this._id = id;
			this.shadowRoot.querySelector('.id').textContent = id;
			this.shadowRoot.querySelector('.editId').value = id;
			this.setAttribute('id', id);
		}

		get user() {
			return this.shadowRoot.querySelector('.editUser').value || '';
		}

		set user(user) {
			this._user = user;
			this.shadowRoot.querySelector('.user').textContent = user;
			this.shadowRoot.querySelector('.editUser').value = user;
			this.setAttribute('user', user);
		}

		get role() {
			return this.shadowRoot.querySelector('.editRole').value || '';
		}

		set role(role) {
			this._role = role;
			this.shadowRoot.querySelector('.role').textContent = role;
			this.shadowRoot.querySelector('.editRole').value = role;
			this.setAttribute('role', role);
		}

		get editMode() {
			return this._editMode || false;
		}

		set editMode(isEdit) {
			this._editMode = isEdit;
			var readOnlyControls;
			var editControls;
			if(isEdit === "true" || isEdit === true) {
				editControls = 'inline';
				readOnlyControls = 'none';
			} else {
				editControls = 'none';
				readOnlyControls = 'inline';
			}

			// Show the edit controls, hide the read-only
			var readonlyNodes = this.shadowRoot.querySelectorAll('.readonly');
			readonlyNodes.forEach(function(node) {
				node.style.display = readOnlyControls;
			});

			var editNodes = this.shadowRoot.querySelectorAll('.edit');
			editNodes.forEach(function(node){
				node.style.display = editControls;
			});
		}

		_toggleEdit(context) {
			return function() {
				context.editMode = !context.editMode;
			}
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

		static get observedAttributes() { return ['id', 'user', 'role', 'editMode'] };

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
