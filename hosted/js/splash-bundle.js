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

// Renders the sign in form for the splash page
var renderSplashSignInForm = function renderSplashSignInForm() {
  return React.createElement(
    'form',
    { className: 'navbar-form navbar-right',
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

// Initializes the splash page
var initialize = function initialize(csrf) {
  // Create the sign in form
  var SignInForm = React.createClass({
    displayName: 'SignInForm',

    handleSubmit: handleSignIn,
    render: renderSplashSignInForm
  });

  // Render the sign in form
  var target = document.querySelector('#navbar');
  ReactDOM.render(React.createElement(SignInForm, { csrf: csrf }), target);
};

// Handle when the page is done loading
$(document).ready(function () {
  getCsrfToken(initialize);
});
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
