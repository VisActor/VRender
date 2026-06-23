const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const copies = [
  ['node_modules/js-binary-schema-parser/lib/index.js', 'miniprogram/miniprogram_npm/js-binary-schema-parser/lib/index.js'],
  ['node_modules/js-binary-schema-parser/lib/index.js', 'miniprogram/miniprogram_npm/js-binary-schema-parser/lib.js'],
  [
    'node_modules/js-binary-schema-parser/lib/schemas/gif.js',
    'miniprogram/miniprogram_npm/js-binary-schema-parser/lib/schemas/gif.js'
  ],
  [
    'node_modules/js-binary-schema-parser/lib/parsers/uint8.js',
    'miniprogram/miniprogram_npm/js-binary-schema-parser/lib/parsers/uint8.js'
  ]
];

function copyFile(from, to) {
  const source = path.join(projectRoot, from);
  const target = path.join(projectRoot, to);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing source file: ${source}`);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`patched ${to}`);
}

for (const [from, to] of copies) {
  copyFile(from, to);
}

const gifSchemaPath = path.join(projectRoot, 'miniprogram/miniprogram_npm/js-binary-schema-parser/lib/schemas/gif.js');
let gifSchema = fs.readFileSync(gifSchemaPath, 'utf8');
gifSchema = gifSchema
  .replace('var _ = require("../");', 'var _ = require("js-binary-schema-parser");')
  .replace(
    'var _uint = require("../parsers/uint8");',
    'var _uint = require("js-binary-schema-parser/lib/parsers/uint8");'
  );
fs.writeFileSync(gifSchemaPath, gifSchema);
console.log('patched js-binary-schema-parser/lib/schemas/gif.js require paths');

function replaceOnce(content, from, to, label) {
  if (!content.includes(from)) {
    throw new Error(`Cannot patch ${label}: pattern not found`);
  }
  return content.replace(from, to);
}

function patchSection(content, startMarker, endMarker, patcher, label) {
  const start = content.indexOf(startMarker);
  if (start < 0) {
    throw new Error(`Cannot patch ${label}: start marker not found`);
  }
  const end = content.indexOf(endMarker, start);
  if (end < 0) {
    throw new Error(`Cannot patch ${label}: end marker not found`);
  }

  return content.slice(0, start) + patcher(content.slice(start, end)) + content.slice(end);
}

function patchSectionIfPresent(content, startMarker, endMarker, patcher, label) {
  if (!content.includes(startMarker)) {
    return { content, seen: false, patched: false };
  }

  let patched = false;
  const next = patchSection(
    content,
    startMarker,
    endMarker,
    section => {
      const patchResult = patcher(section);
      patched = patchResult !== section;
      return patchResult;
    },
    label
  );

  return { content: next, seen: true, patched };
}

function patchWxBundle(bundlePath) {
  let content = fs.readFileSync(bundlePath, 'utf8');
  let patched = false;
  let seenWxCode = false;

  let result = patchSectionIfPresent(
    content,
    'class WxWindowHandlerContribution extends',
    '\nfunction bindWxWindowContribution',
    section => {
      let next = section;
      if (!content.includes('function setMiniAppEventTarget')) {
        next =
          'function setMiniAppEventTarget(event, key, value) {\n' +
          '    if (!event || !value) return;\n' +
          '    try {\n' +
          '        event[key] = value;\n' +
          '    } catch (err) {\n' +
          '        Object.defineProperty(event, key, {\n' +
          '            configurable: !0,\n' +
          '            value: value\n' +
          '        });\n' +
          '    }\n' +
          '}\n\n' +
          next;
        patched = true;
      }

      if (!next.includes('setMiniAppEventTarget(event, "target"')) {
        next = replaceOnce(
          next,
          'const {type: type} = event;\n        return !!this.eventManager.cache[type] && (',
          'const {type: type} = event;\n        if (!this.eventManager.cache[type]) return !1;\n        const nativeCanvas = this.canvas && this.canvas.nativeCanvas;\n        setMiniAppEventTarget(event, "target", nativeCanvas), setMiniAppEventTarget(event, "currentTarget", nativeCanvas);\n        return (',
          'wx window event target normalization'
        );
        patched = true;
      }

      return next;
    },
    'wx window contribution'
  );
  content = result.content;
  patched = patched || result.patched;
  seenWxCode = seenWxCode || result.seen;

  result = patchSectionIfPresent(
    content,
    'class WxEnvContribution extends',
    '\nexports.WxEnvContribution',
    section => {
      if (!section.includes('loadSvg(url) {\n        return Promise.reject();\n    }')) {
        return section;
      }
      patched = true;
      return section.replace(
        'loadSvg(url) {\n        return Promise.reject();\n    }',
        'loadSvg(url) {\n        return Promise.resolve({\n            data: null,\n            loadState: "fail"\n        });\n    }'
      );
    },
    'wx env contribution'
  );
  content = result.content;
  patched = patched || result.patched;
  seenWxCode = seenWxCode || result.seen;

  if (seenWxCode) {
    fs.writeFileSync(bundlePath, content);
  }

  return { seenWxCode, patched };
}

function collectJavaScriptFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJavaScriptFiles(entryPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(entryPath);
    }
  }

  return files;
}

function patchWxVRenderBundles() {
  const bundleRoot = path.join(projectRoot, 'miniprogram/miniprogram_npm/@visactor');
  const files = collectJavaScriptFiles(bundleRoot);
  let seenWxBundle = false;
  let patchedCount = 0;

  for (const file of files) {
    const result = patchWxBundle(file);
    if (!result.seenWxCode) {
      continue;
    }
    seenWxBundle = true;
    if (result.patched) {
      patchedCount++;
      console.log(`patched ${path.relative(projectRoot, file)} wx event target normalization and svg fail fallback`);
    } else {
      console.log(`${path.relative(projectRoot, file)} wx patches already present`);
    }
  }

  if (!seenWxBundle) {
    console.warn('skip @visactor wx patches: miniprogram npm wx bundle not found');
  } else if (!patchedCount) {
    console.log('@visactor wx patches already present');
  }
}

patchWxVRenderBundles();
