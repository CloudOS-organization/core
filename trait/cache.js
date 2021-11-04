export default class Cache {
    constructor(app) {
        this.app = app;
    }
    set(key, value) {
        window.sessionStorage.setItem(`os:${this.app.config.id}:${key}`, JSON.stringify(value));
    }
    get(key) {
        return JSON.parse(window.sessionStorage.getItem(`os:${this.app.config.id}:${key}`));
    }
    ref(key) {
        return new Proxy(this.get(key) ?? {}, {
            set: (self, prop, value) => {
                self[prop] = value;
                this.set(key, self);
                return true;
            },
            get: (self, prop) => {
                return self[prop];
            }
        });
    }
    remove(key) {
        window.sessionStorage.removeItem(`os:${this.app.config.id}:${key}`);
    }
}
