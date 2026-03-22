import { mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const configDir = path.join(os.tmpdir(), 'firebase-config');

mkdirSync(configDir, { recursive: true });

const env = {
  ...process.env,
  XDG_CONFIG_HOME: configDir,
  FIREBASE_SKIP_UPDATE_CHECK: '1'
};

const firebaseCommand = process.platform === 'win32' ? 'firebase.cmd' : 'firebase';

const result = spawnSync(
  firebaseCommand,
  [
    'emulators:exec',
    '--only',
    'auth,firestore',
    '--project',
    'demo-real-chat',
    'node scripts/verify-firestore-rules.mjs'
  ],
  {
    stdio: 'inherit',
    env
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

if (result.signal) {
  console.error(`firebase emulators:exec was terminated by signal: ${result.signal}`);
}

if (typeof result.status === 'number' && result.status !== 0) {
  console.error(`firebase emulators:exec exited with status: ${result.status}`);
}

process.exit(result.status ?? 1);
