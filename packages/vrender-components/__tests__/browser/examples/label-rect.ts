import { mat4 } from './../../../../vrender-core/src/common/matrix';
import { GUI } from 'lil-gui';
import '@visactor/vrender';
import { createGroup, Stage, createRect } from '@visactor/vrender';
import { createRenderer } from '../../util/render';
import { RectLabel } from '../../../src';

const barGenerator = () => {
  const spec: any = {
    attribute: {
      pickable: false,
      zIndex: 300
    },
    id: 200,
    type: 'group',
    name: 'bar_9',
    children: [
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 21.969230769230762,
          y: 304.63999999999993,

          fill: '#6690F2',
          y2: 333.2,
          width: 65.9076923076923,
          height: 28.56000000000006,
          pickable: true,
          zIndex: 300
        },
        id: 201,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 95.19999999999999,
          y: 252.27999999999997,

          fill: '#6690F2',
          y2: 333.2,
          width: 65.9076923076923,
          height: 80.92000000000002,
          pickable: true,
          zIndex: 300
        },
        id: 202,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 168.43076923076922,
          y: 273.7,

          fill: '#6690F2',
          y2: 333.2,
          width: 65.9076923076923,
          height: 59.5,
          pickable: true,
          zIndex: 300
        },
        id: 203,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 241.66153846153844,
          y: 218.95999999999998,

          fill: '#6690F2',
          y2: 333.2,
          width: 65.9076923076923,
          height: 114.24000000000001,
          pickable: true,
          zIndex: 300
        },
        id: 204,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 314.89230769230767,
          y: 202.29999999999993,

          fill: '#6690F2',
          y2: 333.2,
          width: 65.9076923076923,
          height: 130.90000000000006,
          pickable: true,
          zIndex: 300
        },
        id: 205,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 388.1230769230769,
          y: 233.23999999999995,

          fill: '#6690F2',
          y2: 333.2,
          width: 65.9076923076923,
          height: 99.96000000000004,
          pickable: true,
          zIndex: 300
        },
        id: 206,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 21.969230769230762,
          y: 249.89999999999995,

          fill: '#70D6A3',
          y2: 304.63999999999993,
          width: 65.9076923076923,
          height: 54.73999999999998,
          pickable: true,
          zIndex: 300
        },
        id: 207,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 95.19999999999999,
          y: 192.77999999999992,

          fill: '#70D6A3',
          y2: 252.27999999999997,
          width: 65.9076923076923,
          height: 59.50000000000006,
          pickable: true,
          zIndex: 300
        },
        id: 208,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 168.43076923076922,
          y: 230.85999999999993,

          fill: '#70D6A3',
          y2: 273.7,
          width: 65.9076923076923,
          height: 42.84000000000006,
          pickable: true,
          zIndex: 300
        },
        id: 209,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 241.66153846153844,
          y: 173.74,

          fill: '#70D6A3',
          y2: 218.95999999999998,
          width: 65.9076923076923,
          height: 45.21999999999997,
          pickable: true,
          zIndex: 300
        },
        id: 210,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 314.89230769230767,
          y: 166.59999999999994,

          fill: '#70D6A3',
          y2: 202.29999999999993,
          width: 65.9076923076923,
          height: 35.69999999999999,
          pickable: true,
          zIndex: 300
        },
        id: 211,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 388.1230769230769,
          y: 333.2,

          fill: '#70D6A3',
          y2: 361.76,
          width: 65.9076923076923,
          height: 28.560000000000002,
          pickable: true,
          zIndex: 300
        },
        id: 212,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 21.969230769230762,
          y: 176.11999999999995,

          fill: '#B4E6E2',
          y2: 249.89999999999995,
          width: 65.9076923076923,
          height: 73.78,
          pickable: true,
          zIndex: 300
        },
        id: 213,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 95.19999999999999,
          y: 114.2399999999999,

          fill: '#B4E6E2',
          y2: 192.77999999999992,
          width: 65.9076923076923,
          height: 78.54000000000002,
          pickable: true,
          zIndex: 300
        },
        id: 214,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 168.43076923076922,
          y: 135.65999999999997,

          fill: '#B4E6E2',
          y2: 230.85999999999993,
          width: 65.9076923076923,
          height: 95.19999999999996,
          pickable: true,
          zIndex: 300
        },
        id: 215,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 241.66153846153844,
          y: 116.61999999999995,

          fill: '#B4E6E2',
          y2: 173.74,
          width: 65.9076923076923,
          height: 57.12000000000006,
          pickable: true,
          zIndex: 300
        },
        id: 216,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 314.89230769230767,
          y: 123.7599999999999,

          fill: '#B4E6E2',
          y2: 166.59999999999994,
          width: 65.9076923076923,
          height: 42.84000000000003,
          pickable: true,
          zIndex: 300
        },
        id: 217,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 388.1230769230769,
          y: 361.76,

          fill: '#B4E6E2',
          y2: 409.36,
          width: 65.9076923076923,
          height: 47.60000000000002,
          pickable: true,
          zIndex: 300
        },
        id: 218,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 21.969230769230762,
          y: 42.83999999999993,

          fill: '#63B5FC',
          y2: 176.11999999999995,
          width: 65.9076923076923,
          height: 133.28000000000003,
          pickable: true,
          zIndex: 300
        },
        id: 219,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 95.19999999999999,
          y: 45.219999999999885,

          fill: '#63B5FC',
          y2: 114.2399999999999,
          width: 65.9076923076923,
          height: 69.02000000000001,
          pickable: true,
          zIndex: 300
        },
        id: 220,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 168.43076923076922,
          y: 99.95999999999994,

          fill: '#63B5FC',
          y2: 135.65999999999997,
          width: 65.9076923076923,
          height: 35.70000000000003,
          pickable: true,
          zIndex: 300
        },
        id: 221,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 241.66153846153844,
          y: 107.09999999999994,

          fill: '#63B5FC',
          y2: 116.61999999999995,
          width: 65.9076923076923,
          height: 9.52000000000001,
          pickable: true,
          zIndex: 300
        },
        id: 222,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 314.89230769230767,
          y: 90.43999999999987,

          fill: '#63B5FC',
          y2: 123.7599999999999,
          width: 65.9076923076923,
          height: 33.320000000000036,
          pickable: true,
          zIndex: 300
        },
        id: 223,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 388.1230769230769,
          y: 409.36,

          fill: '#63B5FC',
          y2: 447.44,
          width: 65.9076923076923,
          height: 38.079999999999984,
          pickable: true,
          zIndex: 300
        },
        id: 224,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 21.969230769230762,
          y: 7.1399999999999535,

          fill: '#FF8F62',
          y2: 42.83999999999993,
          width: 65.9076923076923,
          height: 35.69999999999998,
          pickable: true,
          zIndex: 300
        },
        id: 225,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 95.19999999999999,
          y: 19.03999999999991,

          fill: '#FF8F62',
          y2: 45.219999999999885,
          width: 65.9076923076923,
          height: 26.179999999999975,
          pickable: true,
          zIndex: 300
        },
        id: 226,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 168.43076923076922,
          y: 96.38999999999996,

          fill: '#FF8F62',
          y2: 99.95999999999994,
          width: 65.9076923076923,
          height: 3.569999999999979,
          pickable: true,
          zIndex: 300
        },
        id: 227,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 241.66153846153844,
          y: 102.33999999999993,

          fill: '#FF8F62',
          y2: 107.09999999999994,
          width: 65.9076923076923,
          height: 4.760000000000005,
          pickable: true,
          zIndex: 300
        },
        id: 228,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 314.89230769230767,
          y: 90.43999999999987,

          fill: '#FF8F62',
          y2: 90.43999999999987,
          width: 65.9076923076923,
          height: 0,
          pickable: true,
          zIndex: 300
        },
        id: 229,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          fillOpacity: 1,
          x: 388.1230769230769,
          y: 447.44,

          fill: '#FF8F62',
          y2: 459.34000000000003,
          width: 65.9076923076923,
          height: 11.900000000000034,
          pickable: true,
          zIndex: 300
        },
        id: 230,
        type: 'rect',
        children: []
      }
    ]
  };

  return spec;
};

function createContent(stage: Stage) {
  const barSpec = barGenerator();
  const barGroup = createGroup(barSpec.attribute);
  barGroup.name = barSpec.name;
  barGroup.id = barSpec.id;
  stage.defaultLayer.add(barGroup);
  barSpec.children.forEach(c => {
    barGroup.add(createRect(c.attribute));
  });

  const barLabel = new RectLabel({
    baseMarkGroupName: barSpec.name,
    data: barSpec.children.map(c => {
      return {
        textType: 'rich',
        text: [
          {
            text: `${[212, 218, 230, 224].includes(c.id) ? '-' : ''}${c.id}`,
            fontWeight: 'bold',
            fontSize: 25,
            fill: '#3f51b5'
          },
          {
            text: '替代方案',
            fontStyle: 'italic',
            textDecoration: 'underline',
            fill: '#3f51b5'
          }
        ],
        fill: 'white',

        stroke: c.attribute.fill,
        lineWidth: 2
      };
    }),
    type: 'rect',
    position: data => {
      return Number(data.text) < 0 ? 'bottom' : 'top';
    },
    syncState: true,
    state: {
      highlight: { opacity: 1 },
      blur: { opacity: 0.2 }
    },
    animation: false,
    overlap: {
      enable: true,
      size: {
        width: 600,
        height: 600
      },
      strategy: [
        {
          type: 'moveY',
          offset: (data: any) => {
            return Number(data?.text) < 0 ? [4, 8, 9, 10, 14, 20, 30] : [-4, -8, -9, -10, -14, -20, -30];
          }
        }
      ]
    },

    zIndex: 302
  });
  stage.defaultLayer.add(barLabel);

  stage.on('click', (e: any) => {
    if (e.target.type === 'rect') {
      const fillColor = e.target.attribute.fill;

      const allRects = stage.findAll(child => {
        return child.type === 'rect';
      }, true);

      allRects.forEach(rect => {
        if (!rect.states) {
          rect.states = {
            highlight: { stroke: 'black' },
            blur: { fillOpacity: 0.2 }
          };
        }

        if (rect.attribute.fill === fillColor) {
          rect.useStates(['highlight']);
        } else {
          rect.useStates(['blur']);
        }
      });
    }
  });
  return { bar: barGroup, label: barLabel };
}

const stage = createRenderer('main');
const { bar, label } = createContent(stage);
stage.render();
// gui
const gui = new GUI();
const guiObject = {
  name: 'Label',
  position: 'top',
  baseMarkVisible: true,
  shapeCount: 100,
  overlap: true,
  debug() {
    label.render();
  }
};
gui.add(guiObject, 'name');
gui.add(guiObject, 'position', ['top', 'inside', 'inside-top', 'inside-bottom']).onChange(value => {
  if (value === 'top') {
    label.setAttribute('position', data => {
      return Number(data.text) < 0 ? 'bottom' : 'top';
    });
  } else {
    label.setAttribute('position', value);
  }
});
gui.add(guiObject, 'baseMarkVisible').onChange(value => {
  bar.forEachChildren(s => s.setAttribute('visible', !!value));
});
gui.add(guiObject, 'overlap').onChange(value => {
  label.setAttribute('overlap', {
    enable: value
  });
});

gui.add(guiObject, 'debug');

const folder = gui.addFolder('strategy');
const obj = {
  insideOrTop: false,
  moveY: true
};

const moveY = { type: 'moveY', offset: [-4, -8, -9, -10] };
const bound = {
  type: 'bound',
  position: (data: any) => {
    return Number(data?.text) < 0 ? ['bottom'] : ['top'];
  }
};
let hasMoveY = true;
let hasBound = false;
folder.add(obj, 'insideOrTop').onChange(v => {
  const strategy = [] as any;
  hasBound = v;
  hasBound && strategy.push(bound);
  hasMoveY && strategy.push(moveY);
  label.setAttribute('overlap', {
    strategy
  });
});
folder.add(obj, 'moveY').onChange(v => {
  const strategy = [] as any;
  hasMoveY = v;
  hasBound && strategy.push(bound);
  hasMoveY && strategy.push(moveY);
  label.setAttribute('overlap', {
    strategy
  });
});
