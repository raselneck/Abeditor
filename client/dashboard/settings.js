
class Setting {
  constructor(name, type, display, def, change) {
    this.name = name;
    this.type = type;
    Setting.map[this.name] = this;
    this.display = display;
    this.change = change;
    this.default = def;
    if(this.type != Setting.types.misc && this.type != Setting.types.popup) this.update(Setting.retrieve(this.name) || def); // values should be objects
  }

  genElement() {
    let el = document.createElement('li');
    let extra;
    if(this.type == Setting.types.checkbox) {
      extra = document.createElement('input');
      extra.type = 'checkbox';
      extra.checked = this.value;
      extra.onchange = () => this.update(extra.checked);
    }
    else if(this.type == Setting.types.number) {
      extra = document.createElement('input');
      extra.type = 'text';
      extra.value = this.value;
      extra.onchange = () => {
        let val = Number.parseFloat(extra.value);
        if(!Number.isNaN(val)) this.update(val);
      };
    }
    else if(this.type == Setting.types.text) {
      extra = document.createElement('input');
      extra.type = 'text';
      extra.value = this.value;
      extra.onchange = () => this.update(extra.value);
    }
    el.innerHTML = `<a href="#">${this.display}</a>`; // replace later based on setting type
    if(extra) el.querySelector('a').appendChild(extra);
    return el;
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
  text: 2,
  popup: 3,
  misc: 4
};
Object.freeze(Setting.types);

Setting.map = {};

Setting.separator = (() => {
  let s = new Setting('sep',Setting.misc,'','',()=>{});
  s.genElement = function() {
    let el = document.createElement('li');
    el.role = 'separator';
    el.classList.add('divider');
    return el;
  };
  return s;
})();

Setting.config = [
  { name: 'newFile',   type: Setting.types.misc,   display: 'New',           change: () => window.open(window.location.href) }, // adjust to open new instance
  { name: 'openFile',  type: Setting.types.misc,   display: 'Open',          change: openGistDialog },
  { name: 'saveFile',  type: Setting.types.misc,   display: 'Save',
    change: () => saveAs(new Blob([sessionDoc.getValue()], { type: "text/plain;charset=utf-8" }), "file.txt") }, // update with filename
  { name: 'saveGist',  type: Setting.types.misc,   display: 'Save Gist',     change: saveCurrentGistFile},


  { name: 'softTabs',  type: Setting.types.checkbox, display: 'Use Tabs',  def: false, change: value => session.setUseSoftTabs(!value) },
  { name: 'tabSize',   type: Setting.types.number,   display: 'Tab Size:', def: 4,   change: value => session.setTabSize(value) }
];
