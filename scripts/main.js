// class Slider{
//     constructor (parent, offset, params){
//         const el = document.getElementById('cont');
//         this.build(el);
//         this.degrees = 0;
//         const slider = document.querySelector('.circular__slider');
//         let {x, y, width, height} = slider.getBoundingClientRect();
//         [width, height] = [width - 6, height - 6];
//         const sliderX = x + width / 2;
//         const sliderY = y + height / 2;
//         const handler = document.querySelector('.circular__handler');
//         handler.eventMoveHandling = "Disabled";
//         handler.eventResizeHandling = "Disabled";
//         handler.timeRangeSelectedHandling = "Disabled";
//         handler.addEventListener('drag', (e) => {
//             const xDif = e.clientX - sliderX;
//             const yDif = e.clientY - sliderY;
//             const deg =((Math.atan2(yDif, xDif)/Math.PI * 180) + 450) % 360;
//             if(Math.abs(deg - this.previous)<3){
//                 this.degrees = deg;
//             }
//             this.previous = deg;
//             slider.style.cssText = `background-image: conic-gradient(red ${this.degrees}deg, #eee 0)`;
//             handler.style.cssText = `top: ${Math.sin((this.degrees-90)/180*Math.PI)*height/2 + height/2 -15}px;left: ${Math.cos((this.degrees-90)/180*Math.PI)*width/2 + width/2 -15}px;`;
//         });
//     }
//
//     initializeParams(){
//
//     }
//     render(){
//
//     }
//     build(parent){
//         const slider = document.createElement('div');
//         slider.classList.add('circular__slider');
//         const handler = document.createElement('div');
//         handler.classList.add('circular__handler');
//         handler.setAttribute('draggable', 'true');
//         slider.appendChild(handler);
//         parent.appendChild(slider);
//         this.slider = slider;
//     }
// }

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
        this.initializeParams();
        this._handler.addEventListener('drag', (e) => {
            const xDif = e.clientX - this._bounds.center.x;
            const yDif = e.clientY - this._bounds.center.y;
            this.calculateCorner(xDif, yDif);
            this.render();
//             const deg =((Math.atan2(yDif, xDif)/Math.PI * 180) + 450) % 360;
//             if(Math.abs(deg - this.previous)<3){
//                 this.degrees = deg;
//             }
//             this.previous = deg;
//             slider.style.cssText = `background-image: conic-gradient(red ${this.degrees}deg, #eee 0)`;
//             handler.style.cssText = `top: ${Math.sin((this.degrees-90)/180*Math.PI)*height/2 + height/2 -15}px;left: ${Math.cos((this.degrees-90)/180*Math.PI)*width/2 + width/2 -15}px;`;
        });
    }

    // Component detached from DOM
    disconnectedCallback () {
        this._handler.removeEventListener('drag');
    }

    // Render progress and handler based on corner params
    render () {
        this.style.backgroundImage = `conic-gradient(red ${this._corner.deg}deg, #eee 0)`;
        this._handler.style.top = `${Math.sin(this._corner.tan) * this._bounds.height / 2 + this._bounds.height / 2 - 15}px`;
        this._handler.style.left = `${Math.cos(this._corner.tan) * this._bounds.width / 2 + this._bounds.width / 2 - 15}px`;
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
    initializeParams () {
        let { x, y, width, height } = this.getBoundingClientRect();
        this._bounds = {
            x, y, width, height,
            center: {
                x: x + width / 2,
                y: y + height / 2
            }
        };
        this._corner = {
            tan: 0,
            deg: 0,
        }
    }

    // Calculate tangens and corner in degrees
    calculateCorner (xdif, ydif) {
        const tan = Math.atan2(ydif, xdif);
        const deg = ((tan / Math.PI * 180) + 450) % 360;
        if (Math.abs(deg - this._corner.prev) < 3) {
            this._corner.deg = deg;
            this._corner.tan = tan;
        }
        this._corner.prev = deg;
    }
}

customElements.define('celtra-slider-group', SliderGroup);
customElements.define('celtra-slider', Slider);
