class SliderGroup extends HTMLElement {
    constructor () {
        super();
    }

    connectedCallback () {
        this.classList.add('circular');
        this._children = [...this.childNodes].filter((child) => {
            return child.tagName === 'CELTRA-SLIDER';
        });
    }
}

class Slider extends HTMLElement {
    constructor () {
        super();
    }

    // Component attached to DOM
    connectedCallback () {
        this.build();
        this.initialize();
        this._handler.addEventListener('drag', (e) => {
            const xDif = e.clientX - this._bounds.center.x;
            const yDif = e.clientY - this._bounds.center.y;
            this.calculateCorner(xDif, yDif);
            this.render();
        });
    }

    // Component detached from DOM
    disconnectedCallback () {
        this._handler.removeEventListener('drag');
    }

    // On attribute change
    static get observedAttributes() {
        return ['color', 'min', 'max', 'step', 'value'];
    }
    attributeChangedCallback(){
        this.initialize();
    }


    // Render progress and handler based on corner params
    render () {
        this.style.backgroundImage = `conic-gradient(${this._params.color} ${this._corner.deg}deg, #eee 0)`;
        if(this._handler){
            this._handler.style.top = `${Math.sin(this._corner.tan) * this._bounds.height / 2 + this._bounds.height / 2 - 15}px`;
            this._handler.style.left = `${Math.cos(this._corner.tan) * this._bounds.width / 2 + this._bounds.width / 2 - 15}px`;
        }

    }

    // Building component html
    build () {
        const handler = document.createElement('div');
        handler.classList.add('circular__handler');
        handler.setAttribute('draggable', 'true');
        this.appendChild(handler);
        this.classList.add('circular__slider');
        this._handler = handler;
    }

    // Initialize default params needed for component functionality
    initialize () {
        this._params = {
            color: this.getAttribute('color') || '#fff',
            max: parseFloat(this.getAttribute('max')) || 100,
            min: parseFloat(this.getAttribute('min')) || 0,
            step: parseFloat(this.getAttribute('step')) || 1,
            value: parseFloat(this.getAttribute('value')) || parseFloat(this.getAttribute('min')) || 0,
        };
        this._events = {
           change: this.getAttribute('onchange')
        };
        let { x, y, width, height } = this.getBoundingClientRect();
        this._bounds = {
            x, y,
            width: width - 6,
            height: height - 6,
            center: {
                x: x + width / 2,
                y: y + height / 2
            }
        };
        this._corner = {
            tan: -Math.PI/2,
            deg: 0,
        };
        this.calculateCornerValue(this._params.value);
        this.render()
    }

    // Calculate tangens and corner in degrees
    calculateCorner (xdif, ydif) {
        // Getting degrees of current position
        const deg = ((Math.atan2(ydif, xdif) / Math.PI * 180) + 450) % 360;
        const range = this._params.max - this._params.min;
        // Getting min offset value based on max and step
        const val = Math.round(range * deg / 360 / this._params.step) * this._params.step;
        // Getting degrees and tangens based on step value
        if (Math.abs(deg - this._corner.prev) < 3) {
            this.calculateCornerValue(val);
        }
        this._corner.prev = deg;
    }

    // Getting degrees and tangens based on step value
    calculateCornerValue (val) {
        const range = this._params.max - this._params.min;
        const stepDeg = val * 360 / range % 360;
        const stepTan = (stepDeg - 90) / 180 * Math.PI;

        this.changeValue(this._params.min + val);
        // Assign corner values if
        this._corner.deg = stepDeg;
        this._corner.tan = stepTan;

    }

    changeValue(value){
        const event = new CustomEvent('change', { value });
        this.dispatchEvent(event);
        if(this._events.change && window[this._events.change] && typeof window[this._events.change] === 'function'){
            window[this._events.change](event)
        }
    }
}

customElements.define('celtra-slider-group', SliderGroup);
customElements.define('celtra-slider', Slider);
