// Renders the change password form
const renderPasswordForm = function() {
  return (
    <form onSubmit={this.handleSubmit}
          id="user-form">
      <input type="hidden" name="_csrf" value={this.props.csrf}/>
      <div className="form-group">
        <label htmlFor="oldPassword">Current Password:</label>
        <input type="password" className="form-control" id="oldPassword" name="oldPassword" placeholder="current password" required autofocus/>
      </div>
      <div className="form-group">
        <label htmlFor="user">New Password:</label>
        <input type="password" className="form-control" id="newPassword" name="newPassword" placeholder="username" required/>
      </div>
      <div className="form-group">
        <label htmlFor="pass">Confirm Password:</label>
        <input type="password" className="form-control" id="newPassword2" name="newPassword2" placeholder="password" required/>
      </div>
      <button type="submit" className="btn btn-primary btn-block">Change Password</button>
    </form>
  );
};

// Handles the change password request
const handleChangePassword = (e) => {
  e.preventDefault();

  const oldPasswordElem = $('#oldPassword');
  const newPasswordElem = $('#newPassword');
  const newPassword2Elem = $('#newPassword2');

  const oldPassword = oldPasswordElem.val();
  const newPassword = newPasswordElem.val();
  const newPassword2 = newPassword2Elem.val();

  // Ensure the new passwords match
  if (newPassword !== newPassword2) {
    return displayError('New password does not match the confirmation password.');
  }

  // We need to get a CSRF token first
  getCsrfToken((token) => {
    // Create the form data
    const formData = {
      oldPassword,
      newPassword,
      newPassword2,
      _csrf: token,
    };

    sendRequest('POST', '/change-password', formData, () => {
      displayInfo('Nice! You\'ve updated your password.');

      oldPasswordElem.val('');
      newPasswordElem.val('');
      newPassword2Elem.val('');
    });
  });
};

$(document).ready(() => {
  // We need a CSRF token, so let's get one
  getCsrfToken((token) => {
    // Create the change password form
    const ChangePasswordForm = React.createClass({
      // Handle how the form is rendered
      render: renderPasswordForm,

      // Handle when the form is submitted
      handleSubmit: handleChangePassword,
    });

    // Render the change password form
    const target = document.querySelector('#form-container');
    ReactDOM.render(<ChangePasswordForm csrf={token}/>, target);
  });
});
