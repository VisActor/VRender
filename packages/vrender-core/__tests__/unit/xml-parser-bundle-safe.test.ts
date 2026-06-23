/**
 * @jest-environment node
 */

declare const __dirname: string;
declare const require: any;
export {};

const fs = require('fs');
const path = require('path');

describe('xml parser bundle contract', () => {
  it('does not keep free xml parser require in browser-facing es graphics', () => {
    const files = [
      path.resolve(__dirname, '../../es/graphic/graphic.js'),
      path.resolve(__dirname, '../../es/graphic/tools.js')
    ];

    files.forEach(file => {
      const code = fs.readFileSync(file, 'utf8');

      expect(code).not.toContain('require("../common/xml/parser")');
      expect(code).not.toContain("require('../common/xml/parser')");
    });
  });
});
