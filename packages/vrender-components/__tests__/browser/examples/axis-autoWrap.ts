import { createStage } from '@visactor/vrender-core';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();
import render from '../../util/render';
import { LineAxis } from '../../../src';

const autoRotate = false;

const stage = createStage({
  canvas: 'main',
  width: 1800,
  height: 1800,
  autoRender: true,
  disableDirtyBounds: true,
  enableHtmlAttribute: true
});
(window as any).stage = stage;

{
  let currentX = 100;
  const height = 300;
  new Array(9).fill(0).map((entry, index) => {
    const axis = new LineAxis({
      x: currentX,
      y: 100,
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: height
      },
      pickable: true,
      visible: true,
      orient: 'left',
      line: {
        visible: true
      },
      label: {
        visible: true,
        // containerAlign: 'left',
        autoWrap: true,
        autoRotate,
        // autoHide: true,
        space: 12,
        style: {
          // textAlign: 'right',
          angle: (1 * Math.PI) / 4,
          fontSize: 10,
          fill: '#000000',
          fontWeight: 'normal',
          fillOpacity: 1
        }
      },
      tick: {
        visible: true
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
          background: 'green',
          fillOpacity: 0.1
        }
      },
      verticalFactor: 1,
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
        ].map(v => ({ ...v, label: `${v.label} -- Loooooooooong Loooooooooong Text` }))
      ],
      verticalLimitSize: 87,
      verticalMinSize: null as any
    });
    stage.defaultLayer.add(axis);
    currentX += (axis as any).AABBBounds.width() + 30;
  });
}
{
  const startX = 100;
  const height = 150;
  const width = 100;
  new Array(9).fill(0).map((entry, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const axis = new LineAxis({
      x: startX + col * width,
      y: 450,
      start: {
        x: col * width,
        y: row * height
      },
      end: {
        x: (col + 1) * width,
        y: row * height
      },
      pickable: true,
      visible: true,
      orient: 'bottom',
      line: {
        visible: true
      },
      label: {
        visible: true,
        // containerAlign: 'left',
        autoWrap: true,
        autoRotate,
        // autoHide: true,
        space: 12,
        style: {
          // textAlign: 'right',
          angle: (index * Math.PI) / 4,
          fontSize: 10,
          fill: '#000000',
          fontWeight: 'normal',
          fillOpacity: 1,
          wordBreak: 'break-word'
        }
      },
      tick: {
        visible: true
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
          background: 'blue',
          fillOpacity: 0.1
        }
      },
      verticalFactor: 1,
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
        ].map(v => ({ ...v, label: `${v.label} -- Loooooooooong Loooooooooong Text` }))
      ],
      verticalLimitSize: height - 20,
      verticalMinSize: null as any
    });
    stage.defaultLayer.add(axis);
  });
}
stage.render();
