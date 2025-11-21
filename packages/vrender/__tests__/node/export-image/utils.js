const fs = require('fs');

/**
 * 创建导出目录（若不存在则递归创建）
 * @param {string} dir 目标目录路径
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 将 Stage 渲染并导出为 PNG 文件
 * @param {import('../../cjs/index.js').Stage} stage VRender Stage
 * @param {string} filePath 输出文件完整路径
 */
function renderAndExportPNG(stage, filePath) {
  stage.render();
  const buffer = stage.window.getImageBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  stage.release();
}

module.exports = { ensureDir, renderAndExportPNG };