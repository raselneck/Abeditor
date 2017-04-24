const models = require('../models');

// const AccountSchema = models.account.AccountSchema;
const AccountModel = models.account.AccountModel;

// Renders the log in page
const renderLogInPage = (req, res) => {
  res.render('account-entry', { mode: 'log-in', error: req.renderError });
};

// Renders the sign up page
const renderSignUpPage = (req, res) => {
  res.render('account-entry', { mode: 'sign-up', error: req.renderError });
};

// Renders the settings page
const renderSettingsPage = (req, res) => {
  res.status(501).json({ error: 'Sorry, not implemented :/' });
};

// Attempts to log a user in
const logIn = (req_, res) => {
  const req = req_;

  const username = `${req.body.user}`;
  const password = `${req.body.pass}`;

  // Ensure both the username and password were given
  if (!username || !password) {
    return res.status(400).json({ error: 'Oops! Both a username AND a password are required!' });
  }

  // Attempt to log in
  return AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Invalid username / password combination.' });
    }

    // Set the account info for the session
    req.session.account = AccountModel.toSession(account);

    return res.json({ redirect: '/dashboard' });
  });
};

// Attempts to log the current user out
const logOut = (req_, res) => {
  const req = req_;

  if (req.session.account) {
    delete req.session.account;
  }

  res.redirect('/');
};

// Attempts to create a user account
const signUp = (req_, res) => {
  const req = req_;

  const username = `${req.body.user}`;
  const email = `${req.body.email}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // Ensure all parameters are provided
  if (!username || !email || !pass || !pass2) {
    return res.status(400).json({ error: 'Oops! All fields are required.' });
  }

  // Ensure the passwords match
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Oops! Passwords do not match.' });
  }

  // Generate the password hash
  return AccountModel.generateHash(pass, (salt, hash) => {
    // Create the account data
    const accountData = {
      username,
      email,
      salt,
      password: hash,
    };

    // Now create the account
    const account = new AccountModel(accountData);

    // Save the account
    const promise = account.save();

    promise.then(() => {
      // Save the user account in the session
      req.session.account = AccountModel.toSession(account);
      res.json({ redirect: '/dashboard' });
    }).catch((err) => {
      console.log('Error saving account:', err);

      let errorMessage = 'An error occurred.';
      if (err.code === 11000) {
        const message = err.errmsg;

        if (message.indexOf('username') >= 0) {
          errorMessage = 'Username is already in use.';
        } else if (message.indexOf('email') >= 0) {
          errorMessage = 'Email address is already in use.';
        }
      }

      return res.status(400).json({ error: errorMessage });
    });
  });
};

// Gets a CSRF token
const getToken = (req, res) => {
  const token = req.csrfToken();
  res.json({ token });
};

module.exports = {
  renderLogInPage,
  renderSignUpPage,
  renderSettingsPage,
  logIn,
  logOut,
  signUp,
  getToken,
};
