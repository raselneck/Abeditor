// Dismisses the current error message
const dismissError = () => {
  const container = $('#error-container');
  if (container) {
    container.css({
      display: 'none',
      visibility: 'hidden',
    });
  }
};

// Handles an error message
const displayError = (msg) => {
  const message = msg || 'Oops! An error occurred.';
  console.log(message);

  // Show the container
  const container = $('#error-container');
  if (container) {
    container.css({
      display: 'block',
      visibility: 'visible',
    });
  }

  // Set the error message
  const err = $('#error-message');
  if (err) {
    err.text(message);
  }
};

// Defines a response
class Response {
  constructor(xhr, userdata) {
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
  }
}

// Sends a request
const sendRequest = (method, url, data, callback, userdata) => {
  $.ajax({
    cache: false,
    type: method.toUpperCase(),
    url,
    data,
    dataType: 'json',
    success: (responseData, status, xhr) => {
      const response = new Response(xhr);

      if (response.data.redirect) {
        window.location = response.data.redirect;
      } else {
        callback(response);
      }
    },
    error: (xhr, status, error) => {
      try {
        const message = JSON.parse(xhr.responseText);
        displayError(message.error);
      } catch (ex) {
        displayError(xhr.responseText);
      }
    },
  });
};

// Gets a CSRF token
const getCsrfToken = (callback) => {
  sendRequest('GET', '/get-csrf-token', null, (response) => {
    const token = response.data.token;
    callback(token);
  });
};

// Checks to see if a username is valid
const isValidUsername = (name) => {
  const regex = /^[a-zA-Z0-9_\-]+$/;
  return regex.test(name) && name.length >= 4 && name.length <= 16;
};

// Checks to see if an email is valid
const isValidEmail = (email) => {
  // Regex from http://stackoverflow.com/a/46181
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

// Shared functionality for when the page loads
$(document).ready(() => {
  // See if there's an initial error message
  const initialError = $('#initial-error').attr('data-message');
  if (initialError) {
    displayError(initialError);
  }

  // Handle the error alert button being clicked
  $('button.error-close').click(() => {
    dismissError();
  });
});
