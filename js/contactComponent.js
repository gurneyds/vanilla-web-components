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
			<div>Home phone:<span class="home-phone"</span></div>
			<div>Office phone:<span class="office-phone"></span></div>
			<div>Cell phone:<span class="cell-phone"></span></div>
			<div>Email:<span class="email"></span></div>
		</div>
	`;

	class ContactComponent extends HTMLElement {
		constructor() {
			super();

			const template = _styles + _template;
			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
			this.homePhone = this.getAttribute('homePhone');
			this.officePhone = this.getAttribute('officePhone');
			this.cellPhone = this.getAttribute('cellPhone');
			this.email = this.getAttribute('email');
			this.data = "";
		}

		disconnectedCallback() {
		}

		get homePhone() {
			return this._homePhone || '';
		}

		set homePhone(homePhone) {
			this._homePhone = homePhone;
			this.shadowRoot.querySelector('.home-phone').textContent = homePhone;
			this.setAttribute('homePhone', homePhone);
		}

		get officePhone() {
			return this._officePhone || '';
		}

		set officePhone(officePhone) {
			this._officePhone = officePhone;
			this.shadowRoot.querySelector('.office-phone').textContent = officePhone;
			this.setAttribute('officePhone', officePhone);
		}

		get cellPhone() {
			return this._cellPhone || '';
		}

		set cellPhone(cellPhone) {
			this._cellPhone = cellPhone;
			this.shadowRoot.querySelector('.cell-phone').textContent = cellPhone;
			this.setAttribute('cellPhone', cellPhone);
		}

		get email() {
			return this._email || '';
		}

		set email(email) {
			this._email = email;
			this.shadowRoot.querySelector('.email').textContent = email;
			this.setAttribute('email', email);
		}

		// This is a callback method that call by anyone wishing to set the data
		set contact(data) {
			this.homePhone = data.contact.phone.home;
			this.officePhone = data.contact.phone.office;
			this.cellPhone = data.contact.phone.cell;
			this.email = data.contact.email;
		}

		static get observedAttributes() { return ['homePhone', 'officePhone', 'cellPhone', 'email'] };

		attributeChangedCallback(name, oldValue, newValue) {
			// If an attribute is null it gets converted into the string 'null'. That seems so wrong, but it's reality.
			if(newValue != oldValue && newValue && newValue != 'null') {
				// Set the new value
				this[name] = newValue;
			}
		}
	}

	// Define our web component
	customElements.define('contact-component', ContactComponent);
})();
