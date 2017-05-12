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
  github.gists.edit(data, (err, response) => {
    console.log('err:', err);
    console.log('response:', response);

    if (err) {
      res.json({ error: 'Failed to save the gist :(' });
    } else {
      res.json({ info: 'Successfully saved gist.' });
    }
  });
};

module.exports = {
  getAllGists,
  updateGist,
};
