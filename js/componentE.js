(function() {
	var template = `
		<div>
			Component E with a value: <span id="value"></span>
			<comp-f></comp-f>
		</div>
	`;

	class CompE extends HTMLElement {
		constructor() {
			// Rule #1 - call super() with no parameters
			super();
			console.log("ComponentE constuctor");

			// Rule #7 Setup shadowRoot
			this.attachShadow({mode: 'open'}).innerHTML = template;

			// Rule #4 Don't call document.write() or document.open()
			// Rule #5 Don't inspect the attributes or children in the constructor
			// Rule #2 Don't call return
		}

		connectedCallback() {
			console.log("ComponentE connectedCallback");

			// The connected callback will be called whenever the component is moved to another place on the page, so
			// it's probably a good idea to protect the shadowRoot from multiple calls.
			// if(!this.shadowRoot) {
			// 	this.attachShadow({mode: 'open'}).innerHTML = template;
			// }

			// Rule #4 wait until the object is created and on the page before inspecting attributes
			// Rule #6 The connectedCallback method may be called more than once, so handle the state propertly (ie look for cached state)
			// If the private variable has been set, then use it. Otherwise look for the attribute, else 0
			this.value = this._value || (this.getAttribute('value') || 0);
		}

		disconnectedCallback() {
			console.log("ComponentE disconnectedCallback");
		}

		get value() {
			return this._value;
		}
		set value(value) {
			this._value = value;

			// Rule #6 The connectedCallback may not have been called at this point, so be sure and check (ie If the shadowRoot is present then we know that the connectedCallback has been called)
			// It is possible that this could be called before the connected callback sets up the sub-components, so
			// protect it by looking at the shadowRoot. If the shadowRoot is there, then we would expect the
			// sub-component to also be there.
			if(this.shadowRoot) {
				this.shadowRoot.querySelector('#value').textContent = value;

				// Pass the information to the sub-component
				var compF = this.shadowRoot.querySelector('comp-f');
				compF.value = this.value + '-child';
			}
		}
	}

	// Define our web component
	customElements.define('comp-e', CompE);
})();
