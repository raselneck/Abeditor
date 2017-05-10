let editor, session;

$(document).ready(() => {
  // Handle the log out button being clicked
  $('#logout').click(() => {
    window.location = '/logout';
  });

  editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");

  session = editor.getSession();
  session.setMode("ace/mode/javascript");

  const githubName = $('#account-info').attr('data-ghname');
  const githubToken = $('#account-info').attr('data-ghtoken');

  console.log(`github username: '${githubName}'`);
  console.log(`github token: '${githubToken}'`);
});
