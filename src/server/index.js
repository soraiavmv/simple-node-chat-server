import http from 'http';
import { Server } from 'socket.io';
import { usernames } from './util.js';
import chalk from 'chalk';

const start = () => {
  const server = http.createServer();
  const serverSocket = new Server(server);
  const users = new Map();

  serverSocket
    .on('connection', (socket) => {
      dealWithClientConnection(socket, users);
    });

  server.listen(8000, () => {
    console.log('Server listening!')
  });
}

const dealWithClientConnection = (socket, users) => {
  const name = checkForAvailableUsername(users);

  if (!name) {
    socket.emit('server-message', chalk.yellow('Server is full. Please try again later.'));
    socket.disconnect();
    return;
  }

  users.set(name, socket);

  socket.emit(
    'server-message',
    chalk.yellow(`Server: Welcome to the anonymity chat! We'll call you ${chalk.bold(name)}.`)
  );

  socket.broadcast.emit('server-message', chalk.yellow(`${name} joined our server. Say hi!`));

  listenForClientMessages(socket, name);
}

const checkForAvailableUsername = (users) => {
  if (users.size === usernames.length) {
    return null;
  }

  return usernames.find(name => !users.has(name));
}

const listenForClientMessages = (socket, name) => {
  socket
    .on('message', (message) => socket.broadcast.emit('user-message', chalk.cyan(`${name}: ${message}`)))
    .on('error', (err) => disconnect(socket, name, err))
    .on('disconnect', () => alertLossOfConnection(socket, name));
}

const alertLossOfConnection = (socket, name) => {
  console.log(`${name} disconnected.`)
  socket.broadcast.emit('server-message', chalk.yellow(`${name} disconnected.`))
}

const disconnect = (socket, name, err) => {
  console.log(`${err} in ${name}'s connection. Disconnecting user...`)
  socket.disconnect();
  users.delete(name);
  alertLossOfConnection(socket, name);
}


start();