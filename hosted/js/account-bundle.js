"use strict";

// Renders the connect-to-GitHub form
var renderConnectForm = function renderConnectForm() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { action: "/github-connect", method: "GET", id: "user-form" },
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Currently not connected to GitHub."
        )
      ),
      React.createElement(
        "button",
        { type: "submit", className: "btn btn-primary btn-block" },
        "Connect"
      )
    )
  );
};

// Renders GitHub connection info
var renderConnectInfo = function renderConnectInfo() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { action: "/github-revoke", method: "GET", id: "user-form" },
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "You're connected to GitHub!"
        )
      ),
      React.createElement(
        "button",
        { type: "submit", className: "btn btn-danger btn-block" },
        "Revoke"
      )
    )
  );
};

// Checks to see if a string is valid
var isValidString = function isValidString(str) {
  return typeof str === 'string' && str !== '';
};

$(document).ready(function () {
  var githubToken = $('#account-info').attr('data-ghtoken');
  var githubName = $('#account-info').attr('data-ghname');

  // Check if we have GitHub credentials
  var hasGitHubCredentials = isValidString(githubToken);

  // Create the render class
  var RenderClass = React.createClass({
    displayName: "RenderClass",

    render: hasGitHubCredentials ? renderConnectInfo : renderConnectForm
  });

  // Render the account page
  var target = document.querySelector('#form-container');
  var renderer = ReactDOM.render(React.createElement(RenderClass, null), target);
});
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
