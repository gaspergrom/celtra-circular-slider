class SliderGroup extends HTMLElement {
    constructor(){
        super();
    }
    connectedCallback(){
       this.classList.add('circular');
       this._children = [...this.childNodes].filter((child) => {
           return child.tagName === 'CELTRA-SLIDER';
       });
    }
}

class Slider extends HTMLElement {
    constructor(){
        super();
    }
    // Component attached to DOM
    connectedCallback(){
        this.build();
    }
    // Component detached from DOM
    disconnectedCallback(){

    }

    // Building component html
    build(){
        const handler = document.createElement('div');
        handler.classList.add('circular__handler');
        handler.setAttribute('draggable', 'true');
        this.appendChild(handler);
        this.classList.add('circular__slider');
        this._handler = handler;
    }
}

customElements.define('celtra-slider-group', SliderGroup);
customElements.define('celtra-slider', Slider);
