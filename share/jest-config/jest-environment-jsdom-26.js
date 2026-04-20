const fs = require('fs');
const path = require('path');

function resolveJestEnvironmentJsdom26() {
  const pnpmDir = path.resolve(__dirname, '../../common/temp/node_modules/.pnpm');
  const entry = fs
    .readdirSync(pnpmDir)
    .find(name => name.startsWith('jest-environment-jsdom@26.6.2'));

  if (!entry) {
    throw new Error('Unable to resolve jest-environment-jsdom@26.6.2 from common/temp/node_modules/.pnpm');
  }

  return path.join(pnpmDir, entry, 'node_modules/jest-environment-jsdom/build/index.js');
}

const environmentModule = require(resolveJestEnvironmentJsdom26());

module.exports = environmentModule.default || environmentModule;
