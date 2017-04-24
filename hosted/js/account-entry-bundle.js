'use strict';

// Handles user log in
var handleLogIn = function handleLogIn(e) {
  e.preventDefault();

  var username = $('#user').val();
  var password = $('#pass').val();

  // Ensure the username was entered
  if (!username) {
    displayError('Hey so uhh... what\'s your username?');
    return;
  }

  // Ensure the password was entered
  if (!password) {
    displayError('Looks like someone forgot to enter their password...');
    return;
  }

  // Send the sign up request
  var form = $('#user-form');
  sendRequest('POST', form.attr('action'), form.serialize(), function (response) {
    var data = response.data;
    console.log(data);

    displayError('This isn\'t an error; you logged in successfully!');
  });
};

// Handles signing up
var handleSignUp = function handleSignUp(e) {
  e.preventDefault();

  var username = $('#user').val();
  var email = $('#email').val();
  var password = $('#pass').val();
  var password2 = $('#pass2').val();

  // Ensure the username is valid
  if (!isValidUsername(username)) {
    displayError('Username is invalid. Must be between 4 and 16 characters long, and can only contain A-Z, a-z, -, or _.');
    return;
  }

  // Ensure the email is valid
  if (!isValidEmail(email)) {
    displayError('Email address must be valid. Don\'t worry! It\'ll only be used to help recover your account if you forget your password.');
    return;
  }

  // Ensure the passwords match
  if (password !== password2) {
    displayError('Oops! Your passwords don\'t match!');
    return;
  }

  // Send the sign up request
  var form = $('#user-form');
  sendRequest('POST', form.attr('action'), form.serialize(), function (response) {
    var data = response.data;
    console.log(data);

    displayError('This isn\'t an error; you signed up successfully!');
  });
};

// Renders the login form
var renderLogInForm = function renderLogInForm() {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'form',
      { action: '/login', method: 'POST', onSubmit: this.handleSubmit, id: 'user-form' },
      React.createElement('input', { type: 'hidden', name: '_csrf', value: this.props.csrf }),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement(
          'label',
          { htmlFor: 'user' },
          'Username:'
        ),
        React.createElement('input', { type: 'text', maxlength: '16', className: 'form-control', id: 'user', name: 'user', placeholder: 'username', required: true, autofocus: true })
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement(
          'label',
          { htmlFor: 'pass' },
          'Password:'
        ),
        React.createElement('input', { type: 'password', className: 'form-control', id: 'pass', name: 'pass', placeholder: 'password', required: true })
      ),
      React.createElement(
        'button',
        { type: 'submit', className: 'btn btn-primary btn-block' },
        'Log In'
      )
    ),
    React.createElement(
      'p',
      null,
      'Don\'t have an account? ',
      React.createElement(
        'a',
        { href: '#', onClick: this.handleClick },
        'Sign up'
      ),
      '.'
    )
  );
};

// Renders the sign up form
var renderSignUpForm = function renderSignUpForm() {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'form',
      { action: '/signup', method: 'POST', onSubmit: this.handleSubmit, id: 'user-form' },
      React.createElement('input', { type: 'hidden', name: '_csrf', value: this.props.csrf }),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement(
          'label',
          { htmlFor: 'user' },
          'Username:'
        ),
        React.createElement('input', { type: 'text', maxlength: '16', className: 'form-control', id: 'user', name: 'user', placeholder: 'username', required: true, autofocus: true })
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement(
          'label',
          { htmlFor: 'email' },
          'Email:'
        ),
        React.createElement('input', { type: 'email', className: 'form-control', id: 'email', name: 'email', placeholder: 'email', required: true, autofocus: true })
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement(
          'label',
          { htmlFor: 'pass' },
          'Password:'
        ),
        React.createElement('input', { type: 'password', className: 'form-control', id: 'pass', name: 'pass', placeholder: 'password', required: true })
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement(
          'label',
          { htmlFor: 'pass' },
          'Confirm password:'
        ),
        React.createElement('input', { type: 'password', className: 'form-control', id: 'pass2', name: 'pass2', placeholder: 'confirm password', required: true })
      ),
      React.createElement(
        'button',
        { type: 'submit', className: 'btn btn-primary btn-block' },
        'Sign Up'
      )
    ),
    React.createElement(
      'p',
      null,
      'Already have an account? ',
      React.createElement(
        'a',
        { href: '#', onClick: this.handleClick },
        'Log in'
      ),
      '.'
    )
  );
};

$(document).ready(function () {
  var SignUpForm = void 0,
      LogInForm = void 0;
  var csrf = void 0;

  var formTarget = document.querySelector('#form-container');

  SignUpForm = React.createClass({
    displayName: 'SignUpForm',

    handleSubmit: handleSignUp,
    handleClick: function handleClick() {
      ReactDOM.render(React.createElement(LogInForm, { csrf: csrf }), formTarget);
    },
    render: renderSignUpForm
  });

  LogInForm = React.createClass({
    displayName: 'LogInForm',

    handleSubmit: handleLogIn,
    handleClick: function handleClick() {
      ReactDOM.render(React.createElement(SignUpForm, { csrf: csrf }), formTarget);
    },
    render: renderLogInForm
  });

  // Get the CSRF token before doing anything
  getCsrfToken(function (token) {
    csrf = token;

    var mode = $('#mode').attr('data-mode');
    if (mode === 'sign-up') {
      ReactDOM.render(React.createElement(SignUpForm, { csrf: csrf }), formTarget);
    } else if (mode === 'log-in') {
      ReactDOM.render(React.createElement(LogInForm, { csrf: csrf }), formTarget);
    }
  });
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
