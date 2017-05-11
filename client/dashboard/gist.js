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
      Oops! You'll need to <a href="/account">connect to GitHub</a>
      to be able to use this.
    </p>
  );
};

// Renders the gist dialog so that it shows a user's gists
const renderGistDialog = () => {
  return (<p>ayy lmao</p>);
};

// Shows the "Open Gist" dialog
const openGistDialog = () => {
  $('#open-gist').modal();
};

// Initializes the "Open Gist" dialog
const initializeGistDialog = () => {
  // Gets the gists for a component
  const getGistsForComponent = (self) => {
    sendRequest('GET', '/get-gists', null, (response) => {
      const gists = response.data.gists;
      self.setState({ gists });
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
    loadGists: function() {
      getGistsForComponent(this);
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
        return renderGistDialog();
      }
    },
  });

  // Get the target to display the gists
  const target = document.querySelector('#open-gist-body');

  // Render the gist list
  ReactDOM.render(<GistListClass />, target);
};