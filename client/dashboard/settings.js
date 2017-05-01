
class Setting {
    constructor(name, display, def, change) {
        this.name = name;
        Setting.map[this.name] = this;
        this.display = display;
        this.change = change;
        this.default = def;
        this.update(Setting.retrieve(this.name) || def); // values should be objects
    }

    static retrieve(name) {
        let val = window.localStorage.getItem(name);
        if(!val) return null;

        return JSON.parse(val).value; // all values are wrapped before storage
    }

    // value is sanitized before this call
    update(value) {
        this.value = value;
        this.change(this.value);
        window.localStorage.setItem(this.name, JSON.stringify({ value }));
    }
}

Setting.map = {};

Setting.config = [
    { name: 'softTabs', display: 'Use Tabs', def: false, change: value => session.setUseSoftTabs(!value) },
    { name: 'tabSize', display: 'Tab Size:', def: 4, change: value => session.setTabSize(value) }
];

window.addEventListener('load', () => {
    Setting.config.forEach(val => new Setting(val.name, val.display, val.def, val.change));
});
