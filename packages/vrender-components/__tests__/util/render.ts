import type { IGraphic, IStageParams } from '@visactor/vrender-core';
import {
  createStage,
  createGroup,
  createLine,
  createText,
  createSymbol,
  createRect,
  createPath,
  createArc,
  createArea,
  createCircle,
  createPolygon
} from '@visactor/vrender-core';

import { array } from '@visactor/vutils';

export default function render(component: IGraphic | IGraphic[], canvasId: string) {
  // 创建舞台实例
  const stage = createRenderer(canvasId);
  window.stage = stage;
  // 将组件添加至舞台
  array(component).forEach(c => {
    stage.defaultLayer.add(c);
  });
  // 渲染
  stage.render();

  return stage;
}

export function createRenderer(canvasId: string, option: Partial<IStageParams> = {}) {
  return createStage({
    canvas: canvasId,
    width: 600,
    height: 600,
    autoRender: true,
    disableDirtyBounds: true,
    // canvasControled: false,
    background: 'rgba(238,238,238,0.5)',
    viewBox: {
      x1: 50,
      y1: 50,
      x2: 550,
      y2: 550
    },
    pluginList: ['poptipForText', 'scrollbar'],
    ...option
  });
}

export function _add(group, json) {
  if (json.type === 'group') {
    const g = createGroup(json.attribute);
    group.add(g);
    g.name = json.name;
    json.children &&
      json.children.forEach(item => {
        _add(g, item);
      });
  } else if (json.type === 'line') {
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
  } else if (json.type === 'polygon') {
    group.add(createPolygon(json.attribute));
  }
}
