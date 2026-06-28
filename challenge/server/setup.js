// Run once to create your login credentials: npm run setup
import bcrypt from 'bcryptjs';
import { writeFileSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  console.log('Challenge Tracker — First-time setup\n');
  const username = await ask('Choose a username: ');
  const password = await ask('Choose a password: ');
  const hash = await bcrypt.hash(password, 10);

  writeFileSync('./data/users.json', JSON.stringify({ username, hash }, null, 2));
  console.log('\nCredentials saved. Run "npm run dev" to start the server.');
  rl.close();
}

main();
