
const template = document.createElement('template');
template.innerHTML = `
	<style>
		:host {
			display: block;
			text-align: center;
		}
		button {
			display: inline-block;
			background: transparent;
			color: white;
		}
	</style>
	<button> Hi! </button>
`;

class WCAudio extends HTMLElement {

	constructor() {
		super();
		this.attachShadow({
			mode: 'open'
		});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}

	connectedCallback() {
	}

	disconnectedCallback() {

	}

}

customElements.define('wc-audio', WCAudio);
