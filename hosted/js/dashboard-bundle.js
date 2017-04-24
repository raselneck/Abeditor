'use strict';

$(document).ready(function () {
  // Handle the log out button being clicked
  $('#logout').click(function () {
    window.location = '/logout';
  });
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
"use strict";
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Dismisses the current error message
var dismissError = function dismissError() {
  var container = $('#error-container');
  if (container) {
    container.css({
      display: 'none',
      visibility: 'hidden'
    });
  }
};

// Handles an error message
var displayError = function displayError(msg) {
  var message = msg || 'Oops! An error occurred.';
  console.log(message);

  // Show the container
  var container = $('#error-container');
  if (container) {
    container.css({
      display: 'block',
      visibility: 'visible'
    });
  }

  // Set the error message
  var err = $('#error-message');
  if (err) {
    err.text(message);
  }
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

  // Handle the error alert button being clicked
  $('button.error-close').click(function () {
    dismissError();
  });
});
