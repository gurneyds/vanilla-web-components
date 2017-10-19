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
		</div>
	`;

  var _rowTemplate = `Id:<span class="id"></span>User:<span class="user"></span>Role:<span class="role"></span>`

	class PersonList extends HTMLElement {
		constructor() {
			super();
      console.log('PersonList constructor called');

			const template = _styles + _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
      console.log('PersonList connectedCallback called');
		}

		disconnectedCallback() {
		}

    set data(data) {
      console.log("personList data set with:" + JSON.stringify(data));

      if(data) {
        // Clear out the old rows
        var container = this.shadowRoot.querySelector('.container');
        container.innerHTML = '';

        data.forEach(function(person) {
          var el = document.createElement('div');
          el.innerHTML = _rowTemplate;
          el.querySelector('.id').textContent = person.id;
          el.querySelector('.user').textContent = person.user;
          el.querySelector('.role').textContent = person.role;
          container.append(el);
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
