const CanvasPkg = require('canvas');
const { vglobal, createStage, createRect } = require('../../cjs/index.js');
const fs = require('fs');

/**
 * 在 Node 环境下渲染示例并输出 PNG 文件
 * - 注入 node-canvas 到 VRender 环境
 * - 创建无 DOM 的 Stage，渲染矩形
 * - 导出 PNG Buffer 并写入 image.png
 */
function main() {
  // 注册 Node 环境与 node-canvas
  vglobal.setEnv('node', CanvasPkg);

  // 创建舞台
  const stage = createStage({ width: 240, height: 180, autoRender: false });

  // 添加图形
  const rect = createRect({ x: 30, y: 40, width: 140, height: 90, fill: '#4a90e2' });
  stage.defaultLayer.add(rect);

  // 渲染与导出
  stage.render();
  const buffer = stage.window.getImageBuffer('image/png');
  fs.writeFileSync(__dirname + '/image.png', buffer);

  // 释放
  stage.release();
}

main();
