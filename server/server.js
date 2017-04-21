const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const express = require('express');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const root = `${__dirname}/../hosted/`;

const getOptions = () => ({ root, headers: { 'x-timestamp': Date.now(), 'x-sent': true } });

const app = express();
const httpServer = http.createServer(app).listen(port);

app.use('/media', express.static(path.join(root, 'media')));
app.use('/css', express.static(path.join(root, 'css')));
app.use('/js', express.static(path.join(root, 'js')));

app.get('/', (req, res) => res.sendFile('index.html', getOptions()));