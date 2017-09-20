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
		}

		connectedCallback() {
			console.log("ComponentF connectedCallback");
			this.value = this._value || (this.getAttribute('value') || 0);
		}
		disconnectedCallback() {
			console.log("ComponentF disconnectedCallback");
		}

		get value() {
			return this._value;
		}
		set value(value) {
			this._value = value;
			if(this.shadowRoot) {
				this.shadowRoot.querySelector('#value').textContent = value;
			}
		}
	}

	// Define our web component
	customElements.define('comp-f', CompF);
})();
