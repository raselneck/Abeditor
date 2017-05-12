const github = require('../github.js');

// Gets all of a user's gists
const getAllGists = (req, res) => {
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

// Updates the given gist
const updateGist = (req, res) => {
  const githubToken = req.session.account.githubToken;
  const gist = req.body.gist;
  const gistFile = req.body.file;
  const text = req.body.text;

  // Create the files object
  const files = {};
  files[gistFile.filename] = {
    content: text,
  };

  // Create the data object
  const data = {
    id: gist.id,
    files,
    description: gist.description,
  };

  // Authenticate the user
  github.authenticate({
    type: 'oauth',
    token: githubToken,
  });

  // Edit the gist
  github.gists.edit(data, (err) => {
    if (err) {
      res.json({ error: 'Failed to save the gist :(' });
    } else {
      res.json({ info: 'Successfully saved gist.' });
    }
  });
};

// Creates a gist
const createGist = (req, res) => {
  const githubToken = req.session.account.githubToken;
  const name = req.body.name;
  const text = req.body.text;

  // Create the files object
  const files = {};
  files[name] = {
    content: text,
  };

  // Create the data object
  const data = {
    files,
    public: false,
    description: 'Created using Abeditor',
  };

  // Authenticate the user
  github.authenticate({
    type: 'oauth',
    token: githubToken,
  });

  // Attempt to create the gist
  github.gists.create(data, (err, response) => {
    if (err) {
      res.json({ error: 'Failed to create the gist :(' });
    } else {
      res.json(response);
    }
  });
};

module.exports = {
  getAllGists,
  updateGist,
  createGist,
};