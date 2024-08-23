import { createStage } from '@visactor/vrender-core';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();
import render from '../../util/render';
import { LineAxis } from '../../../src';

const stage = createStage({
  canvas: 'main',
  width: 1200,
  height: 1200,
  autoRender: true,
  disableDirtyBounds: true,
  enableHtmlAttribute: true
});
(window as any).stage = stage;

const axies: any[] = [];

[false, true].forEach((inside, insideIndex) => {
  ['left', 'right'].forEach(orient => {
    let currentX: number = orient === 'left' ? (inside ? 20 : 600) : inside ? 1180 : 650;
    new Array(9).fill(0).map((entry, index) => {
      const axis = new LineAxis({
        x: currentX,
        y: 40 + insideIndex * 600,
        start: {
          x: 0,
          y: 0
        },
        end: {
          x: 0,
          y: 408
        },
        pickable: true,
        visible: true,
        orient: orient,
        line: {
          visible: true
        },
        label: {
          visible: true,
          // containerAlign: 'left',
          inside,
          space: 12,
          style: {
            // textAlign: 'right',
            angle: (index * Math.PI) / 4,
            fontSize: 10,
            fill: '#000000',
            fontWeight: 'normal',
            fillOpacity: 1
          }
        },
        tick: {
          visible: true,
          inside
        },
        subTick: {
          visible: false
        },
        title: {
          visible: true,
          text: `测试label旋转角度${index * 45}`,
          maxWidth: null
        },
        panel: {
          visible: true,
          style: {
            background: 'pink'
          }
        },
        verticalFactor: orient === 'left' ? 1 : -1,
        items: [
          [
            {
              id: 0,
              label: 0,
              value: 1,
              rawValue: 0
            },
            {
              id: 5,
              label: 500,
              value: 0.75,
              rawValue: 500
            },
            {
              id: 10,
              label: 1000,
              value: 0.5,
              rawValue: 1000
            },
            {
              id: 15,
              label: 1500,
              value: 0.25,
              rawValue: 1500
            },
            {
              id: 20,
              label: 2000,
              value: 0,
              rawValue: 2000
            }
          ]
        ],
        verticalLimitSize: 87,
        verticalMinSize: null as any
      });

      stage.defaultLayer.add(axis);
      currentX += (orient === 'left' ? -1 : 1) * (inside ? -1 : 1) * ((axis as any).AABBBounds.width() + 10);
    });
  });
});

stage.render();
