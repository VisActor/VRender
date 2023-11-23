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
    _uid: 7195,
    type: 'group',
    name: 'bar_4680',
    children: [
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#1664FF',
          stroke: '#1664FF',
          x: 0,
          y: 38,
          x1: 0,
          sizeAttrs: {
            x: 162.3367944,
            y: 38,
            x1: 0,
            height: 20
          },
          width: 162.3367944,
          pickable: true
        },
        _uid: 7196,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#1AC6FF',
          stroke: '#1AC6FF',
          x: 162.3367944,
          y: 38,
          x1: 162.3367944,
          sizeAttrs: {
            x: 287.68091219999997,
            y: 38,
            x1: 162.3367944,
            height: 20
          },
          width: 125.34411779999996,
          pickable: true
        },
        _uid: 7197,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#FF8A00',
          stroke: '#FF8A00',
          x: 287.68091219999997,
          y: 38,
          x1: 287.68091219999997,
          sizeAttrs: {
            x: 413.02502999999996,
            y: 38,
            x1: 287.68091219999997,
            height: 20
          },
          width: 125.34411779999999,
          pickable: true
        },
        _uid: 7198,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#3CC780',
          stroke: '#3CC780',
          x: 413.02502999999996,
          y: 38,
          x1: 413.02502999999996,
          sizeAttrs: {
            x: 575.3618243999999,
            y: 38,
            x1: 413.02502999999996,
            height: 20
          },
          width: 162.33679439999997,
          pickable: true
        },
        _uid: 7199,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#7442D4',
          stroke: '#7442D4',
          x: 575.3618243999999,
          y: 38,
          x1: 575.3618243999999,
          sizeAttrs: {
            x: 637.9341188,
            y: 38,
            x1: 575.3618243999999,
            height: 20
          },
          width: 62.57229440000003,
          pickable: true
        },
        _uid: 7200,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#FFC400',
          stroke: '#FFC400',
          x: 637.9341188,
          y: 38,
          x1: 637.9341188,
          sizeAttrs: {
            x: 700.5064132,
            y: 38,
            x1: 637.9341188,
            height: 20
          },
          width: 62.57229440000003,
          pickable: true
        },
        _uid: 7201,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#1664FF',
          stroke: '#1664FF',
          x: 0,
          y: 102,
          x1: 0,
          sizeAttrs: {
            x: 62.5722944,
            y: 102,
            x1: 0,
            height: 20
          },
          width: 62.5722944,
          pickable: true
        },
        _uid: 7202,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#1AC6FF',
          stroke: '#1AC6FF',
          x: 62.5722944,
          y: 102,
          x1: 62.5722944,
          sizeAttrs: {
            x: 88.1519122,
            y: 102,
            x1: 62.5722944,
            height: 20
          },
          width: 25.5796178,
          pickable: true
        },
        _uid: 7203,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#FF8A00',
          stroke: '#FF8A00',
          x: 88.1519122,
          y: 102,
          x1: 88.1519122,
          sizeAttrs: {
            x: 153.63733,
            y: 102,
            x1: 88.1519122,
            height: 20
          },
          width: 65.4854178,
          pickable: true
        },
        _uid: 7204,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#3CC780',
          stroke: '#3CC780',
          x: 153.63733,
          y: 102,
          x1: 153.63733,
          sizeAttrs: {
            x: 206.23317440000002,
            y: 102,
            x1: 153.63733,
            height: 20
          },
          width: 52.59584440000003,
          pickable: true
        },
        _uid: 7205,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#7442D4',
          stroke: '#7442D4',
          x: 206.23317440000002,
          y: 102,
          x1: 206.23317440000002,
          sizeAttrs: {
            x: 268.80546879999997,
            y: 102,
            x1: 206.23317440000002,
            height: 20
          },
          width: 62.57229439999995,
          pickable: true
        },
        _uid: 7206,
        type: 'rect',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          height: 20,
          fill: '#FFC400',
          stroke: '#FFC400',
          x: 268.80546879999997,
          y: 102,
          x1: 268.80546879999997,
          sizeAttrs: {
            x: 461.0716132,
            y: 102,
            x1: 268.80546879999997,
            height: 20
          },
          width: 192.26614440000003,
          pickable: true
        },
        _uid: 7207,
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
    data: [
      {
        text: 16272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 16272,
          type: 'A'
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#1664FF'
      },
      {
        text: 12564,
        fill: 'rgb(115,125,135)',
        data: {
          population: 12564,
          type: 'A'
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#1AC6FF'
      },
      {
        text: 12564,
        fill: 'rgb(115,125,135)',
        data: {
          population: 12564,
          type: 'A'
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#FF8A00'
      },
      {
        text: 16272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 16272,
          type: 'A'
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#3CC780'
      },
      {
        text: 6272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 6272,
          type: 'A'
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#7442D4'
      },
      {
        text: 6272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 6272,
          type: 'A'
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#FFC400'
      },
      {
        text: 6272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 6272
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#1664FF'
      },
      {
        text: 2564,
        fill: 'rgb(115,125,135)',
        data: {
          population: 2564
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#1AC6FF'
      },
      {
        text: 6564,
        fill: 'rgb(115,125,135)',
        data: {
          population: 6564
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#FF8A00'
      },
      {
        text: 5272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 5272
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#3CC780'
      },
      {
        text: 6272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 6272
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#7442D4'
      },
      {
        text: 19272,
        fill: 'rgb(115,125,135)',
        data: {
          population: 19272
        },
        visible: true,
        x: 0,
        y: 0,
        angle: 0,
        textAlign: 'center',
        lineWidth: 0,
        fontSize: 14,
        lineHeight: 21,
        fontFamily:
          'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
        fontWeight: 'normal',
        fillOpacity: 1,
        stroke: '#FFC400'
      }
    ],
    offset: 0,
    type: 'rect',
    // position: 'inside-top',
    position: datum => {
      // console.log(datum);
      return datum.data.type === 'A' ? 'top-right' : 'bottom-right';
    },
    syncState: true,
    state: {
      highlight: { opacity: 1 },
      blur: { opacity: 0.2 }
    },
    animation: false,
    overlap: {
      size: {
        width: 800,
        height: 600
      }
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

const stage = createRenderer('main', {
  width: 900,
  viewBox: {
    x1: 50,
    y1: 50,
    x2: 850,
    y2: 550
  }
});
const { label } = createContent(stage);
stage.render();
// gui
const gui = new GUI();
const guiObject = {
  name: 'Label',
  overlap: true,
  position: 'default',
  debug() {
    label.render();
  }
};
gui
  .add(guiObject, 'position', [
    'top',
    'inside',
    'bottom',
    'left',
    'right',
    'inside-top',
    'inside-bottom',
    'inside-right',
    'inside-left',

    'top-right',
    'top-left',
    'bottom-right',
    'bottom-left'
  ])
  .onChange(value => {
    label.setAttribute('position', value);
    console.log(value, label);
  });

gui.add(guiObject, 'overlap').onChange(value => {
  label.setAttribute('overlap', false);
});

gui.add(guiObject, 'debug');
