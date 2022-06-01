import io from 'socket.io-client';
import readline from 'readline';
import chalk from 'chalk';

const socket = io('http://localhost:8000');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const sendMessage = () => {
  rl.question('', (reply) => {
    socket.emit('message', reply);
    sendMessage();
  });
}

socket.on('connect', () => {
  console.log(chalk.green('Sucessfully connected to server.'));
  sendMessage();
});

socket.on('connect_error', (err) => {
  console.log(chalk.red(`connection error due to ${err.message}`));
  rl.close();
});

socket.on('disconnect', () => rl.close());
socket.on('server-message', (msg) => console.log(msg));
socket.on('user-message', (msg) => console.log(msg));