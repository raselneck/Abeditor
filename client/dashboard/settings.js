
class Setting {
    constructor(name, type, display, def, change) {
        this.name = name;
        this.type = type;
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

Setting.types = {
    checkbox: 0,
    number: 1,
    text: 2
};
Object.freeze(Settings.types);

Setting.map = {};

class Menu {
    constructor(name) {
        this.name = name;
    }
}

Menu.map = {};
Menu.map.file = new Menu('File');
Menu.map.edit = new Menu('Edit');
Menu.map.view = new Menu('View');

Menu.list = [ Menu.map.file, Menu.map.edit, Menu.map.view ]; // display the menus in this order

Setting.config = [
    { name: 'softTabs', type: Setting.types.checkbox, display: 'Use Tabs',  def: false, change: value => session.setUseSoftTabs(!value) },
    { name: 'tabSize',  type: Setting.types.number,   display: 'Tab Size:', def: 4,     change: value => session.setTabSize(value) }
];

Menu.map.file.contents = []; // if it's a string, it's a setting, otherwise it's a submenu or popup

window.addEventListener('load', () => {
    Setting.config.forEach(val => new Setting(val.name, val.display, val.def, val.change));

    Object.keys(Menu.map).forEach(key => {
        const menu = Menu.map[key];
        menu.contents.forEach((item, i) => {
            if(typeof(item) === 'string')
                menu.contents[i] = Setting.map[item];
            else if///
        });
    });
});