import { GUI } from 'lil-gui';
import { createSymbol, createGroup } from '@visactor/vrender';
import { createRenderer } from '../../util/render';
import { SymbolLabel } from '../../../src';

let shapeCount = 100;
let baseMarkVisible = true;
let overlap = true;
let avoidBaseMark = false;
const colorPools = ['red', 'blue', 'green', 'brown', 'pink', 'beige'];

const symbolGenerator = (count = 100) => {
  const spec: any = {
    attribute: {
      pickable: false,
      zIndex: 300
    },
    id: 740,
    type: 'group',
    name: 'point_159',
    children: []
  };
  for (let i = 0; i < count; i++) {
    spec.children.push({
      attribute: {
        size: 10,
        symbolType: 'circle',
        fillOpacity: 1,
        visible: true,
        x: random(10, 490),
        y: random(10, 490),

        fill: colorPools[i % 5],
        pickable: true,
        zIndex: 300
      },
      id: `${i}`,
      type: 'symbol'
    });
  }
  return spec;
};
const stage = createRenderer('main');
let { symbol, label } = createContent(stage);
stage.render();
// gui
const gui = new GUI();
const guiObject = {
  name: 'Label',
  baseMarkVisible,
  shapeCount,
  overlap,
  avoidBaseMark,
  randomData() {
    stage.defaultLayer.removeChild(symbol);
    stage.defaultLayer.removeChild(label);

    const shape = createContent(stage);
    symbol = shape.symbol;
    label = shape.label;

    stage.render();
  },
  debug() {
    label.render();
  }
};
gui.add(guiObject, 'name');
gui.add(guiObject, 'shapeCount', 10, 10000, 1000).onChange(value => {
  stage.defaultLayer.removeChild(symbol);
  stage.defaultLayer.removeChild(label);
  shapeCount = value;
  const shape = createContent(stage);
  symbol = shape.symbol;
  label = shape.label;
  stage.render();
});

gui.add(guiObject, 'baseMarkVisible').onChange(value => {
  baseMarkVisible = value;
  symbol.forEachChildren(s =>
    s.setAttributes({
      // visible: !!value,
      size: value ? s.attribute.size : 2
    })
  );
});
gui.add(guiObject, 'overlap').onChange(value => {
  overlap = value;
  label.setAttribute('overlap', {
    enable: value
  });
});

gui.add(guiObject, 'avoidBaseMark').onChange(value => {
  avoidBaseMark = value;
  label.setAttribute('overlap', {
    avoidBaseMark: value
  });
});
gui.add(guiObject, 'randomData');
gui.add(guiObject, 'debug');
function random(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

function createContent(stage: Stage) {
  const symbolSpec = symbolGenerator(shapeCount);
  const symbolGroup = createGroup(symbolSpec.attribute);
  symbolGroup.name = symbolSpec.name;
  symbolGroup.id = symbolSpec.id;
  stage.defaultLayer.add(symbolGroup);
  symbolSpec.children.forEach(c => {
    symbolGroup.add(createSymbol({ ...c.attribute, visible: baseMarkVisible }));
  });

  const symbolLabel = new SymbolLabel({
    baseMarkGroupName: symbolSpec.name,
    data: symbolSpec.children.map(c => {
      return {
        text: `${c.id}`,
        x: c.attribute.x,
        y: c.attribute.y,
        fill: c.attribute.fill
      };
    }),
    type: 'symbol',
    animation: false,
    overlap: {
      avoidBaseMark,
      overlapPadding: 10,
      size: { width: 500, height: 500 },
      strategy: [
        {
          type: 'position'
        },
        {
          type: 'moveY',
          offset: [-20]
        },
        {
          type: 'moveY',
          offset: [20]
        }
      ]
    },

    zIndex: 301
  });
  symbolLabel.onAfterLabelOverlap = (bitmap: any) => {
    stage.setAfterRender(() => {
      const dpr = stage.dpr;
      const imageData = bitmap.toImageData(stage.window.getContext().getContext(), 50, 50, dpr);
      const layoutCanvas = document.getElementById('layout') as HTMLCanvasElement;
      const chartCanvas = document.getElementById('main') as HTMLCanvasElement;
      layoutCanvas.getContext('2d')?.putImageData(imageData, 50, 50);
      layoutCanvas.style.top = `${chartCanvas.getBoundingClientRect().y}px`;
      layoutCanvas.style.left = `${chartCanvas.getBoundingClientRect().x}px`;
      layoutCanvas.style.visibility = `visible`;
    });
  };
  stage.defaultLayer.add(symbolLabel);
  return { symbol: symbolGroup, label: symbolLabel };
}
