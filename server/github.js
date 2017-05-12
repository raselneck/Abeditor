const GitHubAPI = require('github');

// Check if we're on a production server
const isProduction = (process.env.NODE_ENV === 'production');

let clientID;
let clientSecret;
if (isProduction) {
  // Credentials for Abeditor
  clientID = 'a7cb0219a13041602c1f';
  clientSecret = '7f8841414760c266d1593712c6c3db609dc923d5';
} else {
  // Credentials for AbeditorTest
  clientID = 'e2dec6f5b9162d8d146e';
  clientSecret = '832c62e1da92e9964733bb72a627331fc50ad2e3';
}

// Configure a GitHub API object
const github = new GitHubAPI({
  debug: !isProduction,
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'User-Agent': 'Abeditor',
  },
  Promise: global.Promise,
  followRedirects: false,
  timeout: 5000,
  client_id: clientID,
  client_secret: clientSecret,
});

github.clientID = clientID;
github.clientSecret = clientSecret;

// Export the API object
module.exports = github;
