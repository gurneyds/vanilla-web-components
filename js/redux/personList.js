(function() {
	var _styles = `
	<style>
		.container {
			border: 1px solid blue;
			display: grid;
			grid-template-columns: 1fr;
			margin: 10px;
		}
		.container > div {
			margin-left: 5px;
		}

    .container > div > span {
      margin-left: 20px;
      margin-right: 20px;
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
			<div>Id:<span class="id">1234</span>User:<span class="user">George</span>Role:<span class="role">Manager</span></div>
      <div>Id:<span class="id">1234</span>User:<span class="user">George</span>Role:<span class="role">Manager</span></div>
      <div>Id:<span class="id">1234</span>User:<span class="user">George</span>Role:<span class="role">Manager</span></div>
		</div>
	`;

	class PersonList extends HTMLElement {
		constructor() {
			super();

			const template = _styles + _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
		}

		disconnectedCallback() {
		}

    set list(data) {
      this.shadowRoot.querySelector('container').innerHTML = '';
      if(data) {
        data.forEach(function(person) {
          // TODO - create the DOM elements and insert
        })
      }
    }

		static get observedAttributes() { return [] };

		attributeChangedCallback(name, oldValue, newValue) {
			// If an attribute is null it gets converted into the string 'null'. That seems so wrong, but it's reality.
			if(newValue != oldValue && newValue && newValue != 'null') {
				// Set the new value
				this[name] = newValue;
			}
		}
	}

	// Define our web component
	customElements.define('person-list', PersonList);
})();
