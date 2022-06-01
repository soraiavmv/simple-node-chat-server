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
  console.log(chalk.red(`connect_error due to ${err.message}`));
});

socket.on('server-message', (msg) => {
  console.log(chalk.yellow(`Server says: ${msg}`))
});