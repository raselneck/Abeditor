const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const csrf = require('csurf');
const express = require('express');
const expressHandlebars = require('express-handlebars');
const expressSession = require('express-session');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const path = require('path');
const redis = require('./redis.js');
const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost/Abeditor-v1';
const hostedDir = path.resolve(__dirname, '..', 'hosted');
const viewsDir = path.resolve(__dirname, 'views');

// Attempt to connect to the database
mongoose.connect(dbUrl, (err) => {
  if (err) {
    console.log('Failed to connect to database');
    throw new Error(err);
  }
});

// Configure our Express app
const app = express();
app.use(express.static(hostedDir));
app.use(favicon(path.join(hostedDir, 'img', 'favicon.png')));
app.set('x-powered-by', 'Mountain Dew except not really');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
  key: 'sid',
  store: redis.createStore(expressSession),
  secret: 'Lookit Here You Can Edit With Ya Friends',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', viewsDir);
app.use(cookieParser());

// csrf comes AFTER cookie parser but BEFORE the router
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  console.log('Missing CSRF token from request!');
  console.log('Found the following:', Object.keys(req.body));
  return false;
});

// Link our router to our Express app
app.use(router);

// Start the Express app
app.listen(port, (err) => {
  if (err) {
    throw new Error(err);
  }

  console.log(`Abeditor is now running at http://localhost:${port}/`);
});
