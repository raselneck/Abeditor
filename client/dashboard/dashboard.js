let editor, session, sessionDoc;
let socket, room;

let userEdit = true;
let filename;

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
  session = editor.getSession();
  sessionDoc = session.getDocument();

  editor.setShowPrintMargin(false);

  let filenameRoot = document.querySelector('#file-name');
  filename = {
    displayEl: filenameRoot.children[0],
    inputEl: filenameRoot.children[1],
    update: (value) => {
      filename.inputEl.style.display = 'none';
      filename.displayEl.style.display = 'initial';
      filename.displayEl.innerHTML = value;
    }
  };

  Menu.ready();

  filename.setting = Setting.map['fileName'];
  filename.displayEl.onclick = () => {
    filename.displayEl.style.display = 'none';
    filename.inputEl.style.display = 'initial';
    filename.inputEl.value = filename.setting.value;
    filename.inputEl.focus();
  };
  filename.inputEl.onchange = () => {
    filename.setting.update(filename.inputEl.value);
  };
  filename.inputEl.addEventListener('focusout', filename.inputEl.onchange);

  const actions = {
    insert: 0,
    remove: 1
  };

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
