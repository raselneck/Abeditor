// Checks to see if an account exists on the given request
const hasAccount = req => req.session.account !== undefined;

// Specifies that an account is required
const requiresAccount = (req, res, next) => {
  if (hasAccount(req)) {
    return next();
  }
  return res.redirect('/');
};

// Specifies that an account is required for a post request
const requiresAccountPost = (req, res, next) => {
  if (hasAccount(req)) {
    return next();
  }
  return res.status(401).json({ error: 'You are not signed in!' });
};

// Specifies that the given page can be skipped if the user is signed in
const skipIfSignedIn = (req, res, next) => {
  if (hasAccount(req)) {
    return res.redirect('/dashboard');
  }
  return next();
};

module.exports = {
  requiresAccount,
  requiresAccountPost,
  skipIfSignedIn,
};
