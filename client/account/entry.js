// Handles user log in
const handleLogIn = function(e) {
  e.preventDefault();

  const username = $('#user').val();
  const password = $('#pass').val();

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
  const form = $('#user-form');
  sendRequest('POST', form.attr('action'), form.serialize(), (response) => {
    const data = response.data;
    console.log(data);

    displayError('This isn\'t an error; you logged in successfully!');
  });
};

// Handles signing up
const handleSignUp = function(e) {
  e.preventDefault();

  const username = $('#user').val();
  const email = $('#email').val();
  const password = $('#pass').val();
  const password2 = $('#pass2').val();

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
  const form = $('#user-form');
  sendRequest('POST', form.attr('action'), form.serialize(), (response) => {
    const data = response.data;
    console.log(data);

    displayError('This isn\'t an error; you signed up successfully!');
  });
};

// Renders the login form
const renderLogInForm = function() {
  return (
    <div>
      <form action="/login" method="POST" onSubmit={this.handleSubmit} id="user-form">
        <input type="hidden" name="_csrf" value={this.props.csrf}/>
        <div className="form-group">
          <label htmlFor="user">Username:</label>
          <input type="text" maxlength="16" className="form-control" id="user" name="user" placeholder="username" required autofocus/>
        </div>
        <div className="form-group">
          <label htmlFor="pass">Password:</label>
          <input type="password" className="form-control" id="pass" name="pass" placeholder="password" required/>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Log In</button>
      </form>
      <p>Don't have an account? <a href="#" onClick={this.handleClick}>Sign up</a>.</p>
    </div>
  );
};

// Renders the sign up form
const renderSignUpForm = function() {
  return (
    <div>
      <form action="/signup" method="POST" onSubmit={this.handleSubmit} id="user-form">
        <input type="hidden" name="_csrf" value={this.props.csrf}/>
        <div className="form-group">
          <label htmlFor="user">Username:</label>
          <input type="text" maxlength="16" className="form-control" id="user" name="user" placeholder="username" required autofocus/>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" className="form-control" id="email" name="email" placeholder="email" required autofocus/>
        </div>
        <div className="form-group">
          <label htmlFor="pass">Password:</label>
          <input type="password" className="form-control" id="pass" name="pass" placeholder="password" required/>
        </div>
        <div className="form-group">
          <label htmlFor="pass">Confirm password:</label>
          <input type="password" className="form-control" id="pass2" name="pass2" placeholder="confirm password" required/>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
      </form>
      <p>Already have an account? <a href="#" onClick={this.handleClick}>Log in</a>.</p>
    </div>
  );
};

$(document).ready(() => {
  let SignUpForm, LogInForm;
  let csrf;

  const formTarget = document.querySelector('#form-container');

  SignUpForm = React.createClass({
    handleSubmit: handleSignUp,
    handleClick: function() {
      ReactDOM.render(<LogInForm csrf={csrf}/>, formTarget);
    },
    render: renderSignUpForm,
  });

  LogInForm = React.createClass({
    handleSubmit: handleLogIn,
    handleClick: function() {
      ReactDOM.render(<SignUpForm csrf={csrf}/>, formTarget);
    },
    render: renderLogInForm,
  });

  // Get the CSRF token before doing anything
  getCsrfToken((token) => {
    csrf = token;

    const mode = $('#mode').attr('data-mode');
    if (mode === 'sign-up') {
      ReactDOM.render(<SignUpForm csrf={csrf}/>, formTarget);
    } else if (mode === 'log-in') {
      ReactDOM.render(<LogInForm csrf={csrf}/>, formTarget);
    }
  });
});
