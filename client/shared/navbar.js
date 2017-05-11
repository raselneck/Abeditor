let hasSignedInUser = false;

// Renders the sign in form for the navbar
const renderNavbarSignInForm = function() {
  return (
    <div>
      <form className="navbar-form"
            name="sign-in-form"
            id="sign-in-form"
            onSubmit={this.handleSubmit}
            method="POST"
            action="/login">
        <input type="hidden" name="_csrf" value={this.props.csrf}/>
        <input type="text" id="sign-in-name" name="user" placeholder="Username" className="form-control"/>
        <input type="password" id="sign-in-pass" name="pass" placeholder="Password" className="form-control"/>
        <button id="navbar-log-in" type="submit" className="btn btn-success form-control" onClick={this.handleSignIn}>Log In</button>
        <button id="navbar-sign-up" className="btn btn-primary form-control" onClick={this.handleSignUp}>Sign Up</button>
      </form>
    </div>
  );
};

// Renders the navbar account info
const renderNavbarAccountInfo = function() {
  return (
    <ul className="nav navbar-nav">
      <li className="dropdown">
        <a  href="#"
            className="dropdown-toggle"
            data-toggle="dropdown"
            role="button"
            aria-haspopup="true"
            aria-expanded="false">Hello, {this.state.username} <span className="caret"></span>
        </a>
        <ul className="dropdown-menu">
          <li><a href="/account">Account</a></li>
          <li><a href="/change-password">Change Password</a></li>
          <li role="separator" className="divider"></li>
          <li><a href="/logout">Log Out</a></li>
        </ul>
      </li>
    </ul>
  );
};

// Sets up the navbar sign-in form
const initNavbar = (token) => {
  const csrf = token;
  const target = document.querySelector('#navbar-data');

  // If the target doesn't exist, then just stop what we're doing
  if (!target) {
    return;
  }

  // Initializes the navbar sign-in form
  const initNavbarSignIn = () => {
    // Create the sign in form
    const NavbarSignIn = React.createClass({
      // Handles the form being rendered
      render: renderNavbarSignInForm,

      // Handles the form being submitted
      handleSubmit: function(e) {
        e.preventDefault();
      },

      // Handles the sign in button being clicked
      handleSignIn: function(e) {
        e.preventDefault();

        const usernameElem = $('#sign-in-name');
        const passwordElem = $('#sign-in-pass');

        const username = usernameElem.val();
        const password = passwordElem.val();

        // Ensure the username and password have been entered
        if (!username || !password) {
          displayError('Oops! To sign in you need a username AND a password!');
          return false;
        }

        // Attempt to sign in
        const form = $('#sign-in-form');
        sendRequest('POST', form.attr('action'), form.serialize(), (response) => {
          // If we're here, then we got a response that wasn't a redirect
          displayError('Uh-oh... This shouldn\'t have happened...');
          console.log(response);
        });
      },

      // Handles the sign up button being clicked
      handleSignUp: function() {
        window.location.href = '/signup';
      },
    });

    // Render the sign in form
    ReactDOM.render(<NavbarSignIn csrf={csrf}/>, target);
  };

  // Initializes the navbar account menu
  const initNavbarAccount = (username, id) => {
    const NavbarAccount = React.createClass({
      render: renderNavbarAccountInfo,

      // Gets the initial state
      getInitialState: function() {
        return { username, id };
      },
    });

    // Render the user account info
    ReactDOM.render(<NavbarAccount/>, target);
  };

  /////////////////////////////////////////////////////////////////////////////

  const accountInfo = $('#account-info');
  const username = accountInfo.attr('data-username');
  const id = accountInfo.attr('data-id');

  if (username && id) {
    hasSignedInUser = true;
    initNavbarAccount(username, id);
  } else {
    initNavbarSignIn();
  }
};
