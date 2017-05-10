// Renders the connect-to-GitHub form
const renderConnectForm = function() {
  return (
    <div>
      <form action="/github-connect" method="GET" id="user-form">
        <input type="hidden" name="_csrf" value={this.props.csrf}/>
        <div className="form-group">
          <label>Currently not connected to GitHub.</label>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Connect</button>
      </form>
    </div>
  );
};

// Renders GitHub connection info
const renderConnectInfo = function() {
  return (
    <div>
      <p><strong>You're connected to GitHub!</strong></p>
    </div>
  );
};

// Checks to see if a string is valid
const isValidString = str => (typeof str === 'string') && (str !== '');

$(document).ready(() => {
  const githubToken = $('#account-info').attr('data-ghtoken');
  console.log(`github token: '${githubToken}'`);

  // Get the form's CSRF token
  getCsrfToken((token) => {
    // Check if we have GitHub credentials
    const hasGitHubCredentials = isValidString(githubToken);

    // Create the render class
    const RenderClass = React.createClass({
      render: hasGitHubCredentials ? renderConnectInfo : renderConnectForm,
    });

    // Render the account page
    const target = document.querySelector('#form-container');
    const renderer = ReactDOM.render(<RenderClass csrf={token}/>, target);
  });
});
