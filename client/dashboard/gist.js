let gistListRenderer;
let currentGist;
let currentGistFile;

// Reads the given gist file
const readGistFile = (url, callback) => {
  $.ajax({
    cache: false,
    type: 'GET',
    url,
    dataType: 'text',
    success: (response, status, xhr) => {
      //console.log(response);
      callback(response);
    },
    error: () => {
      displayError('Failed to read gist file.');
      currentGist = undefined;
      currentGistFile = undefined;
    },
  });
};

// Loads the current gist file
const loadCurrentGistFile = () => {
  const url = currentGistFile.raw_url;
  readGistFile(url, (text) => {
    // Display the text in the editor
    filename.setting.update(currentGistFile.filename);
    userEdit = false;
    sessionDoc.setValue(text);
  });
};

// Saves the current gist file
const saveCurrentGistFile = () => {
  const text = sessionDoc.getValue();

  // First we need a CSRF token
  getCsrfToken((token) => {
    if (currentGist && currentGistFile) {
      const data = {
        gist: currentGist,
        file: currentGistFile,
        text,
        _csrf: token,
      };

      // Update the gist
      sendRequest('POST', '/update-gist', data, (response) => {
        // Shouldn't really ever get here, but...
        console.log('save response:', response);
      });
    } else {
      const fileName = Setting.map.fileName.value;
      const data = {
        text,
        name: fileName,
        _csrf: token,
      };

      // Create the gist
      sendRequest('POST', '/create-gist', data, (response) => {
        if (response.status === 200) {
          currentGist = response.data.data;
          currentGistFile = currentGist.files[fileName];
          displayInfo('Successfully created new gist.');
        } else {
          displayError('Failed to create new gist.');
        }
      })
    }
  });
};

// Renders the "no user" dialog
const renderNoUserDialog = () => {
  return (
    <p>Uh-oh! You need an account to be able to use this.</p>
  );
};

// Renders the dialog showing
const renderNoGitHubDialog = () => {
  return (
    <p>
      Oops! You'll need to <a href="/account">connect to GitHub</a> to be able to use this.
    </p>
  );
};

// Renders the gist dialog so that it shows a user's gists
const renderGistDialog = (self) => {
  const gists = self.state.gists;

  // Map each gist to an element
  const listElements = gists.map((gist) => {
    // Get all of the gist's files
    const gistFiles = [];
    Object.keys(gist.files).forEach((fileKey) => {
      const file = gist.files[fileKey];

      // Loads the current gist file
      const loadFile = () => {
        currentGist = gist;
        currentGistFile = file;
        loadCurrentGistFile();

        $('#open-gist').modal('hide');
      };

      // Return the HTML for the gist file
      const filename = file.filename;
      const raw_url = file.raw_url;
      gistFiles.push((
        <div className="gist-file">
          <p>Name: {filename}</p>
          <p><a href="#" onClick={loadFile}>Open</a></p>
        </div>
      ));
    });

    // Return the gist file list
    return gistFiles;
  });

  return (
    <div className="gists">
      {listElements}
    </div>
  );
};

// Shows the "Open Gist" dialog
const openGistDialog = () => {
  $('#open-gist').modal('show');
};

// Initializes the "Open Gist" dialog
const initializeGistDialog = () => {
  const emptyFunc = () => {};

  // Gets the gists for a component
  const getGistsForComponent = (self, callback) => {
    getCsrfToken((token) => {
      sendRequest('POST', '/get-gists', { _csrf: token }, (response) => {
        const gists = response.data.gists;
        self.setState({ gists });
        callback();
      });
    });
  };

  // Checks to see if a string is valid
  const isValidString = str => (typeof str === 'string') && (str !== '');

  // Get some account info
  const accountName = $('#account-info').attr('data-username');
  const accountToken = $('#account-info').attr('data-ghtoken');

  // Define the gist list class
  const GistListClass = React.createClass({
    // Loads the gists
    loadGists: function(callback) {
      if (isValidString(accountToken)) {
        getGistsForComponent(this, callback || emptyFunc);
      }
    },

    // Gets the initial state
    getInitialState: function() {
      return { gists: [] };
    },

    // Renders the list
    render: function() {
      if (!isValidString(accountName)) {
        return renderNoUserDialog();
      } else if (!isValidString(accountToken)) {
        return renderNoGitHubDialog();
      } else {
        return renderGistDialog(this);
      }
    },
  });

  // Get the target to display the gists
  const target = document.querySelector('#open-gist-body');

  // Render the gist list
  gistListRenderer = ReactDOM.render(<GistListClass />, target);
  gistListRenderer.loadGists();
};
