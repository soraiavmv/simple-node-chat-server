import io from 'socket.io-client';
import readline from 'readline';
import chalk from 'chalk';

const socket = io('http://localhost:8000');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const sendMessage = (username) => {
  rl.question('', (reply) => {
    console.log(username);
    socket.emit(username ? 'username' : 'message', reply);
    sendMessage();
  });
}

socket.on('connect', () => {
  console.log(chalk.green('Sucessfully connected to server.'));
});

socket.on('connect_error', (err) => {
  console.log(chalk.red(`connection error due to ${err.message}`));
  rl.close();
});

socket.on('disconnect', () => rl.close());
socket.on('server-message', (msg) => console.log(msg));
socket.on('user-message', (msg) => console.log(msg));
socket.on('username-message', (msg) => {
  console.log(msg);
  sendMessage('username');
})