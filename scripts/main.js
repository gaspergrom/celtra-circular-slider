// Slider group component
class SliderGroup extends HTMLElement {
    constructor () {
        super();
    }

    connectedCallback () {
        this.classList.add('circular');
        // filtering children by tag and adjusting the position and size
        this._children = [...this.childNodes].filter((child, ci) => {
            return child.tagName === 'CELTRA-SLIDER';
        }).forEach((slider, si) => {
            slider.style.top = slider.style.bottom = slider.style.left = slider.style.right = `${si * 40}px`;
            slider.style.width = slider.style.height = `calc(100% - ${si * 80}px)`
        });
    }
}

// Slider component
class Slider extends HTMLElement {
    constructor () {
        super();
    }

    // Component attached to DOM
    connectedCallback () {
        this.build();
        this.initializeValue();
        this.initialize();

        // Drag event for desktop devices
        this._handler.addEventListener('drag', (e) => {
            this.calculateCorner(e.clientX, e.clientY);
            this.render();
        });

        // touch event for mobile devices
        this._handler.addEventListener('touchmove', (e) => {
            const touch = e && e.changedTouches && e.changedTouches.length && e.changedTouches[0];
            this.calculateCorner(touch.clientX, touch.clientY);
            this.render();
        }, false);

        this.addEventListener('click', (e) => {
            this._corner.prev = this.clientCoordsToDeg(e.clientX, e.clientY);
            this.calculateCorner(e.clientX, e.clientY);
            this.render();
        });

        // Disable scroll on mobile devices when touching
        this._handler.addEventListener('touchstart', function (e) {
            document.documentElement.style.overflow = 'hidden';
        });
        this._handler.addEventListener('touchend', function (e) {
            document.documentElement.style.overflow = 'auto';
        });

        // Adjust layout on window resize
        window.addEventListener('resize', () => {
            this.initialize();
        });


    }

    // Component detached from DOM
    disconnectedCallback () {
        this._handler.removeEventListener('drag');
        this._handler.removeEventListener('touchmove');
        this._handler.removeEventListener('touchstart');
        this._handler.removeEventListener('touchend');
        window.removeEventListener('resize');
    }

    // // On attribute change
    attributeChangedCallback () {
        this.initialize();
    }

    static get observedAttributes () {
        return [
            'color',
            'min',
            'max',
            'step',
            'value',
        ];
    }

    get valid () {
        if (this._params.min > this._params.max) {
            console.error('Min value shouldnt be greater than max value');
            return false;
        }
        if (this._params.step > (this._params.max - this._params.min)) {
            console.error('Step shouldnt be greater than slider range');
            return false;
        }
        if (this._params.step <= 0) {
            console.error('Step shouldnt be less or equal 0');
            return false;
        }
        if (this._params.step <= 0) {
            console.error('Step shouldnt be less or equal 0');
            return false;
        }
        if (this._params.value < this._params.min || this._params.value > this._params.max) {
            console.error('Initial value should be between minimum and maximum value');
            return false;
        }
        if (this._params.radius < 1 || this._params.radius > 360) {
            console.error('Radius value should be between 1 and 360');
            return false;
        }
        return false;
    }

    // Render progress and handler based on corner params
    render () {
        if (this.valid) {
            if (this._handler) {
                this._handler.style.top = `${(Math.sin(this._corner.tan) + 1) * this._bounds.height / 2 - 15}px`;
                this._handler.style.left = `${(Math.cos(this._corner.tan) + 1) * this._bounds.width / 2 - 15}px`;
            }
        }
    }

    // Building component html
    build () {
        this.classList.add('circular__slider');

        const handler = document.createElement('div');
        handler.classList.add('circular__handler');
        handler.setAttribute('draggable', 'true');
        this.appendChild(handler);
        this._handler = handler;

        const leftHalf = document.createElement('div');
        leftHalf.classList.add('circular__slider__half');
        leftHalf.classList.add('circular__slider__half--left');
        const rightHalf = document.createElement('div');
        rightHalf.classList.add('circular__slider__half');
        rightHalf.classList.add('circular__slider__half--right');
        this.appendChild(leftHalf);
        this.appendChild(rightHalf);
    }

    // Initialize default params needed for component functionality
    initialize () {
        // Initialize attributes
        this._params = this._params || {};
        this._params.color = this.getAttribute('color') || 'red';
        this._params.max = this.hasAttribute('max') ? parseFloat(this.getAttribute('max')) : 100;
        this._params.min = this.hasAttribute('min') ? parseFloat(this.getAttribute('min')) : 0;
        this._params.step = this.hasAttribute('step') ? parseFloat(this.getAttribute('step')) : 1;
        this._params.radius = this.hasAttribute('radius') ? parseFloat(this.getAttribute('radius')) : 360;

        // Initialize events
        this._events = {
            change: this.getAttribute('@change')
        };

        // Set variables which are used for layouting
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
            tan: -Math.PI / 2,
            deg: 0,
        };

        this.calculateCornerByValue(this._params.value - this._params.min);
        this.render();
    }

    // Initialize value attribute
    initializeValue () {
        this._params = this._params || {};
        this._params.value = parseFloat(this.getAttribute('value')) || parseFloat(this.getAttribute('min')) || 0;
        this.changeValue(this._params.value);
    }

    clientCoordsToDeg (clientX, clientY) {
        const xdif = clientX - this._bounds.center.x;
        const ydif = clientY - this._bounds.center.y;
        // Getting degrees of current position
        return ((Math.atan2(ydif, xdif) / Math.PI * 180) + 450) % 360;
    }

    // Calculate tangens and corner in degrees
    calculateCorner (clientX, clientY) {
        const deg = this.clientCoordsToDeg(clientX, clientY);
        const range = this._params.max - this._params.min;
        // Getting min offset value based on max and step
        const val = Math.round(range * deg / this._params.radius / this._params.step) * this._params.step;

        // Preventing jumps which are occured by drag event
        if (Math.abs(deg - this._corner.prev) < 3) {
            this.calculateCornerByValue(val);
        }
        this._corner.prev = deg;
    }

    // Getting degrees and tangens based on step value
    calculateCornerByValue (val) {
        if(this.valid){
            const range = this._params.max - this._params.min + this._params.step;
            const stepDeg = (val + this._params.step) * this._params.radius / range % 360;
            const stepTan = (stepDeg - 90) / 180 * Math.PI;
            const value = this._params.min + val;

            // Assign corner values
            if (value >= this._params.min && value <= this._params.max) {
                this._corner.deg = stepDeg;
                this._corner.tan = stepTan;
                this.changeValue(this._params.min + val);
            }
        }

    }

    changeValue (value) {
        if (this.valid) {
            const event = new CustomEvent('change', { detail: { value } });
            this.dispatchEvent(event);
            if (this._events.change && this._events.change in window && typeof window[this._events.change] === 'function') {
                window[this._events.change](event)
            }
        }
    }
}

// Registering custom web components
customElements.define('celtra-slider-group', SliderGroup);
customElements.define('celtra-slider', Slider);
