import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryDir = resolve(projectDir, '..');
const isWindows = process.platform === 'win32';
const javaName = isWindows ? 'java.exe' : 'java';

const localFirebaseVariables = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'demo-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-gante.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-gante',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-gante.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '100000000000',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:100000000000:web:gante',
  NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL: 'jobson.nunes.souza@gmail.com',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR: 'true',
};

const localEnvironment = `${Object.entries(localFirebaseVariables).map(([key, value]) => `${key}=${value}`).join('\n')}\n`;

function findPortableJava(directory, depth = 0) {
  if (!existsSync(directory) || depth > 5) return '';
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const candidate = join(directory, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === javaName) return candidate;
    if (entry.isDirectory()) {
      const found = findPortableJava(candidate, depth + 1);
      if (found) return found;
    }
  }
  return '';
}

function javaEnvironment() {
  const environment = { ...process.env };
  const available = spawnSync(javaName, ['-version'], { env: environment, stdio: 'ignore' }).status === 0;
  if (available) return environment;

  const javaExecutable = findPortableJava(join(repositoryDir, 'work', 'java'));
  if (!javaExecutable) {
    console.error('\nJava 21 não foi encontrado. Instale o JDK 21 ou coloque a versão portátil em Barbearia-Gante/work/java e execute novamente.\n');
    process.exit(1);
  }

  const javaHome = dirname(dirname(javaExecutable));
  environment.JAVA_HOME = javaHome;
  environment.PATH = `${join(javaHome, 'bin')}${isWindows ? ';' : ':'}${environment.PATH ?? ''}`;
  return environment;
}

const environmentPath = join(projectDir, '.env.local');
if (!existsSync(environmentPath)) {
  writeFileSync(environmentPath, localEnvironment, 'utf8');
  console.log('Arquivo .env.local criado automaticamente para o Firebase local.');
}

const environment = { ...javaEnvironment(), ...localFirebaseVariables };
const localConfigDirectory = join(projectDir, 'work', 'config');
mkdirSync(localConfigDirectory, { recursive: true });
environment.XDG_CONFIG_HOME = localConfigDirectory;
const firebaseCli = join(projectDir, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
const vinextCli = join(projectDir, 'node_modules', 'vinext', 'dist', 'cli.js');

if (!existsSync(firebaseCli) || !existsSync(vinextCli)) {
  console.error('\nDependências ausentes. Execute npm install dentro de web e tente novamente.\n');
  process.exit(1);
}

console.log('\nIniciando Firebase local e Gante Barbearia...');
console.log('Site: http://localhost:3000');
console.log('Firebase: http://localhost:4000\n');

const children = [];
let stopping = false;

function start(command, args) {
  const child = spawn(command, args, { cwd: projectDir, env: environment, stdio: 'inherit' });
  children.push(child);
  child.on('exit', (code) => {
    if (!stopping && code !== 0) {
      console.error(`Um processo de desenvolvimento terminou com código ${code}.`);
      stop(code ?? 1);
    }
  });
  return child;
}

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGINT');
  }
  setTimeout(() => process.exit(exitCode), 1200).unref();
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

const firebaseDataDirectory = join(projectDir, '.firebase-data');
const hasFirebaseExport = existsSync(join(firebaseDataDirectory, 'firebase-export-metadata.json'));
if (existsSync(firebaseDataDirectory) && !hasFirebaseExport) rmSync(firebaseDataDirectory, { recursive: true, force: true });
const firebaseArgs = [firebaseCli, 'emulators:start', '--project', 'demo-gante', '--export-on-exit', '.firebase-data'];
if (hasFirebaseExport) {
  firebaseArgs.push('--import', '.firebase-data');
}
start(process.execPath, firebaseArgs);
setTimeout(() => start(process.execPath, [vinextCli, 'dev']), 1500);
