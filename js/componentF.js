(function() {
	var template = `
		<div>
			Component F with a value: <span id="value"></span>
		</div>
	`;

	class CompF extends HTMLElement {
		constructor() {
			super();
			console.log("ComponentF constuctor");

			this.attachShadow({mode: 'open'}).innerHTML = template;

			// This code is called after the parent constructor but before the connectedCallback of the parent.
			// Setting values here is ok because the parent can override them in it's connectedCallback
			this.value = this.getAttribute('value') || 0;
		}

		connectedCallback() {
			console.log("ComponentF connectedCallback");

			// This callback is called after the parent connectedCallback, so if the parent sets values in this
			// component, then the values could be overridden here
			//this.value = this.getAttribute('value') || 0;
		}
		disconnectedCallback() {
			console.log("ComponentF disconnectedCallback");
		}

		get value() {
			return this._value;
		}
		set value(value) {
			this._value = value;
			this.shadowRoot.querySelector('#value').textContent = value;
		}
	}

	// Define our web component
	customElements.define('comp-f', CompF);
})();
