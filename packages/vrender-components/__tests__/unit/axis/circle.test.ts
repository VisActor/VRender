import { BandScale } from '@visactor/vscale';
import type { IGraphic, Stage, Group, Circle, Text } from '@visactor/vrender-core';
import { CircleAxis, CircleAxisGrid } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import type { Tag } from '../../../src/tag/tag';
import { AXIS_ELEMENT_NAME } from '../../../src/axis/constant';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('Circle Axis', () => {
  let stage: Stage;
  let axis: CircleAxis;
  let grid: CircleAxisGrid;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');

    const domain = 'ABCDEFGH'.split('');
    const scale = new BandScale().domain(domain).range([0, 1]);
    const items = domain.map(value => {
      return {
        id: value,
        label: value,
        value: scale.scale(value),
        rawValue: value
      };
    });
    axis = new CircleAxis({
      center: {
        x: 250,
        y: 250
      },
      radius: 200,
      innerRadius: 0,
      items: [items],
      subTick: {
        visible: true,
        length: 5
      },
      title: {
        visible: true,
        text: '我是标题'
      }
    });
    grid = new CircleAxisGrid({
      center: {
        x: 250,
        y: 250
      },
      radius: 200,
      innerRadius: 0,
      items,
      alternateColor: ['pink', 'purple'],
      smoothLink: true,
      subGrid: {
        visible: true,
        alternateColor: 'yellow'
      }
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
  });

  afterAll(() => {
    stage.release();
  });

  it('should be render correctly.', () => {
    // line
    const axisLine = axis.getElementsByName(AXIS_ELEMENT_NAME.line)[0] as Circle;
    // @ts-ignore
    expect(axisLine.attribute.innerRadius).toBe(0);
    expect(axisLine.attribute.radius).toBe(200);
    // label
    const axisLabels = axis.getElementsByName(`${AXIS_ELEMENT_NAME.labelContainer}-layer-0`)[0] as unknown as Group;
    expect(axisLabels.childrenCount).toBe(8);
    expect((axisLabels.children[1] as unknown as Text).attribute.textAlign).toBe('left');
    expect((axisLabels.children[1] as unknown as Text).attribute.textBaseline).toBe('bottom');
    expect((axisLabels.children[5] as unknown as Text).attribute.textAlign).toBe('right');
    expect((axisLabels.children[5] as unknown as Text).attribute.textBaseline).toBe('top');

    // tick & subTick
    const tickLineGroup = axis.getElementsByName(AXIS_ELEMENT_NAME.tickContainer)[0] as unknown as Group;
    expect(tickLineGroup.children.filter(child => child.name === AXIS_ELEMENT_NAME.tick)).toHaveLength(8);
    expect(tickLineGroup.children.filter(child => child.name === AXIS_ELEMENT_NAME.subTick)).toHaveLength(32);

    // grid
    const gridLineGroup = stage.getElementsByName('axis-grid')[0];
    expect(gridLineGroup).toBeDefined();
    expect(grid.getElementsByName('axis-grid-line').length).toBe(9);

    // subGrid
    const subGridLines = grid.getElementsByName('axis-grid-sub-line');
    // expect(subGridLineGroup).toBeDefined();
    expect(subGridLines.length).toBe(41);

    // title
    const axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.x).toBe(250);
    expect(axisTitle.attribute.y).toBe(475);
  });

  it('when innerRadius be set, should render correctly', () => {
    axis.setAttribute('innerRadius', 50);

    const axisLine = axis.getElementsByName(AXIS_ELEMENT_NAME.line)[0] as Circle;
    // @ts-ignore
    expect(axisLine.attribute.innerRadius).toBe(50);
    // title 默认展示在中间
    const axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.x).toBe(250);
    expect(axisTitle.attribute.y).toBe(250);
  });

  it('set title position to be start', () => {
    axis.setAttribute('title', { position: 'start' });
    // title 默认展示在中间
    const axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.x).toBe(250);
    expect(axisTitle.attribute.y).toBe(25);
  });
});
