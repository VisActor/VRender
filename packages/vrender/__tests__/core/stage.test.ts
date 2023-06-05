/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createStage, createGroup, createText } from '../../src/index';

describe('stage', () => {
  let stage;

  afterEach(() => {
    stage.release();
  });

  it('resize', () => {
    stage = createStage({
      width: 100,
      height: 100
    });
    stage.resize(200, 200);
    expect(stage.width).toEqual(200);
    expect(stage.height).toEqual(200);
    expect(stage.viewWidth).toEqual(200);
    expect(stage.viewHeight).toEqual(200);

    stage = createStage({
      width: 100,
      height: 100,
      viewBox: { x1: 0, y1: 0, x2: 100, y2: 100 }
    });
    stage.resize(300, 300);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(300);
    expect(stage.viewHeight).toEqual(300);

    stage = createStage({
      width: 100,
      height: 100,
      viewBox: { x1: 0, y1: 0, x2: 60, y2: 60 }
    });
    stage.resize(300, 300);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(60);
    expect(stage.viewHeight).toEqual(60);
    stage.resizeView(200, 200);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(200);
    expect(stage.viewHeight).toEqual(200);
    stage.setViewBox(50, 50, 100, 100);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(100);
    expect(stage.viewHeight).toEqual(100);
  });

  it('pick', () => {
    const stage = createStage({
      width: 1200,
      height: 600,
      background: 'yellow',
      viewBox: {
        x1: 100,
        y1: 100,
        x2: 1100,
        y2: 500
      }
    });
    stage.name = 'stage';

    // tableGroup
    const tableGroup = createGroup({
      x: 10,
      y: 10,
      width: 800,
      height: 300,
      strokeColor: '#000',
      lineWidth: 2
    });
    tableGroup.name = 'tableGroup';

    const headerGroup = createGroup({
      x: 0,
      y: 0,
      width: 800,
      height: 50,
      strokeColor: '#000',
      lineWidth: 2
    });
    headerGroup.name = 'headerGroup';

    tableGroup.add(headerGroup);

    const bodyGroup = createGroup({
      x: 0,
      y: 50,
      width: 800,
      height: 250,
      strokeColor: '#000',
      lineWidth: 2
    });
    bodyGroup.name = 'bodyGroup';

    for (let i = 0; i < 5; i++) {
      const columnGroup = createGroup({
        x: i * 160,
        y: 0,
        width: 160,
        height: 250,
        strokeColor: '#000',
        lineWidth: 2
      });
      columnGroup.name = 'columnGroup';
      for (let j = 0; j < 5; j++) {
        const cellGroup = createGroup({
          x: 0,
          y: j * 50,
          width: 160,
          height: 50,
          strokeColor: '#000',
          lineWidth: 2,
          pickable: true,
          childrenPickable: i === 2
        });
        cellGroup.name = `cell_${i}_${j}`;
        const text = createText({
          x: 80,
          y: 25,
          text: `cell_${i}_${j}`,
          textAlign: 'center',
          textBaseline: 'middle',
          fillColor: 'red'
        });
        cellGroup.add(text);
        columnGroup.add(cellGroup);
      }
      bodyGroup.add(columnGroup);
    }
    tableGroup.add(bodyGroup);

    stage.defaultLayer.add(tableGroup);

    stage.render();

    const pick1 = stage.pick(510, 185);
    expect(pick1.graphic).toBeDefined();

    const pick2 = stage.pick(350, 185);
    expect(pick2.group).toBeDefined();
    expect(pick2.graphic).toBeNull();
  });
});
