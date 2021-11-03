import {Component, Type, html, global} from '../deps.js';

export default class Desk extends Component {
    static name = 'os-desk';
    static properties = {
        windows: Type.array()
    };
    static ref = {
        container: '.container'
    };
    render() {
        return html`
            <div class="container" @click=${this.doClick} @mousedown=${this.doDrag} @mousemove=${this.doMove} @mouseup=${this.doLeave}>
                ${this.windows}
            </div>
        `;
    }
    onTop(window) {
        const index = this.windows.indexOf(window);
        this.windows.splice(index, 1);
        this.windows.push(window);
        this.requestUpdate();
    }
    hasFocus(window) {
        const windows = this.windows.filter(window => !window.minimized);
        const index = windows.indexOf(window);
        return index !== -1 && index + 1 === windows.length;
    }
    doClick(event) {
        const {target} = event;
        for(const window of this.windows) {
            if(window.contains(target)) {
                if(!this.hasFocus(window)) {
                    this.onTop(window);
                }
                break;
            }
        }
    }
    doDrag(event) {
        const {target} = event;
        for(const window of this.windows) {
            if(window.contains(target)) {
                if(target.classList.contains('head')) {
                    this.window = window;
                    this.offset = {
                        x: event.layerX,
                        y: event.layerY
                    };
                }
                break;
            }
        }
    }
    doMove(event) {
        if(this.window && !this.window.expanded) {
            if(!this.container.classList.contains('move')) {
                if(!this.hasFocus(this.window)) {
                    this.onTop(this.window);
                }
                this.container.classList.add('move');
            }
            this.window.x = event.pageX - this.offset.x;
            this.window.y = event.pageY - this.offset.y;
        }
    }
    doLeave() {
        this.container.classList.remove('move');
        this.window = null;
        this.offset = null;
    }
}
