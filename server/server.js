const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const csrf = require('csurf');
const express = require('express');
const expressHandlebars = require('express-handlebars');
const expressSession = require('express-session');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const path = require('path');
const redis = require('./redis.js');
const router = require('./router.js');
const http = require('http');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost/Abeditor-v4';
const hostedDir = path.resolve(__dirname, '..', 'hosted');
const viewsDir = path.resolve(__dirname, 'views');

// Attempt to connect to the database
mongoose.connect(dbUrl, (err) => {
  if (err) {
    console.log('Failed to connect to database');
    throw new Error(err);
  }
});

const app = express();
const httpServer = http.createServer(app);
const io = socketio(httpServer);

// Configure our Express app
app.use(express.static(hostedDir));
app.use(favicon(path.join(hostedDir, 'img', 'favicon.png')));
app.set('x-powered-by', 'Mountain Dew except not really');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
  key: 'sid',
  store: redis.createStore(expressSession),
  secret: 'Lookit Here You Can Edit With Ya Friends',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', viewsDir);
app.use(cookieParser());

// csrf comes AFTER cookie parser but BEFORE the router
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  console.log('Missing CSRF token from request!');
  return false;
});

// Start the Express app
httpServer.listen(port, (err) => {
  if (err) {
    throw new Error(err);
  }
  console.log(`Abeditor is now running at http://localhost:${port}/`);
});

class Room {
  constructor(name) {
    this.name = name;
    this.users = {};
    this.text = '';
    this.lastLogOff = new Date().getTime();
  }
}

const rooms = {};

// Gets the total user count in a room
const getUserCount = (room) => {
  if (room.users) {
    return Object.keys(room.users).length;
  }
  return 0;
};

setInterval(() => {
  Object.keys(rooms).forEach((room) => {
    const expireTime = 12 * 60 * 60 * 1000;
    const time = new Date().getTime();

    if (getUserCount(room) === 0
    && time - room.lastLogOff > expireTime) {
      delete rooms[room.name];
    }
  });
}, 10 * 60 * 1000);

const actions = {
  insert: 0,
  remove: 1,
};
Object.freeze(actions);

const onJoin = (sock) => {
  const socket = sock;
  socket.on('join', (data) => {
    if (data.room && rooms[data.room]) {
      socket.room = data.room;
    } else {
      socket.emit('err', 'Invalid room id');
      return;
    }
    socket.join(socket.room);

    const room = rooms[socket.room];
    let id;
    do { id = Math.random() * 20; } while (room.users[id]);
    socket.emit('join', { id, text: room.text });
  });
};

const onInput = (sock) => {
  const socket = sock;
  socket.on('input', (data) => {
    const room = rooms[socket.room];
    const delta = data.delta;
    switch (delta.action) {
      case actions.insert:
        room.text = room.text.substring(0, delta.start.index)
                  + delta.lines + room.text.substring(delta.start.index
                  + delta.lines.length);
        break;
      case actions.remove:
        room.text = room.text.substring(0, delta.start.index)
                  + room.text.substring(delta.end.index);
        break;
      default:
        break;
    }
    socket.broadcast.to(socket.room).emit('update', { delta: data.delta });
  });
};

const onDisconnect = (sock) => {
  const socket = sock;
  socket.on('disconnect', (data) => {
    // check that the user successfully joined before deleting
    if (!socket.room) return;
    const room = rooms[socket.room];
    if (room && room.users[data.id]) {
      delete room.users[data.id];
      room.lastLogOff = new Date().getTime();
    }
  });
};

io.sockets.on('connection', (socket) => {
  console.log('started');
  onJoin(socket);
  onInput(socket);
  onDisconnect(socket);
});

router.get('/edit', (req, res) => {
  const randChar = () => {
    const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return s.charAt(Math.floor(Math.random() * s.length));
  };

  const randName = (n) => {
    let str = '';
    for (let i = n; i > 0; --i) {
      str += randChar();
    }
    return str;
  };

  let id;
  do { id = randName(5); } while (rooms[id]);
  rooms[id] = new Room(id);
  res.redirect(`/edit/${id}`);
});

router.get('/edit/:room', (req, res) => {
  res.room = rooms[req.params.room] ? req.params.room : '-1';
  router.dashboard_func(req, res);
});

// Handle 404 requests
router.use((req, res) => {
  console.log(`redirecting from '${req.originalUrl}'`);
  res.redirect('/');
});

// Link our router to our Express app
app.use(router);
