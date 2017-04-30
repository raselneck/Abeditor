'use strict';

var editor = void 0,
    session = void 0;

$(document).ready(function () {
  // Handle the log out button being clicked
  $('#logout').click(function () {
    window.location = '/logout';
  });

  editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");

  session = editor.getSession();
  session.setMode("ace/mode/javascript");
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Setting = function () {
    function Setting(name, display, def, change) {
        _classCallCheck(this, Setting);

        this.name = name;
        Setting.map[this.name] = this;
        this.display = display;
        this.change = change;
        this.default = def;
        this.update(Setting.retrieve(this.name) || def); // values should be objects
    }

    _createClass(Setting, [{
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

Setting.map = {};

Setting.config = [{ name: 'softTabs', display: 'Use Tabs', def: false, change: function change(value) {
        return session.setUseSoftTabs(!value);
    } }, { name: 'tabSize', display: 'Tab Size:', def: 4, change: function change(value) {
        return session.setTabSize(value);
    } }];

var Menu = function Menu(settings) {
    _classCallCheck(this, Menu);

    this.settings = settings;
};

window.addEventListener('load', function () {
    Setting.config.forEach(function (val) {
        return new Setting(val.name, val.display, val.def, val.change);
    });
});
'use strict';

// Handles signing in
var handleSignIn = function handleSignIn(e) {
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
};

// Renders the sign in form for the navbar
var renderNavbarSignInForm = function renderNavbarSignInForm() {
  return React.createElement(
    'form',
    { className: 'navbar-form',
      name: 'sign-in-form',
      id: 'sign-in-form',
      onSubmit: this.handleSubmit,
      method: 'POST',
      action: '/login' },
    React.createElement('input', { type: 'hidden', name: '_csrf', value: this.props.csrf }),
    React.createElement('input', { type: 'text', id: 'sign-in-name', name: 'user', placeholder: 'Username', className: 'form-control' }),
    React.createElement('input', { type: 'password', id: 'sign-in-pass', name: 'pass', placeholder: 'Password', className: 'form-control' }),
    React.createElement(
      'button',
      { type: 'submit', className: 'btn btn-success form-control' },
      'Log In'
    )
  );
};

// Renders the navbar account info
var renderNavbarAccountInfo = function renderNavbarAccountInfo() {
  return React.createElement(
    'ul',
    { className: 'nav navbar-nav' },
    React.createElement(
      'li',
      { className: 'dropdown' },
      React.createElement(
        'a',
        { href: '#',
          className: 'dropdown-toggle',
          'data-toggle': 'dropdown',
          role: 'button',
          'aria-haspopup': 'true',
          'aria-expanded': 'false' },
        'Hello, ',
        this.state.username,
        ' ',
        React.createElement('span', { className: 'caret' })
      ),
      React.createElement(
        'ul',
        { className: 'dropdown-menu' },
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: '/change-password' },
            'Change Password'
          )
        ),
        React.createElement('li', { role: 'separator', className: 'divider' }),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: '/logout' },
            'Log Out'
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
      displayName: 'NavbarSignIn',

      handleSubmit: handleSignIn,
      render: renderNavbarSignInForm
    });

    // Render the sign in form
    ReactDOM.render(React.createElement(NavbarSignIn, { csrf: csrf }), target);
  };

  // Initializes the navbar account menu
  var initNavbarAccount = function initNavbarAccount(username, id) {
    var NavbarAccount = React.createClass({
      displayName: 'NavbarAccount',

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
