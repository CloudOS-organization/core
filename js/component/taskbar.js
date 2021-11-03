import {Component, html, global} from '../deps.js';

export default class Taskbar extends Component {
    static name = 'os-taskbar';
    render() {
        return html`
            ${global.main.apps.map(app => {
                return html`
                    <div class="${app.id}" style="background-image: url(${app.icon});" @click=${() => this.doOpen(app)} data-title="${app.name}"></div>
                `;
            })}
        `;
    }
    doOpen(app) {
        if(app.window === null) {
            app.open();
        }
        else {
            app.window.toggleMinimize();
        }
    }
}
