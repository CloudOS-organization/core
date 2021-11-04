import {Component, Type, use, html, global} from './deps.js';
import {Desk, Taskbar} from './component/mod.js';

export default class Main extends Component {
    static name = 'os-main';
    static properties = {
        host: Type.string(window.location.origin),
        apps: Type.array(),
        sheets: Type.array()
    };
    static use = [Desk, Taskbar];
    static ref = {
        desk: 'os-desk',
        taskbar: 'os-taskbar'
    };
    constructor() {
        super();
        this.fetchApps();
    }
    render() {
        return html`
            <os-desk></os-desk>
            <os-taskbar></os-taskbar>
        `;
    }
    async fetchApps() {
        const {default: apps} = await import(this.host + '/app/apps.json', { assert: { type: 'json' } });
        for(const id of apps) {
            const app = await this.fetchApp(id);
            this.loadApp(app);
        }
    }
    async fetchApp(id) {
        const {default: app} = await await import(this.host + '/app/' + id + '/config.json', { assert: { type: 'json' } });
        app.icon = this.host + '/app/' + app.id + '/' + app.icon;
        app.home = this.host + '/app';
        return app;
    }
    async loadApp(app) {
        const component = (await import(this.path(app) + app.main)).default;
        use(component);
        if(app.style) {
            const {default: sheet} = await import(this.path(app) + app.style, { assert: { type: 'css' } });
            this.sheets.push(sheet);
            document.adoptedStyleSheets = this.sheets;
        }
        this.apps.push({
            ...app,
            window: null,
            open() {
                this.window = component.create(app);
                global.main.desk.windows.push(this.window);
                global.main.desk.requestUpdate();
            }
        });
        this.taskbar.requestUpdate();
    }
    path(app) {
        return app.home + '/' + app.id + '/';
    }
}
