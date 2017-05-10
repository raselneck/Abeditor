const isProduction = (process.env.NODE_ENV === 'production');

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
    return res.redirect('/edit');
  }
  return next();
};

// Requires an HTTPS connection
const requireHttps = (req, res, next) => {
  const forwardProtocol = req.headers['x-forwarded-proto'];
  if (forwardProtocol !== 'https') {
    const secureUrl = `https://${req.hostname}${req.url}`;
    return res.redirect(secureUrl);
  }
  return next();
};

// Bypasses the need for an HTTPS connection
const skipHttps = (req, res, next) => next();

module.exports = {
  requiresAccount,
  requiresAccountPost,
  requiresSecure: isProduction ? requireHttps : skipHttps,
  skipIfSignedIn,
};
