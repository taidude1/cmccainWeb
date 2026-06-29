// Run once to create all user credentials: npm run setup
import bcrypt from 'bcryptjs';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => rl.question(q, resolve));

const ROLES = [
  { key: 'admin',     label: 'Admin (Connor)'          },
  { key: 'challenge', label: 'Challenge friend (Jack)'  },
  { key: 'viewer',    label: 'Viewer (Yitian)'          },
];

async function main() {
  console.log('\nChallenge Tracker — User Setup\n');

  const existing = existsSync('./data/users.json')
    ? JSON.parse(readFileSync('./data/users.json', 'utf8'))
    : [];
  const users = Array.isArray(existing) ? existing : [];

  for (const { key, label } of ROLES) {
    console.log(`\n— ${label} —`);
    const username = await ask('  Username: ');
    const password = await ask('  Password: ');
    const hash = await bcrypt.hash(password, 10);
    const idx = users.findIndex(u => u.role === key);
    if (idx >= 0) users[idx] = { username, hash, role: key };
    else users.push({ username, hash, role: key });
  }

  writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
  console.log('\n✓ All users saved. Run "npm run dev" to start the server.\n');
  rl.close();
}

main();
