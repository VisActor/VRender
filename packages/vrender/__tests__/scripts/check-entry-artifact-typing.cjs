const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..', '..');
const entryTypeFiles = [
  'es/entries/browser.d.ts',
  'es/entries/node.d.ts',
  'cjs/entries/browser.d.ts',
  'cjs/entries/node.d.ts'
];

let hasFailure = false;

for (const relativePath of entryTypeFiles) {
  const artifact = fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');

  if (!artifact.includes('IApp')) {
    console.error(`${relativePath}: missing IApp return type`);
    hasFailure = true;
  }

  if (artifact.includes('): object;')) {
    console.error(`${relativePath}: still exposes object return type`);
    hasFailure = true;
  }
}

if (hasFailure) {
  process.exit(1);
}

console.log('entry artifact typing looks correct');
