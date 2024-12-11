import type { IGraphic, IStageParams } from '@visactor/vrender-core';

import { Group, Line, Text, createStage, Symbol, Rect, Path, Arc, Area, Circle, Polygon } from '@visactor/vrender-core';

import { array } from '@visactor/vutils';
import { initBrowserEnv } from '@visactor/vrender-kits';
import { loadScrollbar } from '../../src';
initBrowserEnv();

loadScrollbar();

export default function render(component: IGraphic | IGraphic[], canvasId: string, option?: Partial<IStageParams>) {
  // 创建舞台实例
  const stage = createRenderer(canvasId, option);
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
    disableDirtyBounds: false,
    // canvasControled: false,
    background: 'rgba(238,238,238,0.5)',
    viewBox: {
      x1: 50,
      y1: 50,
      x2: 550,
      y2: 550
    },
    pluginList: ['poptipForText', 'scrollbar'],
    enableHtmlAttribute: true,
    ...option
  });
}

export function _add(group, json) {
  if (json.type === 'group') {
    const g = new Group(json.attribute);
    group.add(g);
    g.name = json.name;
    json.children &&
      json.children.forEach(item => {
        _add(g, item);
      });
  } else if (json.type === 'line') {
    group.add(new Line(json.attribute));
  } else if (json.type === 'text') {
    group.add(new Text(json.attribute));
  } else if (json.type === 'symbol') {
    group.add(new Symbol(json.attribute));
  } else if (json.type === 'rect') {
    group.add(new Rect(json.attribute));
  } else if (json.type === 'path') {
    group.add(new Path(json.attribute));
  } else if (json.type === 'arc') {
    group.add(new Arc(json.attribute));
  } else if (json.type === 'area') {
    group.add(new Area(json.attribute));
  } else if (json.type === 'circle') {
    group.add(new Circle(json.attribute));
  } else if (json.type === 'polygon') {
    group.add(new Polygon(json.attribute));
  }
}
