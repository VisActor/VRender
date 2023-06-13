import {
  loadFeishuContributions,
  createStage,
  Stage,
  createCircle,
  createGroup,
  createText,
  createRect
} from '@visactor/vrender';

loadFeishuContributions();

export const page = () => {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.width = '100px';
  div.style.height = '100px';
  div.style.top = '30px';
  div.style.left = '200px';
  div.style.border = '4px solid #000';
  document.body.appendChild(div);
  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    background: 'yellow'
    // viewBox: {
    //   x1: 100,
    //   y1: 100,
    //   x2: 1100,
    //   y2: 500
    // }
  });
  stage.name = 'stage';

  // tableGroup
  const tableGroup = createGroup({
    x: 10,
    y: 10,
    width: 800,
    height: 300,
    stroke: '#000',
    lineWidth: 2
  });
  tableGroup.name = 'tableGroup';

  const headerGroup = createGroup({
    x: 0,
    y: 0,
    width: 800,
    height: 50,
    stroke: '#000',
    lineWidth: 2
  });
  headerGroup.name = 'headerGroup';

  tableGroup.add(headerGroup);

  const bodyGroup = createGroup({
    x: 0,
    y: 50,
    width: 800,
    height: 250,
    stroke: '#000',
    lineWidth: 2
  });
  bodyGroup.name = 'bodyGroup';

  for (let i = 0; i < 5; i++) {
    const columnGroup = createGroup({
      x: i * 160,
      y: 0,
      width: 160,
      height: 250,
      stroke: '#000',
      lineWidth: 2
    });
    columnGroup.name = 'columnGroup';
    columnGroup.id = `columnGroup-${i}`;
    for (let j = 0; j < 5; j++) {
      const cellGroup = createGroup({
        x: 0,
        y: j * 50,
        width: 160,
        height: 50,
        stroke: '#000',
        lineWidth: 2,
        pickable: true,
        childrenPickable: i === 2
      });
      cellGroup.id = `cell_${i}_${j}`;
      cellGroup.name = 'cellGroup';
      const text = createText({
        x: 80,
        y: 25,
        text: `cell_${i}_${j}`,
        textAlign: 'center',
        textBaseline: 'middle',
        fill: 'red'
      });
      text.name = 'cellText';
      text.id = `cellText_${i}_${j}`;
      cellGroup.add(text);
      columnGroup.add(cellGroup);
    }
    bodyGroup.add(columnGroup);
  }
  tableGroup.add(bodyGroup);

  stage.defaultLayer.add(tableGroup);

  stage.render();

  tableGroup.addEventListener('pointerdown', e => {
    console.log('target', e.target);
    console.log('currentTarget', e.currentTarget);
    console.log('path', e.path);
  });

  stage.on('pointermove', () => {
    console.log('stage pointermove');
  });
  stage.on('pointerleave', () => {
    console.log('stage pointerleave');
  });

  stage.on('pointerupoutside', () => {
    console.log('stage pointerupoutside');
  });

  window['stage'] = stage;
};
