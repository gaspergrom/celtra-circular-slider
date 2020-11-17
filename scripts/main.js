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
        this._loaded = false;
    }

    // Component attached to DOM
    connectedCallback () {
        this._params = this._params || {};

        // Initialize value and attributes
        this.initializeValue();
        this.initializeAttributes();

        // Build component if params are valid
        if(this.valid){
            // Build component
            this.build();

            // Initialize bounds and center
            this.initializeBounds();

            // trigger initial value event
            this.changeValue(this._params.value);

            // Render slider by initial value
            this.calculateCornerByValue(this._params.value);
            this.render();
            this._loaded = true;

            // Setup event listeners
            // Drag event for desktop devices
            this._handler.addEventListener('drag', (e) => {
                this.updateValue(e.pageX, e.pageY);
            });

            // touch event for mobile devices
            this._handler.addEventListener('touchmove', (e) => {
                const touch = e && e.changedTouches && e.changedTouches.length && e.changedTouches[0];
                this.updateValue(touch.pageX, touch.pageY);
            }, false);

            this.addEventListener('click', (e) => {
                this._corner.prev = this.pageCoordsToDeg(e.pageX, e.pageY);
                this.updateValue(e.pageX, e.pageY, false);
            });

            // Adjust layout on window resize
            window.addEventListener('resize', () => {
                this.initializeBounds();
                this.calculateCornerByValue(this._params.value);
                this.render();
            });
        }
    }

    // Component detached from DOM - remove event listeners
    disconnectedCallback () {
        this._handler.removeEventListener('drag');
        this._handler.removeEventListener('touchmove');
        window.removeEventListener('resize');
    }

    // // On attribute change
    attributeChangedCallback () {
        // Preventing to be triggered before component initialization
        if(this._loaded){
            // Update attribute values and rerender
            this.initializeValue();
            if(this.valid){
                this.calculateCornerByValue(this._params.value);
                this.render();
            }
        }
    }

    static get observedAttributes () {
        return [
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
        if (this._params.value < this._params.min || this._params.value > this._params.max) {
            console.error('Initial value should be between minimum and maximum value');
            return false;
        }
        if (this._params.radius < 1 || this._params.radius > 360) {
            console.error('Radius value should be between 1 and 360');
            return false;
        }
        return true;
    }

    // Building component html
    build () {
        this.classList.add('circular__slider');

        // Add handler
        const handler = document.createElement('div');
        handler.classList.add('circular__handler');
        handler.setAttribute('draggable', 'true');
        this.appendChild(handler);
        this._handler = handler;

        // Build markers
        const markerCount = Math.floor((this._params.max - this._params.min) / this._params.step);
        for (let i = 0; i <= markerCount; i++) {
            const marker = document.createElement('div');
            marker.classList.add('circular__marker');
            marker.style.transform = `rotate(${(this._params.radius / markerCount) * i}deg)`;
            if ((i === 0 || i === markerCount)) {
                marker.classList.add('main');
            }
            this.appendChild(marker);
        }
    }

    // Render progress and handler based on corner params
    render () {
        // Update line
        if (this._params.radius < 360) {
            this.style.backgroundImage = `conic-gradient(${this._params.color} ${this._corner.deg}deg, #eee ${this._corner.deg}deg, #eee ${this._params.radius}deg, white ${this._params.radius}deg)`;
        }
        else {
            this.style.backgroundImage = `conic-gradient(${this._params.color} ${this._corner.deg}deg, #eee 0)`;
        }

        // Update handler position
        if (this._handler) {
            this._handler.style.top = `${(Math.sin(this._corner.tan) + 1) * this._bounds.height / 2 - 15}px`;
            this._handler.style.left = `${(Math.cos(this._corner.tan) + 1) * this._bounds.width / 2 - 15}px`;
        }
    }

    updateValue (pageX, pageY, checkLimit = true) {
        if (this.valid) {
            const oldValue = this._params.value;
            const value = this.calculateValueFromPosition(pageX, pageY);
            if (oldValue !== value) {
                // disable rendering for jumpink from minimum to max value
                if (checkLimit && Math.abs(oldValue - value) > (this._params.max - this._params.min) * 0.25) {
                    return false;
                }
                this._params.value = value;
                this.calculateCornerByValue(value);
                this.changeValue(value);
                this.render();
            }
        }
    }

    // Initialize default params needed for component functionality
    initializeAttributes () {
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
    }
    initializeBounds(){
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
    }

    // Initialize value attribute
    initializeValue () {
        this._params.value = parseFloat(this.getAttribute('value')) || parseFloat(this.getAttribute('min')) || 0;
    }

    pageCoordsToDeg (pageX, pageY) {
        // Getting axis differences
        const xdif = pageX - this._bounds.center.x;
        const ydif = pageY - this._bounds.center.y;
        // Getting degrees of current cursor position from center of the slider
        return ((Math.atan2(ydif, xdif) / Math.PI * 180) + 450) % 360;
    }

    // Calculate tangens and corner in degrees
    calculateValueFromPosition (pageX, pageY) {
        // Getting coordinates from cursor position
        const deg = this.pageCoordsToDeg(pageX, pageY);
        const range = this._params.max - this._params.min;

        const offset = Math.round(range * deg / this._params.radius / this._params.step) * this._params.step;
        // Getting value based on slider range and step
        const value = this._params.min + offset;

        // Preventing jumps which are occured by drag event
        if (Math.abs(deg - this._corner.prev) < 3) {
            // Preventing value to be out of range if slider has radius
            if (value >= this._params.min && value <= this._params.max) {
                return value;
            }
        }
        this._corner.prev = deg;
        return this._params.value;
    }

    // Getting degrees and tangens based on step value
    calculateCornerByValue (value) {
        const offset = value - this._params.min;
        const range = this._params.max - this._params.min;
        // Calculate corners for value
        let stepDeg = (offset) * this._params.radius / range % 360;
        const stepTan = (stepDeg - 90) / 180 * Math.PI;

        // Add support for max value
        if (!stepDeg && value === this._params.max) {
            stepDeg = 360;
        }
        // Assign corner values
        this._corner.deg = stepDeg;
        this._corner.tan = stepTan;
    }

    changeValue (value) {
        // Set value attribute
        this.setAttribute('value', value);

        // Emit event
        const event = new CustomEvent('change', { detail: { value } });
        this.dispatchEvent(event);

        // Trigger function if there is events parameter
        if (this._events.change && this._events.change in window && typeof window[this._events.change] === 'function') {
            window[this._events.change](event)
        }
    }
}

// Registering custom web components
customElements.define('celtra-slider-group', SliderGroup);
customElements.define('celtra-slider', Slider);
