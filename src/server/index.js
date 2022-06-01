import http from 'http';
import { Server } from 'socket.io';
import { usernames } from './util.js';
import chalk from 'chalk';

const server = http.createServer();
const serverSocket = new Server(server);
const users = new Map();

const checkForAvailableUsername = () => {
  if (users.size === usernames.length) {
    return null;
  }
  return usernames.find(name => !users.has(name));
}

const dealWithClientConnection = (socket) => {
  const name = checkForAvailableUsername();

  if (!name) {
    socket.emit('server-message', 'Server is full. Please try again later.');
    socket.disconnect();
    return;
  }

  users.set(name, socket);

  socket.emit('server-message', chalk.yellow(`Welcome to the anonymity chat! We'll call you ${chalk.bold(name)}.`));

  socket
    .on('message', (message) => console.log(message))
    .on('error', err => console.log(err))
    .on('disconnect', () => console.log('disconnected'));
}

serverSocket
  .on('connection', (socket) => {
    dealWithClientConnection(socket);
  });

server.listen(8000, () => {
  console.log('Server listening!')
});
