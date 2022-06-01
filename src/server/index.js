import http from 'http';
import { Server } from 'socket.io';
import chalk from 'chalk';

const MAX_USERS = 10;

const start = async () => {
  const server = http.createServer();
  const serverSocket = new Server(server);
  const users = new Map();

  serverSocket
    .on('connection', async (socket) => {
      await dealWithClientConnection(socket, users);
    });

  server.listen(8000, () => {
    console.log('Server listening!')
  });
}

const dealWithClientConnection = async (socket, users) => {
  const name = await checkForServerAvailability(socket, users);

  if (!name) {
    socket.emit('server-message', chalk.yellow('Server is full. Please try again later.'));
    socket.disconnect();
    return;
  }

  users.set(name, socket);
  socket.emit(
    'server-message',
    chalk.yellow(`Welcome to this dull chat! We'll call you ${chalk.bold(name)}.`)
  );

  socket.broadcast.emit('server-message', chalk.yellow(`${name} joined our server. Say hi!`));

  listenForClientMessages(socket, name);
}

const checkForServerAvailability = async (socket, users) => {
  if (users.size === MAX_USERS) {
    return null;
  }

  socket.emit('username-message', chalk.yellow('What should we call you here?'));
  const username = await new Promise((resolve) => socket.on('username', resolve));
  return username;
}

const listenForClientMessages = (socket, name) => {
  socket
    .on('message', (message) => socket.broadcast.emit('user-message', chalk.cyan(`${name}: ${message}`)))
    .on('error', (err) => disconnect(socket, name, users, err))
    .on('disconnect', () => alertLossOfConnection(socket, name, users));
}

const alertLossOfConnection = (socket, name, users) => {
  users.delete(name);
  console.log(`${name} disconnected.`);
  socket.broadcast.emit('server-message', chalk.yellow(`${name} disconnected.`));
}

const disconnect = (socket, name, users, err) => {
  console.log(`${err} in ${name}'s connection. Disconnecting user...`);
  socket.disconnect();
  alertLossOfConnection(socket, name, users);
}


void start().catch(console.err);