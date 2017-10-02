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
			<div class="street">Street:<span class="street"></span></div>
			<div>City:<span class="city"></span></div>
			<div>State:<span class="state"></span></div>
			<div>Zip:<span class="zip"></span></div>
		</div>
	`;

	class AddressComponent extends HTMLElement {
		constructor() {
			super();

			const template = _styles + _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
			this.street = this.getAttribute('street');
			this.city = this.getAttribute('city');
			this.state = this.getAttribute('state');
			this.zip = this.getAttribute('zip');
			this.data = "";
		}

		disconnectedCallback() {
		}

		get street() {
			return this._street || '';
		}

		set street(street) {
			this.shadowRoot.querySelector('.street').textContent = street;
			this.setAttribute('street', street);
		}

		get city() {
			return this._city || '';
		}

		set city(city) {
			this.shadowRoot.querySelector('.city').textContent = city;
			this.setAttribute('city', city);
		}

		get state() {
			return this._state || '';
		}

		set state(state) {
			this.shadowRoot.querySelector('.state').textContent = state;
			this.setAttribute('state', state);
		}

		get zip() {
			return this._zip || '';
		}

		set zip(zip) {
			this.shadowRoot.querySelector('.zip').textContent = zip;
			this.setAttribute('zip', zip);
		}

		// This is a callback method that call by anyone wishing to set the data
		set address(data) {
			this.street = data.address.street;
			this.city = data.address.city;
			this.state = data.address.state;
			this.zip = data.address.zip;
		}

		static get observedAttributes() { return ['street', 'city', 'state', 'zip'] };

		attributeChangedCallback(name, oldValue, newValue) {
			// If an attribute is null it gets converted into the string 'null'. That seems so wrong, but it's reality.
			if(newValue != oldValue && newValue && newValue != 'null') {
				// Set the new value
				this[name] = newValue;
			}
		}
	}

	// Define our web component
	customElements.define('address-component', AddressComponent);
})();
