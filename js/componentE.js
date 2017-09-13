(function() {
	var template = `
		<div>
			Component E with a value: <span id="value"></span>
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
			// var compB = this.shadowRoot.querySelector('comp-b');
			// compB.title = "title from compA";
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
			// var compB = this.shadowRoot.querySelector('comp-b');
			// compB.values = value;
		}
	}

	// Define our web component
	customElements.define('comp-e', CompE);
})();
