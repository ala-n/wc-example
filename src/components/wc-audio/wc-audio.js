
const template = document.createElement('template');
// Template for our custom element
// language=HTML
template.innerHTML = `
	<style>
		:host {
			display: block;
			text-align: center;
			
			/* Custom properties, we can easily override it outside */
			--bg-color: #1b1b1b;
			/*--bg-color: var(--custom-audio-bg-color, #1b1b1b);*/
			--primary-color: #8100ff;
			--active-color: #00ff38;
			--secondary-color: #393939;
		}
		#content {
			display: inline-block;
			position: relative;
			width: 100px;
			height: 100px;
		}
		#bg-svg {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
		#bg-circle {
			fill: var(--bg-color);
			stroke: var(--secondary-color);
			stroke-width: 4px;
		}
		#progress {
			display: none;
		
			fill: transparent;
			stroke: var(--primary-color);
			stroke-width: 2px;
			
			/* Progress start position & animation*/
			transform: rotate(-90deg);
            transform-origin: 50% 50%;
            transition: stroke-dashoffset 0.5s ease-in-out;
            
          	pointer-events: none;
		}
		button {
			position: absolute;
		
			background: none;
			border: none;
			padding: 0;
			fill: var(--primary-color);
		}
		button:hover, button:focus {
			fill: var(--active-color);
		}
		button > svg {
			width: 100%;
			height: 100%;
		}
		
		#play-btn {
			width: 60px;
			height: 60px;
			top: 20px;
			left: 20px;
		}
		#pause-btn {
			display: none;
			width: 50px;
			height: 50px;
			top: 25px;
			left: 25px;
		}
		
		.active #progress {
			display: block;
		}
		.active #play-btn {
			display: none;
		}
		.active #pause-btn {
			display: block;
		}
	</style>
	<div id="content">
		<svg id="bg-svg" xmlns="http://www.w3.org/2000/svg">
			<circle id="bg-circle" cx="50" cy="50" r="45"></circle>
			<circle id="progress" cx="50" cy="50" r="45"></circle>
		</svg>
		<button id="play-btn" data-action="play">
			<svg xmlns="http://www.w3.org/2000/svg">
				<polygon points="55 30, 15 5, 15 55"></polygon>
			</svg>
		</button>
		<button id="pause-btn" data-action="play">
			<svg xmlns="http://www.w3.org/2000/svg">
				<polygon points="5 0, 5 50, 15 50, 15 0"></polygon>
				<polygon points="35 0, 35 50, 45 50, 45 0"></polygon>
			</svg>
		</button>
	</div>
	<div id="player-text">
		<slot></slot>
	</div>
`;


const audioCmpIntersectionObserver = new IntersectionObserver((entries) => {
	for (let entree of entries) {
		if (entree.target instanceof WCAudio && !entree.isIntersecting) {
			entree.target.stop();
		}
	}
}, {
	// Options
	rootMargin: '1000px',
	threshold: 0.0
});

class WCAudio extends HTMLElement {

	static get observedAttributes(){ return ['src', 'volume']; }

	constructor() {
		super();
		this.attachShadow({
			mode: 'open'
		});
		this.shadowRoot.appendChild(template.content.cloneNode(true));

		this._audio = new Audio();

		this._$content = this.shadowRoot.querySelector('#content');
		this._$progress = this.shadowRoot.querySelector('#progress');

		this.shadowRoot.querySelector('#play-btn').addEventListener('click', this.onPlayClick.bind(this));
		this.shadowRoot.querySelector('#pause-btn').addEventListener('click', this.onPauseClick.bind(this));

		this._$content.addEventListener('click', this.onAreaClick.bind(this));
	}

	play() {
		//this._audio.currentTime = 0;
		this._audio.play();
		this.update();
		this._initTrackListener();
	}
	pause() {
		this._$content.classList.remove('active');
		this._audio.pause();
		this.update();
		this._removeTrackListener();
	}
	stop() {
		this.pause();
		this._audio.currentTime = 0;
	}

	update() {
		if (this._audio.paused || this._audio.ended) {
			this._$content.classList.remove('active');
			this.setAttribute('active', '');
		} else {
			this._$content.classList.add('active');
			this.removeAttribute('active');
		}
		this.updateTrackPosition();
	}

	updateTrackPosition() {
		let percentage = +(this._audio.currentTime / this._audio.duration) || 0;

		let radius = +this._$progress.getAttribute('r');
		let dashArray = 2 * Math.PI * radius;
		let dashOffset = dashArray * (1 - percentage);

		this._$progress.setAttributeNS(null, 'stroke-dasharray', dashArray);
		this._$progress.setAttributeNS(null, 'stroke-dashoffset', dashOffset);
	}

	connectedCallback() {
		this._audio.volume = +(this.volume || 1);
		this._audio.src = this.src;

		this.update();

		if( this.hasAttribute('stop-out-of-view') ) {
			audioCmpIntersectionObserver.observe(this);
		}
	}

	disconnectedCallback() {
		this._removeTrackListener();

		audioCmpIntersectionObserver.unobserve(this);
	}

	attributeChangedCallback(attr, oldValue, newValue) {
		switch (attr) {
			case 'src':
				this._audio.src = this.src;
				this.update();
				return;
			case 'volume':
				this._audio.volume = this.volume;
				this.update();
				return;
		}
	}

	_initTrackListener() {
		this._removeTrackListener();
		this.__trackListenerInterval = setInterval(() => {
			this.updateTrackPosition();
			if (this._audio.ended) {
				this.update();
				this._removeTrackListener();
			}
		},200);
	}
	_removeTrackListener() {
		if (this.__trackListenerInterval) {
			clearInterval(this.__trackListenerInterval);
		}
	}

	onPlayClick() {
		this.play();
	}
	onPauseClick() {
		this.pause();
	}
	onAreaClick(e) {
		let offset = this._$content.getBoundingClientRect();
		let radius = +this._$progress.getAttribute('r');

		let x = e.clientX - offset.x - this._$content.clientWidth / 2;
		let y = e.clientY - offset.y - this._$content.clientHeight / 2;

		let r = Math.hypot(x, y);
		let alpha = Math.PI - Math.atan2(x, y);
		let pos = alpha / Math.PI / 2;

		if (Math.abs(r - radius) < 3) {
			this._audio.currentTime = (+this._audio.duration) * pos;
			this.update();
		}
	}
}

// Add properties sync to attributes
WCAudio.observedAttributes.forEach(function (attrName) {
	let propName = attrName.replace(/-([a-zA-Z])/g, (lex, symbol) => symbol.toUpperCase());
	Object.defineProperty(WCAudio.prototype, propName, {
		get: function () {
			return this.getAttribute(attrName);
		},
		set: function (val) {
			this.setAttribute(attrName, val);
		}
	});
});

customElements.define('wc-audio', WCAudio);
