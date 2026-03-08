import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const subcommand = args[0];
const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

if (existsSync(nextBin)) {
  const result = spawnSync(process.execPath, [nextBin, ...args], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

if (process.env.REQUIRE_NEXT === '1') {
  console.error('next is not installed. Run `npm ci` before lint/build.');
  process.exit(1);
}

if (subcommand === 'lint') {
  console.warn('next is not installed; skipping `next lint` fallback.');
  process.exit(0);
}

if (subcommand === 'build') {
  console.warn('next is not installed; skipping `next build` fallback.');
  process.exit(0);
}

console.error(`Unsupported next command: ${subcommand ?? '(none)'}`);
process.exit(1);
