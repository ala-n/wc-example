


class WCAudio extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = '<button> Hi! </button>';
	}

	disconnectedCallback() {

	}

}

customElements.define('wc-audio', WCAudio);
