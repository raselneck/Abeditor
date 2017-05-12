
class Setting {
  constructor(name, type, display, def, options, change) {
    //console.log(name, type, display, def, options, change);
    this.name = name;
    this.type = type;
    Setting.map[this.name] = this;
    this.display = display;
    this.change = change;
    this.default = def;
    this.options = options;
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
      extra.style.textAlign = 'center';
      extra.onchange = () => {
        let val = Number.parseFloat(extra.value);
        if(!Number.isNaN(val)) this.update(val);
      };
    }
    else if(this.type == Setting.types.text) {
      extra = document.createElement('input');
      extra.type = 'text';
      extra.value = this.value;
      extra.style.textAlign = 'center';
      extra.onchange = () => this.update(extra.value);
    }
    else if(this.type == Setting.types.dropdown) {
      extra = document.createElement('select');
      this.options.forEach(opt => {
        extra.innerHTML += `<option value="${opt.value}">${opt.display}</option>`;
      });
      extra.value = this.value;
      extra.style.textAlign = 'center';
      extra.onchange = () => this.update(extra.value);
    }
    el.innerHTML = `<a href="#" style="display: flex; justify-content: space-between"><p style="padding-right: 20px">${this.display}</p></a>`; // replace later based on setting type
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
  dropdown: 3,
  popup: 4,
  misc: 5
};
Object.freeze(Setting.types);

Setting.map = {};

Setting.separator = (() => {
  let s = new Setting('sep',Setting.misc,'','',null,()=>{});
  s.genElement = function() {
    let el = document.createElement('li');
    el.role = 'separator';
    el.classList.add('divider');
    return el;
  };
  return s;
})();

const strComp = (a,b) => {
  const as = a.toUpperCase(), bs = b.toUpperCase();
  if(as < bs) return -1;
  if(as > bs) return 1;
  return 0;
};

Setting.config = [
  { name: 'fileName', type: Setting.types.text, def: "Filename.txt", 
    change: value => {
      filename.update(value);
  } },

  { name: 'newFile',   type: Setting.types.misc,   display: 'New',           change: () => window.open('/edit') }, // adjust to open new instance
  { name: 'openFile',  type: Setting.types.misc,   display: 'Open',          change: openGistDialog },
  { name: 'saveFile',  type: Setting.types.misc,   display: 'Save',
    change: () => saveAs(new Blob([sessionDoc.getValue()], { type: "text/plain;charset=utf-8" }), Setting.map.fileName.value) }, // update with filename
  { name: 'saveGist',  type: Setting.types.misc,   display: 'Save Gist',     change: saveCurrentGistFile},

  { name: 'theme',     type: Setting.types.dropdown,   display: 'Theme', def: 'monokai', 
    options: [ 
      { display: 'Monokai', value: 'monokai' }, 
      { display: 'Terminal', value: 'terminal' },
      { display: 'X-Code', value: 'xcode' },
      { display: 'Chrome', value: 'chrome' },
      { display: 'Solarized Dark', value: 'solarized_dark' }, 
      { display: 'Solarized Light', value: 'solarized_light' }
    ],
    change: value => { try { editor.setTheme(`ace/theme/${value}`); } catch(e) { console.log(`Invalid theme: ${value}`); } } }, // TODO fix with list
  { name: 'language',  type: Setting.types.dropdown,   display: 'Language', def: 'javascript',
    options: [ 
      { display: 'Javascript', value: 'javascript' }, 
      { display: 'Plain-text', value: 'plain_text' },
      { display: 'C#', value: 'csharp' },
      { display: 'CSS', value: 'css' },
      { display: 'C/C++', value: 'c_cpp' }, 
      { display: 'HTML', value: 'html' },
      { display: 'GLSL', value: 'glsl' }
    ].sort((a,b) => strComp(a.display, b.display)),
    change: value => { try { session.setMode(`ace/mode/${value}`); }  catch(e) { console.log(`Invalid language: ${value}`); } } }, // TODO fix with list

  { name: 'softTabs',  type: Setting.types.checkbox, display: 'Use Tabs',  def: false, change: value => session.setUseSoftTabs(!value) },
  { name: 'tabSize',   type: Setting.types.number,   display: 'Tab Size:', def: 4,   change: value => session.setTabSize(value) }
];
