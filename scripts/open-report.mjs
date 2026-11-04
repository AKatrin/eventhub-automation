import { spawn } from 'node:child_process';
import path from 'node:path';

const target = path.resolve(process.cwd(), process.argv[2] ?? 'reports/cucumber-report.html');

const command =
  process.platform === 'win32'
    ? 'cmd'
    : process.platform === 'darwin'
      ? 'open'
      : 'xdg-open';

const args = process.platform === 'win32' ? ['/c', 'start', '', target] : [target];

spawn(command, args, { stdio: 'ignore', detached: true }).unref();
console.log(`Opening ${target}`);
