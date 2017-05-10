const ExpressRouter = require('express').Router;
const controllers = require('./controllers');
const mid = require('./middleware.js');

const account = controllers.account;
const dashboard = controllers.dashboard;
const splash = controllers.splash;
const router = ExpressRouter();

router.all('/', mid.skipIfSignedIn, splash.renderSplashPage);

router.all('/logout', mid.requiresAccount, account.logOut);
router.get('/signup', mid.skipIfSignedIn, account.renderSignUpPage);
router.get('/login', mid.skipIfSignedIn, account.renderLogInPage);
router.get('/change-password', mid.requiresAccount, account.renderChangePasswordPage);
router.get('/get-csrf-token', account.getToken);

router.dashboard_func = (req, res) => { /* mid.requiresAccount,*/ dashboard.renderDashboard(req, res); };

router.post('/login', account.logIn);
router.post('/signup', account.signUp);
router.post('/change-password', mid.requiresAccountPost, account.changePassword);

// Handle 404 requests
router.use((req, res) => res.redirect('/'));

module.exports = router;
