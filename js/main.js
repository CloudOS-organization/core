import {Component, Type, use, html, global} from './deps.js';
import {Desk, Taskbar} from './component/mod.js';

export default class Main extends Component {
    static name = 'os-main';
    static properties = {
        apps: Type.array()
    };
    static use = [Desk, Taskbar];
    static ref = {
        desk: 'os-desk',
        taskbar: 'os-taskbar'
    };
    async connectedCallback() {
        super.connectedCallback();
        this.apps = await loadApps();
        this.taskbar.requestUpdate();
    }
    render() {
        return html`
            <os-desk></os-desk>
            <os-taskbar></os-taskbar>
        `;
    }
}

async function loadApps() {
    const apps = [];
    const sheets = [];
    const {default: config} = await import('/app/config.json', { assert: { type: 'json' } });
    for(const app of config) {
        const {default: appConfig} = await import(`/app/${app}/config.json`, { assert: { type: 'json' } });
        const {id, name, icon, main, style} = appConfig;
        const component = (await import(`/app/${app}/${main}`)).default;
        use(component);
        if(style) {
            const {default: sheet} = await import(`/app/${app}/${style}`, { assert: { type: 'css' } });
            sheets.push(sheet);
        }
        apps.push({
            id,
            name,
            icon: `/app/${app}/${icon}`,
            window: null,
            open() {
                this.window = component.create(appConfig);
                global.main.desk.windows.push(this.window);
                global.main.desk.requestUpdate();
            }
        });
    }
    document.adoptedStyleSheets = sheets;
    return apps;
}
