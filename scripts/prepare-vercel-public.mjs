import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const source = resolve(projectRoot, 'frontend/public');
const destination = resolve(projectRoot, 'public');

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });

console.log('Prepared frontend public assets for the Vercel Next.js build.');
