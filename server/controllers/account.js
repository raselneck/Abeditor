const models = require('../models');
const shared = require('./shared.js');
const github = require('../github.js');
const request = require('request');
const querystring = require('querystring');

const Account = models.Account;

// Parses body text into an object
const parseBodyText = (body) => {
  const data = {};

  const bodyParts = body.split('&');
  for (let i = 0; i < bodyParts.length; ++i) {
    const pair = bodyParts[i].split('=');
    const name = querystring.unescape(pair[0]);
    const value = querystring.unescape(pair[1]).replace(/\+/g, ' ').trim();
    data[name] = value;
  }

  return data;
};

// Renders the log in page
const renderLogInPage = (req, res) => {
  shared.renderPage(req, res, 'account-entry', {
    mode: 'log-in',
    error: req.renderError,
  });
};

// Renders the sign up page
const renderSignUpPage = (req, res) => {
  shared.renderPage(req, res, 'account-entry', {
    mode: 'sign-up',
    error: req.renderError,
  });
};

// Renders the change password page
const renderChangePasswordPage = (req, res) => {
  shared.renderPage(req, res, 'change-password', {
    error: req.renderError,
  });
};

// Renders the account page
const renderAccountPage = (req, res) => {
  shared.renderPage(req, res, 'account', {
    error: req.renderError,
  });
};

// Begins the GitHub Connect process
const beginGitHubConnect = (req, res) => {
  const scope = 'gist+user';
  const clientID = github.clientID;
  const url = `https://github.com/login/oauth/authorize?scope=${scope}&client_id=${clientID}`;
  return res.redirect(url);
};

// Handles when we've retrieved the user's information
const getGitHubUserInfo = (req, res) => {
  const accessToken = req.session.account.githubToken;

  const options = {
    url: `https://api.github.com/user?access_token=${accessToken}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Abeditor',
    },
  };

  request(options, (err, response, body) => {
    // There can't have been an error
    const user = JSON.parse(body);
    const githubName = user.login;
    const username = req.session.account.username;

    req.session.account.githubName = githubName;
    Account.updateGitHubName(username, githubName, () => {
      res.redirect('/account');
    });
  });
};

// Handles when the GitHub access token is retrieved
const onGetGitHubAccessToken = (req, res, err, response, body) => {
  // Now we need to parse the body
  const data = parseBodyText(body);
  const username = req.session.account.username;
  const token = data.access_token;

  if (data.scope === 'gist,user' || data.scope === 'user,gist') {
    // Now we need to update the user's access token
    Account.updateGitHubToken(username, token, (err2) => {
      if (!err2) {
        req.session.account.githubToken = token;

        // Now we need to get the user's info
        getGitHubUserInfo(req, res);
      } else {
        console.log(`${username} didn't get an access token?`);
        res.redirect('/account');
      }
    });
  } else {
    console.log(`${username} failed to approve the app!`);
    res.redirect('/account');
  }
};

// Handles the GitHub Connect callback
const handleGitHubCallback = (req_, res) => {
  const req = req_;
  const code = req.query.code; // We need to pass this back to GitHub

  const options = {
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      client_id: github.clientID,
      client_secret: github.clientSecret,
      code,
      accept: 'application/json',
    },
  };

  request(options, (err, response, body) => {
    onGetGitHubAccessToken(req, res, err, response, body);
  });
};

// Revokes the connection to GitHub
const revokeGitHubConnect = (req_, res) => {
  const req = req_;

  const token = req.session.account.githubToken;
  const clientID = github.clientID;
  const clientSecret = github.clientSecret;
  const username = req.session.account.username;

  // We need to perform "basic authentication" first
  // See the relevant GitHub API documentation here:
  // https://developer.github.com/v3/oauth_authorizations/#revoke-an-authorization-for-an-application
  github.authenticate({
    type: 'basic',
    username: clientID,
    password: clientSecret,
  });

  // Revoke the application's permission
  github.authorization.revoke({
    access_token: token,
    client_id: clientID,
  }, () => {
    Account.updateGitHubToken(username, '', () => {
      req.session.account.githubToken = '';
      res.redirect('/account');
    });
  });
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
  return Account.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Invalid username / password combination.' });
    }

    // Set the account info for the session
    req.session.account = Account.toSession(account);

    const redirect = req.headers.referer || '/dashboard';
    return res.json({ redirect });
  });
};

// Attempts to log the current user out
const logOut = (req_, res) => {
  const req = req_;

  if (req.session.account) {
    delete req.session.account;
  }

  const redirect = req.headers.referer || '/dashboard';
  res.redirect(redirect);
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
  return Account.generateHash(pass, (salt, hash) => {
    // Create the account data
    const accountData = {
      username,
      email,
      salt,
      password: hash,
    };

    // Now create the account
    const account = new Account(accountData);

    // Save the account
    const promise = account.save();

    promise.then(() => {
      // Save the user account in the session
      req.session.account = Account.toSession(account);
      res.json({ redirect: '/dashboard' });
    }).catch((err) => {
      console.log('error saving account:', err);

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

// Changes a user's password
const changePassword = (req, res) => {
  const username = `${req.session.account.username}`;
  const oldPassword = `${req.body.oldPassword}`;
  const newPassword = `${req.body.newPassword}`;
  const newPassword2 = `${req.body.newPassword2}`;

  if (newPassword !== newPassword2) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  return Account.changePassword(username, oldPassword, newPassword, (err) => {
    if (err) {
      console.log('error changing password:', err);
      return res.status(400).json({ error: 'Failed to change password.' });
    }

    return res.status(200).json({});
  });
};

// Gets a user's gists
const getGists = (req, res) => {
  const githubToken = req.session.account.githubToken;

  // Authenticate the user
  github.authenticate({
    type: 'oauth',
    token: githubToken,
  });

  // Get the user's gists
  github.gists.getAll({}, (err, response) => {
    const gists = response.data;
    res.json({ gists });
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
  renderChangePasswordPage,
  renderAccountPage,
  beginGitHubConnect,
  handleGitHubCallback,
  revokeGitHubConnect,
  logIn,
  logOut,
  signUp,
  changePassword,
  getGists,
  getToken,
};
