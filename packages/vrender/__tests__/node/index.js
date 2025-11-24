const CanvasPkg = require('canvas');
const {
  vglobal,
  createStage,
  createGroup,
  createLine,
  createText,
  createSymbol,
  createRect,
  createPath,
  createArc,
  createArea,
  createCircle
} = require('../../cjs/index.js');
const fs = require('fs');

const vchartStageJson = require('./vchart-stage.json');
/**
 * 在 Node 环境下渲染示例并输出 PNG 文件
 * - 注入 node-canvas 到 VRender 环境
 * - 创建无 DOM 的 Stage，渲染矩形
 * - 导出 PNG Buffer 并写入 image.png
 */

function _add(group, json) {
  if (json.type === 'group') {
    const g = createGroup(json.attribute);
    group.add(g);
    json.children &&
      json.children.forEach(item => {
        _add(g, item);
      });
  } else if (json.type === 'line') {
    console.log(json.points);
    group.add(createLine(json.attribute));
  } else if (json.type === 'text') {
    group.add(createText(json.attribute));
  } else if (json.type === 'symbol') {
    group.add(createSymbol(json.attribute));
  } else if (json.type === 'rect') {
    group.add(createRect(json.attribute));
  } else if (json.type === 'path') {
    group.add(createPath(json.attribute));
  } else if (json.type === 'arc') {
    group.add(createArc(json.attribute));
  } else if (json.type === 'area') {
    group.add(createArea(json.attribute));
  } else if (json.type === 'circle') {
    group.add(createCircle(json.attribute));
  }
}

const loadVChartStage = (stage, json) => {
  const layer = stage.at(0);

  json.children[0].children.forEach(item => {
    _add(layer, item);
  });
};

function main() {
  // 注册 Node 环境与 node-canvas
  vglobal.setEnv('node', CanvasPkg);

  // 创建舞台
  const stage = createStage({ width: 340, height: 300, autoRender: false, dpr: 2 });

  // 添加图形
  loadVChartStage(stage, vchartStageJson);

  // 渲染与导出
  stage.render();
  const buffer = stage.window.getImageBuffer('image/png');
  fs.writeFileSync(__dirname + '/image.png', buffer);

  // 释放
  stage.release();
}

main();
