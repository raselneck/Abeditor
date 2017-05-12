let editor, session, sessionDoc;
let socket, room;

$(document).ready(() => {
  room = document.querySelector('#room-id').innerHTML;
  if(Number.parseInt(room) == -1) {
    document.querySelector('#editor').innerHTML = '<h3>Invalid Room ID</h3>';
    return;
  }
  window.history.replaceState('','Abeditor',`/edit/${room}`);

  socket = io.connect();

  // Handle the log out button being clicked
  $('#logout').click(() => {
    window.location = '/logout';
  });

  editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");

  session = editor.getSession();
  session.setMode("ace/mode/javascript");

  sessionDoc = session.getDocument();

  const actions = {
    insert: 0,
    remove: 1
  };

  let userEdit = true;

  let uid;
  socket.on('join', data => {
    uid = data.id;
    userEdit = false;
    session.insert({row: 0, column: 0}, data.text);
  });

  socket.on('update', (data) => {
    const delta = data.delta;
    switch(delta.action) {
      case actions.insert:
        userEdit = false;
        session.insert(delta.start, delta.lines)
        break;
      case actions.remove:
        userEdit = false;
        //console.log(delta);
        session.remove({ start: delta.start, end: delta.end });
        break;
    }
  });

  session.on('change', (e) => {
    let userEdited = userEdit;
    userEdit = true;
    if(!userEdited)
      return;
      
    let delta = {
      action: actions[e.action]
    };
    switch(delta.action) {
      case actions.insert:
        delta.start = e.start;
        delta.start.index = sessionDoc.positionToIndex(delta.start, 0);
        delta.lines = e.lines.join('\n');
        break;
      case actions.remove:
        delta.start = e.start;
        delta.start.index = sessionDoc.positionToIndex(delta.start, 0);
        delta.end = e.end;
        delta.end.index = sessionDoc.positionToIndex(delta.end, 0);
        break;
    }
    socket.emit('input', { delta });
  });

  socket.emit('join', { room });
});
