(function() {
	var template = `
		<div>
			Component E with a value: <span id="value"></span>
			<comp-f></comp-f>
		</div>
	`;

	class CompE extends HTMLElement {
		constructor() {
			super();
			console.log("ComponentE constuctor");

			this.attachShadow({mode: 'open'}).innerHTML = template;
		}

		connectedCallback() {
			console.log("ComponentE connectedCallback");
			this.value = this.getAttribute('value') || 0;
		}
		disconnectedCallback() {
			console.log("ComponentE disconnectedCallback");
		}

		get value() {
			return this._value;
		}
		set value(value) {
			this._value = value;
			this.shadowRoot.querySelector('#value').textContent = value;

			// Pass the information to the sub-component
			var compF = this.shadowRoot.querySelector('comp-f');
			compF.value = this.value;
		}
	}

	// Define our web component
	customElements.define('comp-e', CompE);
})();
