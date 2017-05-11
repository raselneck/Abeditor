const ExpressRouter = require('express').Router;
const controllers = require('./controllers');
const mid = require('./middleware.js');

const account = controllers.account;
const dashboard = controllers.dashboard;
const splash = controllers.splash;
const router = ExpressRouter();

router.all('/', mid.skipIfSignedIn, splash.renderSplashPage);

router.all('/logout', mid.requiresAccount, account.logOut);
router.get('/signup', mid.requiresSecure, mid.skipIfSignedIn, account.renderSignUpPage);
router.get('/login', mid.requiresSecure, mid.skipIfSignedIn, account.renderLogInPage);
router.get('/change-password', mid.requiresSecure, mid.requiresAccount, account.renderChangePasswordPage);
router.get('/account', mid.requiresSecure, mid.requiresAccount, account.renderAccountPage);
router.get('/github-connect', mid.requiresSecure, mid.requiresAccount, account.beginGitHubConnect);
router.get('/github-callback', mid.requiresSecure, mid.requiresAccount, account.handleGitHubCallback);
router.get('/github-revoke', mid.requiresSecure, mid.requiresAccount, account.revokeGitHubConnect);
router.get('/get-csrf-token', account.getToken);

router.dashboard_func = (req, res) => {
    /* mid.requiresAccount,*/
  dashboard.renderDashboard(req, res);
};

router.post('/login', account.logIn);
router.post('/signup', account.signUp);
router.post('/change-password', mid.requiresSecure, mid.requiresAccountPost, account.changePassword);

module.exports = router;
