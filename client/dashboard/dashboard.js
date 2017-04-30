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
});
