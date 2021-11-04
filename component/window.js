import {Component, Type, html, global} from '../deps.js';
import {Storage, Cache} from '../trait/mod.js';

const INITIAL_WIDTH = 900;
const INITIAL_HEIGHT = 600;

export default class Window extends Component {
    static name = 'os-window';
    static properties = {
        config: Type.object(),
        x: Type.number(0),
        y: Type.number(0),
        width: Type.number(INITIAL_WIDTH),
        height: Type.number(INITIAL_HEIGHT),
        expanded: Type.boolean(),
        minimized: Type.boolean()
    };
    static ref = {
        frame: '.frame'
    };
    static create(config) {
        this.properties.config.initial = config;
        return super.create();
    }
    constructor() {
        super();
        this.storage = new Storage(this);
        this.cache = new Cache(this);
        this.socket = global.main.socket;
    }
    firstUpdated() {
        super.firstUpdated();
        this.open();
    }
    render() {
        const rect = global.main.getBoundingClientRect();
        let style = this.expanded
            ? `width: ${rect.width}px; height: ${rect.height}px; left: 0px; top: 0px;`
            : `width: ${this.width}px; height: ${this.height}px; left: ${this.x}px; top: ${this.y}px;`;
        if(this.minimized) {
            style += ' transform: scale(0.1); opacity: 0;';
        }
        return html`
            <div class="frame ${this.config.id}" style="${style}">
                <div class="head">
                    <div class="actions">
                        <div class="action close" @click=${this.close}></div>
                        <div class="action expand" @click=${this.toggleExpand}></div>
                        <div class="action minimize" @click=${this.toggleMinimize}></div>
                    </div>
                    <p class="title">${this.config.name}</p>
                </div>
                <div class="body">
                    ${this.renderBody()}
                </div>
            </div>
        `;
    }
    renderBody() {
        return '';
    }
    open() {
        const rect = global.main.getBoundingClientRect();
        this.x = rect.width / 2 - this.width / 2;
        this.y = rect.height / 2 - this.height / 2;
        this.frame.animate([
            { transform: 'scale(0.7)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: 150,
            easing: 'ease-out'
        });
    }
    close() {
        for(const app of global.main.apps) {
            if(app.id === this.config.id) {
                const animation = this.frame.animate([
                    { transform: 'scale(1)', opacity: 1 },
                    { transform: 'scale(0.7)', opacity: 0 }
                ], {
                    duration: 150,
                    easing: 'ease-in'
                });
                animation.onfinish = () => {
                    const index = global.main.desk.windows.indexOf(app.window);
                    global.main.desk.windows.splice(index, 1);
                    app.window = null;
                    global.main.desk.requestUpdate();
                }
                break;
            }
        }
    }
    toggleExpand() {
        const rect = global.main.getBoundingClientRect();
        let width = INITIAL_WIDTH;
        let height = INITIAL_HEIGHT;
        let x = 0;
        let y = 0;
        if(this.frame.classList.toggle('expanded')) {
            const animation = this.frame.animate([
                { left: `${this.x}px`, top: `${this.y}px`, width: `${this.width}px`, height: `${this.height}px` },
                { left: '0px', top: '0px', width: `${rect.width}px`, height: `${rect.height}px` }
            ], {
                duration: 200,
                easing: 'ease-in-out'
            });
            animation.onfinish = () => this.expanded = true;
        }
        else {
            const animation = this.frame.animate([
                { left: '0px', top: '0px', width: `${rect.width}px`, height: `${rect.height}px` },
                { left: `${this.x}px`, top: `${this.y}px`, width: `${this.width}px`, height: `${this.height}px` }
            ], {
                duration: 200,
                easing: 'ease-in-out'
            });
            animation.onfinish = () => this.expanded = false;
        }
    }
    toggleMinimize() {
        const rect = global.main.getBoundingClientRect();
        if(this.minimized) {
            global.main.desk.onTop(this);
            this.minimized = false;
            const animation = this.frame.animate([
                { transform: 'scale(0.1)', opacity: 0, left: `${rect.width / 2 - this.width / 2}px`, top: `${rect.height - this.height / 2 - 50}px` },
                { transform: 'scale(1)', opacity: 1, left: `${this.x}px`, top: `${this.y}px` }
            ], {
                duration: 200,
                easing: 'ease-in'
            });
        }
        else {
            const animation = this.frame.animate([
                { transform: 'scale(1)', opacity: 1, left: `${this.x}px`, top: `${this.y}px` },
                { transform: 'scale(0.1)', opacity: 0, left: `${rect.width / 2 - this.width / 2}px`, top: `${rect.height - this.height / 2 - 50}px` }
            ], {
                duration: 200,
                easing: 'ease-out'
            });
            animation.onfinish = () => this.minimized = true;
        }
    }
}
