import {LitElement} from 'https://cdn.skypack.dev/lit';
export * from 'https://cdn.skypack.dev/lit';

export const global = {};

export class Component extends LitElement {
    static create() {
        return document.createElement(this.name);
    }
    createRenderRoot() {
        return this;
    }
    constructor() {
        super();
        const {properties, impl, use: elements} = this.constructor;
        if(properties) {
            for(const [key, type] of Object.entries(properties)) {
                if(type.initial !== undefined) {
                    this[key] = type.initial;
                }
            }
        }
        if(impl) {
            for(const trait of impl) {
                for(const [key, method] of Object.entries(trait)) {
                    this[key] = method.bind(this);
                }
            }
        }
        if(elements) {
            use(...elements);
        }
    }
    firstUpdated() {
        const {ref} = this.constructor;
        if(ref) {
            for(const [key, query] of Object.entries(ref)) {
                this[key] = Array.isArray(query) ? this.refAll(...query) : this.ref(query);
            }
        }
    }
    ref(query) {
        return this.renderRoot.querySelector(query);
    }
    refAll(query) {
        return this.renderRoot.querySelectorAll(query);
    }
}

export const Type = {
    string: (initial = '', options = {}) => ({type: 'string', initial, ...options }),
    number: (initial = 0, options = {}) => ({type: 'number', initial, ...options }),
    boolean: (initial = false, options = {}) => ({type: 'boolean', initial, ...options }),
    object: (initial = {}, options = {}) => ({type: 'object', initial, ...options }),
    array: (initial = [], options = {}) => ({type: 'array', initial, ...options }),
    state: (options = {}) => ({type: 'object', state: true, ...options })
}

export function use(...elements) {
    elements.forEach(element => customElements.define(element.name, element));
}

export function ref(query) {
    return document.querySelector(query);
}
export function refAll(query) {
    return document.querySelectorAll(query);
}

export function directive(type) {
    return import(`https://cdn.skypack.dev/lit/directives/${type}.js`);
}
