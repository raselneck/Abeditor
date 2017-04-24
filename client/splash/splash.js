// Handles signing in
const handleSignIn = (e) => {
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
};

// Renders the sign in form for the splash page
const renderSplashSignInForm = function() {
  return (
    <form className="navbar-form navbar-right"
          name="sign-in-form"
          id="sign-in-form"
          onSubmit={this.handleSubmit}
          method="POST"
          action="/login">
      <input type="hidden" name="_csrf" value={this.props.csrf}/>
      <input type="text" id="sign-in-name" name="user" placeholder="Username" className="form-control"/>
      <input type="password" id="sign-in-pass" name="pass" placeholder="Password" className="form-control"/>
      <button type="submit" className="btn btn-success form-control">Log In</button>
    </form>
  );
};

// Initializes the splash page
const initialize = (csrf) => {
  // Create the sign in form
  const SignInForm = React.createClass({
    handleSubmit: handleSignIn,
    render: renderSplashSignInForm
  });

  // Render the sign in form
  const target = document.querySelector('#navbar');
  ReactDOM.render(<SignInForm csrf={csrf}/>, target);
};

// Handle when the page is done loading
$(document).ready(() => {
  getCsrfToken(initialize);
});
