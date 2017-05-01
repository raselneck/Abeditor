let menu;

// Defines an easy way to interact with the menu
class Menu {
  // Create the menu by loading all of the elements and handling their events
  constructor(settings) {
    this.settings = settings;
    this.file = {};
    this.edit = {};

    this.findElements();
    this.handleEvents();
  }

  // Finds all of the elements necessary for this menu
  findElements() {
    this.file.new = $('#file-new');
    this.file.open = $('#file-open');
    this.file.save = $('#file-save');

    this.edit.cut = $('#edit-cut');
    this.edit.copy = $('#edit-copy');
    this.edit.paste = $('#edit-paste');
  }

  // Handles all of the events for elements
  handleEvents() {
    this.file.new.click(this.onNew.bind(this));
    this.file.open.click(this.onOpen.bind(this));
    this.file.save.click(this.onSave.bind(this));

    this.edit.cut.click(this.onCut.bind(this));
    this.edit.copy.click(this.onCopy.bind(this));
    this.edit.paste.click(this.onPaste.bind(this));
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // File menu handlers
  //

  // Handles when File>New is clicked
  onNew() { }

  // Handles when File>Open is clicked
  onOpen() { }

  // Handles when File>Save is clicked
  onSave() { }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // Edit menu handlers
  //

  // Handles when Edit>Cut is clicked
  onCut() { }

  // Handles when Edit>Copy is clicked
  onCopy() { }

  // Handles when Edit>Paste is clicked
  onPaste() { }
}

// When the document is ready
$(document).ready(() => {
  // If there's nothing to render the menu into, then don't both rendering it
  const menuTarget = document.querySelector('#navbar-menu');
  if (!menuTarget) {
    return;
  }

  // Render the menu
  const renderMenu = function() {
    return (
      <ul className="nav navbar-nav">
        {/* File menu */}
        <li className="dropdown">
          <a  href="#"
              className="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false">
            File <span className="caret"></span>
          </a>
          <ul className="dropdown-menu">
            <li><a href="#" id="#file-new">New</a></li>
            <li><a href="#" id="#file-open">Open</a></li>
            <li role="separator" className="divider"></li>
            <li><a href="#" id="#file-save">Save</a></li>
          </ul>
        </li>
        {/* Edit menu */}
        <li className="dropdown">
          <a  href="#"
              className="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false">
            Edit <span className="caret"></span>
          </a>
          <ul className="dropdown-menu">
            <li><a href="#" id="#edit-cut">Cut</a></li>
            <li><a href="#" id="#edit-copy">Copy</a></li>
            <li><a href="#" id="#edit-paste">Paste</a></li>
          </ul>
        </li>
      </ul>
    );
  };

  // Create the React menu class
  const MenuClass = React.createClass({
    // Handles the class being rendered
    render: renderMenu,
  });

  // Render the menu
  const menuRenderer = ReactDOM.render(<MenuClass />, menuTarget);

  // Load the menu
  menu = new Menu();
});
