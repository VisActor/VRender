import {
  Group,
  Line,
  Text,
  Symbol,
  Rect,
  Path,
  Arc,
  Area,
  Circle,
  Polygon,
  type IGraphic,
  type IStageParams,
  type Stage
} from '@visactor/vrender-core';
import { createBrowserVRenderApp } from '../../../vrender/src/entries';

import { array } from '@visactor/vutils';
import { installScrollbarToApp } from '../../src';

type TManagedApp = {
  createStage: (params: Partial<IStageParams>) => unknown;
  release: () => void;
};

function attachAppRelease(stage: Stage, app: TManagedApp): Stage {
  const originalRelease = stage.release.bind(stage);
  let released = false;

  stage.release = ((...args: []) => {
    if (released) {
      return;
    }
    released = true;
    try {
      originalRelease(...args);
    } finally {
      app.release();
    }
  }) as typeof stage.release;

  return stage;
}

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
  const app = createBrowserVRenderApp() as unknown as TManagedApp;
  installScrollbarToApp(app as any);

  const stage = app.createStage({
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
  }) as Stage;

  return attachAppRelease(stage, app);
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
