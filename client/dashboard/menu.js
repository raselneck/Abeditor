let menu;

// Defines an easy way to interact with the menu
class Menu {
  // Create the menu by loading all of the elements and handling their events
  constructor(name) {
    this.name = name;
  }

  genElement() {
    let el = document.createElement('li');
    el.classList.add('dropdown');
    // https://cdn.meme.am/cache/images/folder826/600x600/16517826/principal-skinner-pathetic.jpg
    el.innerHTML = `<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">\
${this.name} <span class="caret"></span>\
</a><ul class="dropdown-menu"></ul>`;
    return el;
  }

  // Finds all of the elements necessary for this menu
  genElements() {
    let el = this.genElement();
    let items = el.querySelector('ul');
    this.contents.forEach(item => {
      let el = item.genElement();
      switch(item.type) {
        case Setting.types.misc:
          $(el).click(() => item.change());
          break;
      }
      // no code for fields yet
      items.appendChild(el);
    });
    return el;
  }
}

Menu.split = 0;

Menu.map = {};
Menu.map.file = new Menu('File');
Menu.map.edit = new Menu('Edit');
Menu.map.view = new Menu('View');

Menu.list = [ Menu.map.file, Menu.map.edit, Menu.map.view ]; // display the menus in this order

 // if it's a string, it's a setting, otherwise it's a submenu or popup
Menu.map.file.contents = [ "newFile", "openFile", Menu.split, "saveFile", "saveGist" ];
Menu.map.edit.contents = [ "softTabs", "tabSize" ];
Menu.map.view.contents = [ "theme", "language" ];

// When the document is ready
$(document).ready(() => {
  Setting.config.forEach(val => new Setting(val.name, val.type, val.display, val.def, val.change));

  // If there's nothing to render the menu into, then don't both rendering it
  const menuTarget = document.querySelector('#navbar-menu');
  if (!menuTarget) {
    return;
  }

  Object.keys(Menu.map).forEach(key => {
    const menu = Menu.map[key];
    menu.contents.forEach((item, i) => {
      let fin;
      if(item == Menu.split) fin = Setting.separator;
      else if (typeof(item) === 'string') fin = Setting.map[item];
      else fin = item;
      menu.contents[i] = fin;
    });
  });

  // Render the menu
  //const menuRenderer = ReactDOM.render(<MenuClass />, menuTarget);
  let root = document.createElement('ul');
  root.classList.add('nav');
  root.classList.add('navbar-nav');
  Object.keys(Menu.map).forEach(key => root.appendChild(Menu.map[key].genElements()));
  menuTarget.appendChild(root);

  initializeGistDialog();
});
