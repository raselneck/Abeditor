'use strict';

var editor = void 0,
    session = void 0,
    sessionDoc = void 0;
var socket = void 0,
    room = void 0;

$(document).ready(function () {
  room = document.querySelector('#room-id').innerHTML;
  if (Number.parseInt(room) == -1) {
    document.querySelector('#editor').innerHTML = '<h3>Invalid Room ID</h3>';
    return;
  }
  window.history.replaceState('', 'Abeditor', '/edit/' + room);

  socket = io.connect();

  // Handle the log out button being clicked
  $('#logout').click(function () {
    window.location = '/logout';
  });

  editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");

  session = editor.getSession();
  session.setMode("ace/mode/javascript");

  sessionDoc = session.getDocument();

  var actions = {
    insert: 0,
    remove: 1
  };

  var userEdit = true;

  var uid = void 0;
  socket.on('join', function (data) {
    uid = data.id;
    userEdit = false;
    session.insert({ row: 0, column: 0 }, data.text);
  });

  socket.on('update', function (data) {
    var delta = data.delta;
    switch (delta.action) {
      case actions.insert:
        userEdit = false;
        session.insert(delta.start, delta.lines);
        break;
      case actions.remove:
        userEdit = false;
        console.log(delta);
        session.remove({ start: delta.start, end: delta.end });
        break;
    }
  });

  session.on('change', function (e) {
    var userEdited = userEdit;
    userEdit = true;
    if (!userEdited) return;

    var delta = {
      action: actions[e.action]
    };
    switch (delta.action) {
      case actions.insert:
        delta.start = e.start;
        delta.start.index = sessionDoc.positionToIndex(delta.start, 0);
        delta.lines = e.lines.join('\n');
        break;
      case actions.remove:
        delta.start = e.start;
        delta.start.index = sessionDoc.positionToIndex(delta.start, 0);
        delta.end = e.end;
        delta.end.index = sessionDoc.positionToIndex(delta.end, 0);
        break;
    }
    socket.emit('input', { delta: delta });
  });

  socket.emit('join', { room: room });
});
'use strict';

var gistListRenderer = void 0;
var currentGist = void 0;
var currentGistFile = void 0;

// Reads the given gist file
var readGistFile = function readGistFile(url, callback) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: url,
    dataType: 'text',
    success: function success(response, status, xhr) {
      console.log(response);
    },
    error: function error() {
      displayError('Failed to read gist file.');
      currentGist = undefined;
      currentGistFile = undefined;
    }
  });
};

// Loads the current gist file
var loadCurrentGistFile = function loadCurrentGistFile() {
  var url = currentGistFile.raw_url;
  readGistFile(url, function (text) {
    // TODO - Display the text in the editor
  });
};

// Saves the current gist file
var saveCurrentGistFile = function saveCurrentGistFile() {
  var text = 'TODO - Get the text from the editor';

  // First we need a CSRF token
  getCsrfToken(function (token) {
    var data = {
      gist: currentGist,
      file: currentGistFile,
      text: text,
      _csrf: token
    };

    // Update the gist
    sendRequest('POST', '/update-gist', data, function (response) {
      // Shouldn't really be here, but...
      console.log('save response:', response);
    });
  });
};

// Renders the "no user" dialog
var renderNoUserDialog = function renderNoUserDialog() {
  return React.createElement(
    'p',
    null,
    'Uh-oh! You need an account to be able to use this.'
  );
};

// Renders the dialog showing
var renderNoGitHubDialog = function renderNoGitHubDialog() {
  return React.createElement(
    'p',
    null,
    'Oops! You\'ll need to ',
    React.createElement(
      'a',
      { href: '/account' },
      'connect to GitHub'
    ),
    'to be able to use this.'
  );
};

// Renders the gist dialog so that it shows a user's gists
var renderGistDialog = function renderGistDialog(self) {
  var gists = self.state.gists;

  // Map each gist to an element
  var listElements = gists.map(function (gist) {
    // Get all of the gist's files
    var gistFiles = [];
    Object.keys(gist.files).forEach(function (fileKey) {
      var file = gist.files[fileKey];

      // Loads the current gist file
      var loadFile = function loadFile() {
        currentGist = gist;
        currentGistFile = file;
        loadCurrentGistFile();

        $('#open-gist').modal('hide');
      };

      // Return the HTML for the gist file
      var filename = file.filename;
      var raw_url = file.raw_url;
      gistFiles.push(React.createElement(
        'div',
        { className: 'gist-file' },
        React.createElement(
          'p',
          null,
          'Name: ',
          filename
        ),
        React.createElement(
          'p',
          null,
          React.createElement(
            'a',
            { href: '#', onClick: loadFile },
            'Open'
          )
        )
      ));
    });

    // Return the gist file list
    return gistFiles;
  });

  return React.createElement(
    'div',
    { className: 'gists' },
    listElements
  );
};

// Shows the "Open Gist" dialog
var openGistDialog = function openGistDialog() {
  $('#open-gist').modal('show');
};

// Initializes the "Open Gist" dialog
var initializeGistDialog = function initializeGistDialog() {
  var emptyFunc = function emptyFunc() {};

  // Gets the gists for a component
  var getGistsForComponent = function getGistsForComponent(self, callback) {
    sendRequest('GET', '/get-gists', null, function (response) {
      var gists = response.data.gists;
      self.setState({ gists: gists });
      callback();
    });
  };

  // Checks to see if a string is valid
  var isValidString = function isValidString(str) {
    return typeof str === 'string' && str !== '';
  };

  // Get some account info
  var accountName = $('#account-info').attr('data-username');
  var accountToken = $('#account-info').attr('data-ghtoken');

  // Define the gist list class
  var GistListClass = React.createClass({
    displayName: 'GistListClass',

    // Loads the gists
    loadGists: function loadGists(callback) {
      getGistsForComponent(this, callback || emptyFunc);
    },

    // Gets the initial state
    getInitialState: function getInitialState() {
      return { gists: [] };
    },

    // Renders the list
    render: function render() {
      if (!isValidString(accountName)) {
        return renderNoUserDialog();
      } else if (!isValidString(accountToken)) {
        return renderNoGitHubDialog();
      } else {
        return renderGistDialog(this);
      }
    }
  });

  // Get the target to display the gists
  var target = document.querySelector('#open-gist-body');

  // Render the gist list
  gistListRenderer = ReactDOM.render(React.createElement(GistListClass, null), target);
  gistListRenderer.loadGists();
};
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var menu = void 0;

// Defines an easy way to interact with the menu

var Menu = function () {
  // Create the menu by loading all of the elements and handling their events
  function Menu(name) {
    _classCallCheck(this, Menu);

    this.name = name;
  }

  _createClass(Menu, [{
    key: 'genElement',
    value: function genElement() {
      var el = document.createElement('li');
      el.classList.add('dropdown');
      // https://cdn.meme.am/cache/images/folder826/600x600/16517826/principal-skinner-pathetic.jpg
      el.innerHTML = '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' + this.name + ' <span class="caret"></span></a><ul class="dropdown-menu"></ul>';
      return el;
    }

    // Finds all of the elements necessary for this menu

  }, {
    key: 'genElements',
    value: function genElements() {
      var el = this.genElement();
      var items = el.querySelector('ul');
      this.contents.forEach(function (item) {
        var el = item.genElement();
        switch (item.type) {
          case Setting.types.misc:
            $(el).click(function () {
              return item.change();
            });
            break;
        }
        // no code for fields yet
        items.appendChild(el);
      });
      return el;
    }
  }]);

  return Menu;
}();

Menu.split = 0;

Menu.map = {};
Menu.map.file = new Menu('File');
Menu.map.edit = new Menu('Edit');
//Menu.map.view = new Menu('View');

Menu.list = [Menu.map.file, Menu.map.edit, Menu.map.view]; // display the menus in this order

// if it's a string, it's a setting, otherwise it's a submenu or popup
Menu.map.file.contents = ["newFile", "openFile", Menu.split, "saveFile", "saveGist"];
Menu.map.edit.contents = ["softTabs", "tabSize"];

// When the document is ready
$(document).ready(function () {
  Setting.config.forEach(function (val) {
    return new Setting(val.name, val.type, val.display, val.def, val.change);
  });

  // If there's nothing to render the menu into, then don't both rendering it
  var menuTarget = document.querySelector('#navbar-menu');
  if (!menuTarget) {
    return;
  }

  Object.keys(Menu.map).forEach(function (key) {
    var menu = Menu.map[key];
    menu.contents.forEach(function (item, i) {
      var fin = void 0;
      if (item == Menu.split) fin = Setting.separator;else if (typeof item === 'string') fin = Setting.map[item];else fin = item;
      menu.contents[i] = fin;
    });
  });

  // Render the menu
  //const menuRenderer = ReactDOM.render(<MenuClass />, menuTarget);
  var root = document.createElement('ul');
  root.classList.add('nav');
  root.classList.add('navbar-nav');
  Object.keys(Menu.map).forEach(function (key) {
    return root.appendChild(Menu.map[key].genElements());
  });
  menuTarget.appendChild(root);

  initializeGistDialog();
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Setting = function () {
  function Setting(name, type, display, def, change) {
    _classCallCheck(this, Setting);

    this.name = name;
    this.type = type;
    Setting.map[this.name] = this;
    this.display = display;
    this.change = change;
    this.default = def;
    if (this.type != Setting.types.misc && this.type != Setting.types.popup) this.update(Setting.retrieve(this.name) || def); // values should be objects
  }

  _createClass(Setting, [{
    key: 'genElement',
    value: function genElement() {
      var _this = this;

      var el = document.createElement('li');
      var extra = void 0;
      if (this.type == Setting.types.checkbox) {
        extra = document.createElement('input');
        extra.type = 'checkbox';
        extra.checked = this.value;
        extra.onchange = function () {
          return _this.update(extra.checked);
        };
      } else if (this.type == Setting.types.number) {
        extra = document.createElement('input');
        extra.type = 'text';
        extra.value = this.value;
        extra.onchange = function () {
          var val = Number.parseFloat(extra.value);
          if (!Number.isNaN(val)) _this.update(val);
        };
      } else if (this.type == Setting.types.text) {
        extra = document.createElement('input');
        extra.type = 'text';
        extra.value = this.value;
        extra.onchange = function () {
          return _this.update(extra.value);
        };
      }
      el.innerHTML = '<a href="#">' + this.display + '</a>'; // replace later based on setting type
      if (extra) el.querySelector('a').appendChild(extra);
      return el;
    }
  }, {
    key: 'update',


    // value is sanitized before this call
    value: function update(value) {
      this.value = value;
      this.change(this.value);
      window.localStorage.setItem(this.name, JSON.stringify({ value: value }));
    }
  }], [{
    key: 'retrieve',
    value: function retrieve(name) {
      var val = window.localStorage.getItem(name);
      if (!val) return null;

      return JSON.parse(val).value; // all values are wrapped before storage
    }
  }]);

  return Setting;
}();

Setting.types = {
  checkbox: 0,
  number: 1,
  text: 2,
  popup: 3,
  misc: 4
};
Object.freeze(Setting.types);

Setting.map = {};

Setting.separator = function () {
  var s = new Setting('sep', Setting.misc, '', '', function () {});
  s.genElement = function () {
    var el = document.createElement('li');
    el.role = 'separator';
    el.classList.add('divider');
    return el;
  };
  return s;
}();

Setting.config = [{ name: 'newFile', type: Setting.types.misc, display: 'New', change: function change() {
    return window.open(window.location.href);
  } }, // adjust to open new instance
{ name: 'openFile', type: Setting.types.misc, display: 'Open', change: openGistDialog }, { name: 'saveFile', type: Setting.types.misc, display: 'Save',
  change: function change() {
    return saveAs(new Blob([sessionDoc.getValue()], { type: "text/plain;charset=utf-8" }), "file.txt");
  } }, // update with filename
{ name: 'saveGist', type: Setting.types.misc, display: 'Save Gist', change: saveCurrentGistFile }, { name: 'softTabs', type: Setting.types.checkbox, display: 'Use Tabs', def: false, change: function change(value) {
    return session.setUseSoftTabs(!value);
  } }, { name: 'tabSize', type: Setting.types.number, display: 'Tab Size:', def: 4, change: function change(value) {
    return session.setTabSize(value);
  } }];
"use strict";

var hasSignedInUser = false;

// Renders the sign in form for the navbar
var renderNavbarSignInForm = function renderNavbarSignInForm() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { className: "navbar-form",
        name: "sign-in-form",
        id: "sign-in-form",
        onSubmit: this.handleSubmit,
        method: "POST",
        action: "/login" },
      React.createElement("input", { type: "hidden", name: "_csrf", value: this.props.csrf }),
      React.createElement("input", { type: "text", id: "sign-in-name", name: "user", placeholder: "Username", className: "form-control" }),
      React.createElement("input", { type: "password", id: "sign-in-pass", name: "pass", placeholder: "Password", className: "form-control" }),
      React.createElement(
        "button",
        { id: "navbar-log-in", type: "submit", className: "btn btn-success form-control", onClick: this.handleSignIn },
        "Log In"
      ),
      React.createElement(
        "button",
        { id: "navbar-sign-up", className: "btn btn-primary form-control", onClick: this.handleSignUp },
        "Sign Up"
      )
    )
  );
};

// Renders the navbar account info
var renderNavbarAccountInfo = function renderNavbarAccountInfo() {
  return React.createElement(
    "ul",
    { className: "nav navbar-nav" },
    React.createElement(
      "li",
      { className: "dropdown" },
      React.createElement(
        "a",
        { href: "#",
          className: "dropdown-toggle",
          "data-toggle": "dropdown",
          role: "button",
          "aria-haspopup": "true",
          "aria-expanded": "false" },
        "Hello, ",
        this.state.username,
        " ",
        React.createElement("span", { className: "caret" })
      ),
      React.createElement(
        "ul",
        { className: "dropdown-menu" },
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "/account" },
            "Account"
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "/change-password" },
            "Change Password"
          )
        ),
        React.createElement("li", { role: "separator", className: "divider" }),
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "/logout" },
            "Log Out"
          )
        )
      )
    )
  );
};

// Sets up the navbar sign-in form
var initNavbar = function initNavbar(token) {
  var csrf = token;
  var target = document.querySelector('#navbar-data');

  // If the target doesn't exist, then just stop what we're doing
  if (!target) {
    return;
  }

  // Initializes the navbar sign-in form
  var initNavbarSignIn = function initNavbarSignIn() {
    // Create the sign in form
    var NavbarSignIn = React.createClass({
      displayName: "NavbarSignIn",

      // Handles the form being rendered
      render: renderNavbarSignInForm,

      // Handles the form being submitted
      handleSubmit: function handleSubmit(e) {
        e.preventDefault();
      },

      // Handles the sign in button being clicked
      handleSignIn: function handleSignIn(e) {
        e.preventDefault();

        var usernameElem = $('#sign-in-name');
        var passwordElem = $('#sign-in-pass');

        var username = usernameElem.val();
        var password = passwordElem.val();

        // Ensure the username and password have been entered
        if (!username || !password) {
          displayError('Oops! To sign in you need a username AND a password!');
          return false;
        }

        // Attempt to sign in
        var form = $('#sign-in-form');
        sendRequest('POST', form.attr('action'), form.serialize(), function (response) {
          // If we're here, then we got a response that wasn't a redirect
          displayError('Uh-oh... This shouldn\'t have happened...');
          console.log(response);
        });
      },

      // Handles the sign up button being clicked
      handleSignUp: function handleSignUp() {
        window.location.href = '/signup';
      }
    });

    // Render the sign in form
    ReactDOM.render(React.createElement(NavbarSignIn, { csrf: csrf }), target);
  };

  // Initializes the navbar account menu
  var initNavbarAccount = function initNavbarAccount(username, id) {
    var NavbarAccount = React.createClass({
      displayName: "NavbarAccount",

      render: renderNavbarAccountInfo,

      // Gets the initial state
      getInitialState: function getInitialState() {
        return { username: username, id: id };
      }
    });

    // Render the user account info
    ReactDOM.render(React.createElement(NavbarAccount, null), target);
  };

  /////////////////////////////////////////////////////////////////////////////

  var accountInfo = $('#account-info');
  var username = accountInfo.attr('data-username');
  var id = accountInfo.attr('data-id');

  if (username && id) {
    hasSignedInUser = true;
    initNavbarAccount(username, id);
  } else {
    initNavbarSignIn();
  }
};
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Dismisses the info message
var dismissInfo = function dismissInfo() {
  $('#info-container').css({
    display: 'none',
    visibility: 'hidden'
  });
};

// Handles an info message
var displayInfo = function displayInfo(msg) {
  if (msg) {
    // Show the container
    $('#info-container').css({
      display: 'block',
      visibility: 'visible'
    });

    // Set the info message
    $('#info-message').text(msg);
  }
};

// Dismisses the current error message
var dismissError = function dismissError() {
  $('#error-container').css({
    display: 'none',
    visibility: 'hidden'
  });
};

// Handles an error message
var displayError = function displayError(msg) {
  var message = msg || 'Oops! An error occurred.';
  console.log(message);

  // Show the container
  $('#error-container').css({
    display: 'block',
    visibility: 'visible'
  });

  // Set the error message
  $('#error-message').text(message);
};

// Defines a response

var Response = function Response(xhr, userdata) {
  _classCallCheck(this, Response);

  try {
    this.data = JSON.parse(xhr.responseText);
  } catch (ex) {
    if (xhr.responseText) {
      displayError(xhr.responseText);
    }
    this.data = null;
  }

  this.status = xhr.status;
  this.userdata = userdata;
};

// Sends a request


var sendRequest = function sendRequest(method, url, data, callback, userdata) {
  $.ajax({
    cache: false,
    type: method.toUpperCase(),
    url: url,
    data: data,
    dataType: 'json',
    success: function success(responseData, status, xhr) {
      var response = new Response(xhr);

      if (response.data.redirect) {
        window.location = response.data.redirect;
      } else if (response.data.info) {
        displayInfo(response.data.info);
        callback(response);
      } else {
        callback(response);
      }
    },
    error: function error(xhr, status, _error) {
      try {
        var message = JSON.parse(xhr.responseText);
        displayError(message.error);
      } catch (ex) {
        displayError(xhr.responseText);
      }
    }
  });
};

// Gets a CSRF token
var getCsrfToken = function getCsrfToken(callback) {
  sendRequest('GET', '/get-csrf-token', null, function (response) {
    var token = response.data.token;
    callback(token);
  });
};

// Checks to see if a username is valid
var isValidUsername = function isValidUsername(name) {
  var regex = /^[a-zA-Z0-9_\-]+$/;
  return regex.test(name) && name.length >= 4 && name.length <= 16;
};

// Checks to see if an email is valid
var isValidEmail = function isValidEmail(email) {
  // Regex from http://stackoverflow.com/a/46181
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

// Shared functionality for when the page loads
$(document).ready(function () {
  // See if there's an initial error message
  var initialError = $('#initial-error').attr('data-message');
  if (initialError) {
    displayError(initialError);
  }

  // Handle the info alert button being clicked
  $('button.info-close').click(function () {
    dismissInfo();
  });

  // Handle the error alert button being clicked
  $('button.error-close').click(function () {
    dismissError();
  });

  getCsrfToken(initNavbar);
});
