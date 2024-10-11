import { PointScale, LinearScale } from '@visactor/vscale';
import type { IGraphic, Stage, Group, ILine, Text, IGroup, IText } from '@visactor/vrender-core';
import { LineAxis, LineAxisGrid, Segment } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { AXIS_ELEMENT_NAME } from '../../../src/axis/constant';
import { Tag } from './../../../src/tag/tag';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('Line Axis', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  it('horizontal direction.', () => {
    const domain = 'ABCDEFGH'.split('');
    const scale = new PointScale().domain(domain).range([0, 1]);
    const items = domain.map(value => {
      return {
        id: value,
        label: value,
        value: scale.scale(value),
        rawValue: value
      };
    });
    const axis = new LineAxis({
      start: { x: 100, y: 100 },
      end: { x: 500, y: 100 },
      items: [items],
      line: {
        startSymbol: {
          visible: true
        },
        endSymbol: {
          visible: true
        }
      },
      tick: {
        visible: true,
        length: 20,
        style: (datum, index) => {
          if (index === 0) {
            return {
              stroke: 'red',
              lineWidth: 2
            };
          }
        }
      },
      subTick: {
        visible: true,
        count: 3,
        length: 8,
        style: (datum, index) => {
          if (index === 3) {
            return {
              stroke: 'red',
              lineWidth: 2
            };
          }
        }
      },
      label: {
        visible: true,
        formatMethod: (text, datum, index) => {
          if (index === 0) {
            return `${text}---`;
          }
          return text;
        },
        style: (value, index) => {
          if (index === 0) {
            return {
              fill: 'red'
            };
          }
        }
      }
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();
    const lineShape = axis.getElementsByName(AXIS_ELEMENT_NAME.line)[0] as unknown as Segment;
    expect(lineShape).toBeInstanceOf(Segment);
    expect(lineShape.childrenCount).toBe(3);

    const tickLineGroup = axis.getElementsByName(AXIS_ELEMENT_NAME.tickContainer)[0] as unknown as Group;

    expect(tickLineGroup.childrenCount).toBe(29);
    const tickLine = tickLineGroup.children.filter(child => child.name === AXIS_ELEMENT_NAME.tick);
    expect(tickLine.length).toBe(8);
    expect((tickLine[0] as unknown as ILine).attribute.stroke).toBe('red');
    expect((tickLine[0] as unknown as ILine).attribute.points).toEqual([
      { x: 100, y: 100 },
      { x: 100, y: 120 }
    ]);

    const subTickLine = tickLineGroup.children.filter(child => child.name === AXIS_ELEMENT_NAME.subTick);
    expect(subTickLine.length).toBe(21);
    expect((subTickLine[0] as unknown as ILine).attribute.stroke).toBe('#999');
    expect((subTickLine[0] as unknown as ILine).attribute.points).toEqual([
      { x: 114.28571428571428, y: 100 },
      { x: 114.28571428571428, y: 108 }
    ]);

    const axisLabels = axis.getElementsByName(`${AXIS_ELEMENT_NAME.labelContainer}-layer-0`)[0] as unknown as Group;
    expect(axisLabels.childrenCount).toBe(8);
    expect((axisLabels.children[0] as unknown as Text).attribute.x).toBe(100);
    expect((axisLabels.children[0] as unknown as Text).attribute.y).toBe(124);
    expect((axisLabels.children[0] as unknown as Text).attribute.textAlign).toBe('center');
    expect((axisLabels.children[0] as unknown as Text).attribute.textBaseline).toBe('top');
    expect((axisLabels.children[0] as unknown as Text).attribute.text).toBe('A---');
    expect((axisLabels.children[0] as unknown as Text).AABBBounds.width()).toBeCloseTo(29.663970947265625);
  });

  it('vertical direction.', () => {
    const domain = 'ABCDEFGH'.split('');
    const scale = new PointScale().domain(domain).range([0, 1]);
    const items = domain.map(value => {
      return {
        id: value,
        label: value,
        value: scale.scale(value),
        rawValue: value
      };
    });
    const axis = new LineAxis({
      start: { x: 100, y: 200 },
      end: { x: 100, y: 450 },
      items: [items],
      line: {
        startSymbol: {
          visible: true
        },
        endSymbol: {
          visible: true
        }
      },
      tick: {
        visible: true,
        length: 20,
        style: {
          stroke: 'red'
        }
      },
      subTick: {
        visible: true,
        count: 3,
        length: 8,
        style: {
          stroke: 'blue'
        }
      },
      label: {
        visible: true,
        formatMethod: (text, datum, index) => {
          if (index === 0) {
            return `${text}---`;
          }
          return text;
        }
      }
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();

    const tickLineGroup = axis.getElementsByName(AXIS_ELEMENT_NAME.tickContainer)[0] as unknown as Group;
    expect(tickLineGroup.childrenCount).toBe(29);
    const tickLine = tickLineGroup.children.filter(child => child.name === AXIS_ELEMENT_NAME.tick);
    expect((tickLine[0] as unknown as ILine).attribute.points).toEqual([
      { x: 100, y: 200 },
      { x: 80, y: 200 }
    ]);

    const subTickLine = tickLineGroup.children.filter(child => child.name === AXIS_ELEMENT_NAME.subTick);
    expect((subTickLine[0] as unknown as ILine).attribute.points).toEqual([
      { x: 100, y: 208.92857142857142 },
      { x: 92, y: 208.92857142857142 }
    ]);

    const axisLabels = axis.getElementsByName(`${AXIS_ELEMENT_NAME.labelContainer}-layer-0`)[0] as unknown as Group;
    expect(axisLabels.childrenCount).toBe(8);
    expect((axisLabels.children[0] as unknown as Text).attribute.x).toBe(76);
    expect((axisLabels.children[0] as unknown as Text).attribute.y).toBe(200);
    expect((axisLabels.children[0] as unknown as Text).attribute.text).toBe('A---');
    expect((axisLabels.children[0] as unknown as Text).attribute.textAlign).toBe('end');
    expect((axisLabels.children[0] as unknown as Text).attribute.textBaseline).toBe('middle');
    expect((axisLabels.children[0] as unknown as Text).AABBBounds.width()).toBeCloseTo(29.663970947265625);
  });

  it('Line Axis with Title', () => {
    const scale = new LinearScale().domain([0, 100]).range([0, 1]).nice();
    const items = scale.ticks(10).map(tick => {
      return {
        id: tick,
        label: tick,
        value: scale.scale(tick),
        rawValue: tick
      };
    });
    const axis = new LineAxis({
      start: { x: 100, y: 250 },
      end: { x: 400, y: 500 },
      items: [items],
      title: {
        visible: true,
        text: 'Title'
      },
      label: {
        visible: true
      }
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();

    let axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle).toBeInstanceOf(Tag);
    expect(axisTitle.attribute.x).toBeCloseTo(230.01857069132552);
    expect(axisTitle.attribute.y).toBeCloseTo(398.9777151704094);
    expect(axisTitle.attribute.angle).toBeCloseTo(0.6947382761967031);

    // 将 title 位置更新至 start
    axis.setAttribute('title', { position: 'start' });
    axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.x).toBeCloseTo(80.01857069132552);
    expect(axisTitle.attribute.y).toBeCloseTo(273.9777151704094);
    expect(axisTitle.attribute.angle).toBeCloseTo(0.6947382761967031);

    // 将 title 位置更新至 end
    axis.setAttribute('title', { position: 'end' });
    axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.x).toBeCloseTo(380.0185706913255);
    expect(axisTitle.attribute.y).toBeCloseTo(523.9777151704094);
    expect(axisTitle.attribute.angle).toBeCloseTo(0.6947382761967031);

    // title 不跟随旋转
    axis.setAttribute('title', { autoRotate: false });
    axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.angle).toBe(undefined);

    // title 设置背景、超长省略
    axis.setAttribute('title', {
      autoRotate: true,
      panel: {
        visible: true,
        fill: 'rgba(0, 0, 0, 0.3)'
      },
      padding: 4,
      maxWidth: 60,
      text: '我是一个坐标轴标题'
    });
    axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.x).toBeCloseTo(380.0185706913255);
    expect(axisTitle.attribute.y).toBeCloseTo(523.9777151704094);
    expect(axisTitle.attribute.angle).toBeCloseTo(0.6947382761967031);
    expect(axisTitle.getElementsByName('tag-panel')).toBeDefined();

    expect(axis.getPrevInnerView()).not.toBeNull();
    expect(Object.keys(axis.getPrevInnerView()).length).toBe(23);
  });

  it('Line Axis with Gird, and tick.alignWithLabel set false', () => {
    const scale = new LinearScale().domain([0, 100]).range([0, 1]).nice();
    const items = scale.ticks(10).map(tick => {
      return {
        id: tick,
        label: tick,
        value: scale.scale(tick),
        rawValue: tick
      };
    });
    const axis = new LineAxis({
      start: { x: 100, y: 150 },
      end: { x: 200, y: 350 },
      items: [items],
      label: {
        visible: true
      },
      tick: {
        visible: true,
        alignWithLabel: false
      }
    });
    const grid = new LineAxisGrid({
      start: { x: 100, y: 150 },
      end: { x: 200, y: 350 },
      items,
      visible: true,
      type: 'line',
      length: 150,
      alternateColor: '#ccc',
      style: (datum, index) => {
        if (index === 1) {
          return {
            stroke: 'red',
            lineWidth: 3,
            lineDash: [4, 4]
          };
        }
        return {
          lineDash: [4, 4]
        };
      },
      subGrid: {
        visible: true,
        style: {
          stroke: 'red'
        }
      }
    });

    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();

    const axisLabels = axis.getElementsByName(`${AXIS_ELEMENT_NAME.labelContainer}-layer-0`)[0] as unknown as Group;
    expect(axisLabels.childrenCount).toBe(11);

    // 验证 tick 是否渲染正确
    const tickLineGroup = axis.getElementsByName(AXIS_ELEMENT_NAME.tickContainer)[0] as unknown as Group;
    expect(tickLineGroup.childrenCount).toBe(10);
    const tickLine = tickLineGroup.children.filter(child => child.name === AXIS_ELEMENT_NAME.tick);
    expect(tickLine.length).toBe(10);
    // @ts-ignore
    expect(tickLine[0].attribute.points[0]).toEqual({
      // @ts-ignore
      x: (axis.data[0].point.x + axis.data[1].point.x) / 2,
      // @ts-ignore
      y: (axis.data[0].point.y + axis.data[1].point.y) / 2
    });

    // 验证 grid 是否渲染正确
    let gridLineGroup = stage.getElementsByName('axis-grid')[0];
    expect(gridLineGroup).toBeDefined();
    expect(gridLineGroup.getElementsByName('axis-grid-line').length).toBe(11);
    // @ts-ignore
    expect(gridLineGroup.data[0]).toEqual({
      id: 0,
      label: 0,
      point: {
        x: 100,
        y: 150
      },
      rawValue: 0,
      value: 0
    });

    // 验证 subGrid 是否渲染正确
    let subGridLines = grid.getElementsByName('axis-grid-sub-line');
    // expect(subGridLineGroup).toBeDefined();
    expect(subGridLines.length).toBe(51);
    // // @ts-ignore
    // expect(subGridLineGroup.attribute.items[0]).toEqual({
    //   id: 'sub-0-0',
    //   points: [
    //     { x: 100, y: 150 },
    //     { x: 234.1640786499874, y: 82.9179606750063 }
    //   ],
    //   datum: {}
    // });

    // polygon 类型 grid
    grid.setAttributes({
      start: { x: 250, y: 350 },
      end: { x: 450, y: 350 },
      // tick: {
      //   visible: true,
      //   alignWithLabel: true
      // },
      // grid: {
      // visible: true,
      type: 'polygon',
      center: { x: 250, y: 350 },
      closed: true,
      sides: 3,
      startAngle: 0,
      endAngle: Math.PI * 2
      // }
    });

    gridLineGroup = stage.getElementsByName('axis-grid')[0];
    // @ts-ignore
    expect(gridLineGroup.data[0]).toEqual({
      id: 0,
      label: 0,
      point: {
        x: 250,
        y: 350
      },
      rawValue: 0,
      value: 0
    });
    // @ts-ignore
    expect(gridLineGroup.data[1]).toEqual({
      id: 10,
      label: 10,
      point: {
        x: 270,
        y: 350
      },
      rawValue: 10,
      value: 0.1
    });
    subGridLines = stage.getElementsByName('axis-grid-sub-line');
    expect(subGridLines.length).toBe(51);
    // @ts-ignore
    // expect(subGridLineGroup.attribute.items[0]).toEqual({
    //   id: 'sub-0-0',
    //   points: [
    //     { x: 250, y: 350 },
    //     { x: 250, y: 350 },
    //     { x: 250, y: 350 }
    //   ],
    //   datum: {}
    // });

    // circle 类型 grid
    grid.setAttributes({
      type: 'circle',
      center: { x: 240, y: 350 },
      alternateColor: undefined,
      sides: 2
    });

    gridLineGroup = stage.getElementsByName('axis-grid')[0];
    // @ts-ignore
    expect(gridLineGroup.data[0]).toEqual({
      id: 0,
      label: 0,
      point: {
        x: 250,
        y: 350
      },
      rawValue: 0,
      value: 0
    });
    // @ts-ignore
    expect(gridLineGroup.data[1]).toEqual({
      id: 10,
      label: 10,
      point: {
        x: 270,
        y: 350
      },
      rawValue: 10,
      value: 0.1
    });

    subGridLines = grid.getElementsByName('axis-grid-sub-line');
    expect(subGridLines.length).toBe(51);

    expect(grid.getPrevInnerView()).not.toBeNull();
    expect(Object.keys(grid.getPrevInnerView()).length).toBe(122);
  });

  it('Vertical Line Axis with Title', () => {
    const axis = new LineAxis({
      title: {
        space: 20,
        padding: 0,
        textStyle: {
          fontSize: 11,
          fill: 'rgb(169,174,184)',
          fontWeight: 'normal',
          fillOpacity: 1,
          textAlign: 'left',
          textBaseline: 'bottom',
          angle: 3.141592653589793,
          text: 'DAU'
        },
        visible: true,
        autoRotate: false,
        shape: {},
        background: {},
        text: 'y'
      },
      label: {
        visible: true,
        inside: false,
        space: 20,
        style: {
          fontSize: 14,
          fill: '#89909D',
          fontWeight: 'normal',
          fillOpacity: 1,
          textAlign: 'left'
        },
        autoRotate: false,
        autoHide: false,
        autoLimit: false
      },
      tick: {
        visible: false,
        inside: false,
        alignWithLabel: true,
        length: 4,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      subTick: {
        visible: false,
        inside: false,
        count: 4,
        length: 2,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      line: {
        visible: false,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      x: 151,
      y: 12,
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 102.25
      },
      items: [
        [
          {
            id: '0',
            label: '0',
            value: 0.9149881024361075,
            rawValue: 0
          },
          {
            id: '200000000',
            label: '200000000',
            value: 0.6876642054066237,
            rawValue: 200000000
          },
          {
            id: '400000000',
            label: '400000000',
            value: 0.46034030837713946,
            rawValue: 400000000
          },
          {
            id: '600000000',
            label: '600000000',
            value: 0.23301641134765558,
            rawValue: 600000000
          },
          {
            id: '800000000',
            label: '800000000',
            value: 0.0056925143181715265,
            rawValue: 800000000
          }
        ]
      ],
      visible: true,
      pickable: true,
      orient: 'left',

      verticalFactor: 1,
      verticalLimitSize: 139
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();

    const axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.x).toBe(-40);
  });

  it('Horizontal Line Axis with no labels', () => {
    const axis = new LineAxis({
      title: {
        space: 20,
        padding: 0,
        textStyle: {
          fontSize: 14,
          fill: '#333',
          fontWeight: 'bold',
          fillOpacity: 1,
          fontFamily: 'PingFang SC'
        },
        visible: true,
        autoRotate: false,
        shape: {},
        background: {},

        text: 'date',
        maxWidth: 331
      },
      label: {
        visible: true,
        inside: false,
        space: 8,
        style: {
          fontSize: 14,
          fill: '#505050',
          fontWeight: 'normal',
          fillOpacity: 1,
          fontFamily: 'PingFang SC',
          angle: -1.0471975511965976,
          textAlign: 'end',
          textBaseline: 'middle'
        },
        autoRotate: false,
        autoHide: false,
        autoLimit: false
      },
      tick: {
        visible: false,
        inside: false,
        alignWithLabel: true,
        length: 4,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      subTick: {
        visible: false,
        inside: false,
        count: 4,
        length: 2,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      line: {
        visible: true,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      x: 121,
      y: 423,
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 331,
        y: 0
      },
      items: [[]],
      visible: true,
      pickable: true,
      orient: 'bottom',
      verticalFactor: 1,
      verticalLimitSize: 150
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();
    const axisTitle = axis.getElementsByName(AXIS_ELEMENT_NAME.title)[0] as unknown as Tag;
    expect(axisTitle.attribute.y).toBe(28);
    expect(axisTitle.attribute.x).toBe(165.5);
  });

  it('should set the correct textAlign and textBaseline when set label angle', () => {
    const axis = new LineAxis({
      title: {
        space: 10,
        padding: 0,
        textStyle: {
          fontSize: 14,
          fill: '#333333',
          fontWeight: 'normal',
          fillOpacity: 1
        },
        visible: true,
        autoRotate: false,
        shape: {},
        background: {},
        text: '标题',
        maxWidth: 400,
        pickable: false,
        childrenPickable: false
      },
      label: {
        visible: true,
        inside: false,
        space: 10,
        autoRotate: true,
        style: {
          fontSize: 14,
          fill: '#89909D',
          fontWeight: 'normal',
          fillOpacity: 1,
          angle: -Math.PI * 0.25
        },
        state: {
          hover_reverse: {
            fill: 'red'
          },
          selected_reverse: {
            fill: 'red'
          }
        },
        // autoHide: true,
        autoLimit: true
      },
      tick: {
        visible: true,
        inside: false,
        alignWithLabel: true,
        length: 4,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      subTick: {
        visible: false,
        inside: false,
        count: 4,
        length: 2,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      line: {
        visible: true,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      x: 50,
      y: 436,
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 200,
        y: 0
      },
      items: [
        [
          {
            id: '1990',
            label: '1990',
            value: 0.11538461538461535,
            rawValue: '1990'
          },
          {
            id: '1995',
            label: '1995',
            value: 0.2692307692307692,
            rawValue: '1995'
          },
          {
            id: '2000',
            label: '2000',
            value: 0.423076923076923,
            rawValue: '2000'
          },
          {
            id: '2005',
            label: '2005',
            value: 0.5769230769230768,
            rawValue: '2005'
          },
          {
            id: '2010',
            label: '2010',
            value: 0.7307692307692307,
            rawValue: '2010'
          },
          {
            id: '2015',
            label: '2015',
            value: 0.8846153846153845,
            rawValue: '2015'
          }
        ]
      ],
      visible: true,
      pickable: true,
      orient: 'bottom',
      select: true,
      hover: true,
      panel: {
        visible: true,
        style: {
          fillOpacity: 0
        },
        state: {
          hover: {
            fillOpacity: 0.65,
            fill: '#DDE3E9',
            cursor: 'pointer'
          },
          selected: {
            fillOpacity: 0.65,
            fill: '#9CCBDB',
            cursor: 'pointer'
          }
        }
      },
      verticalFactor: 1,
      verticalLimitSize: 150
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();

    expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('right');

    axis.setAttribute('label', {
      style: {
        angle: Math.PI * 0.25
      }
    });
    expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('left');

    axis.setAttribute('label', {
      style: {
        angle: Math.PI * 0.5
      }
    });
    expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('left');
  });

  describe("test axis label's containerAlign", () => {
    const domain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const pointScale = new PointScale().domain(domain).range([0, 1]);
    const xItems = domain.map(value => {
      return {
        id: value,
        label: value,
        value: pointScale.scale(value),
        rawValue: value
      };
    });

    it("should work in `orient: 'left'` axis", () => {
      const axis = new LineAxis({
        start: { x: 150, y: 150 },
        end: { x: 150, y: 350 },
        items: [xItems],
        title: {
          visible: true,
          position: 'middle',
          autoRotate: true,
          padding: 4,
          maxWidth: 100,
          text: 'y 轴 -- left',
          space: 0
        },
        tick: {
          visible: true,
          length: 10
        },
        label: {
          visible: true,
          autoRotate: false,
          autoRotateAngle: [0, 45, 90],
          autoHide: true,
          autoLimit: true,
          containerAlign: 'left'
          // formatMethod: () => 'AAAAAAAAAAAAAA'
        },
        orient: 'left',
        verticalLimitSize: 300,
        verticalMinSize: 100,
        panel: {
          visible: true,
          style: {
            stroke: 'red'
          }
        }
      });
      stage.defaultLayer.add(axis as unknown as IGraphic);
      stage.render();
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('right');
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.x).toBe(
        (axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x2
      );

      axis.setAttribute('label', { containerAlign: 'center' });
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('right');
      expect(
        (axis.getElementsByName('axis-label')[0] as IText).attribute.x +
          (axis.getElementsByName('axis-label')[0] as IText).attribute.dx -
          (axis.getElementsByName('axis-label')[0] as IText).AABBBounds.width() / 2
      ).toBeCloseTo(
        ((axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x1 +
          (axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x2) *
          0.5
      );

      axis.setAttribute('label', { containerAlign: 'right' });
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('right');
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.x).toBe(
        (axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x2
      );

      axis.setAttributes({
        label: {
          visible: true,
          containerAlign: 'left'
        },
        verticalMinSize: null
      });
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('right');
      expect(
        (axis.getElementsByName('axis-label')[0] as IText).attribute.x +
          (axis.getElementsByName('axis-label')[0] as IText).attribute.dx -
          (axis.getElementsByName('axis-label')[0] as IText).AABBBounds.width()
      ).toBeCloseTo((axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x1);
      expect((axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.width()).toBeCloseTo(
        11.16
      );
    });

    it("should work in `orient: 'right'` axis", () => {
      const axis = new LineAxis({
        start: { x: 350, y: 150 },
        end: { x: 350, y: 350 },
        items: [xItems],
        title: {
          visible: true,
          position: 'middle',
          autoRotate: true,
          padding: 10,
          maxWidth: 100,
          text: 'y 轴 -- Right',
          space: 0
        },
        tick: {
          visible: true,
          length: 10
        },
        label: {
          visible: true,
          autoRotate: false,
          autoRotateAngle: [0, 45, 90],
          autoHide: true,
          autoLimit: true,
          containerAlign: 'left',
          formatMethod: (value, datum, index, data) => {
            if (value === 'Y') {
              return 'AAAAAAAAAAAAAA';
            }
            return value;
          }
        },
        orient: 'right',
        verticalLimitSize: 130,
        verticalMinSize: 100,
        verticalFactor: -1,
        panel: {
          visible: true,
          style: {
            stroke: 'red'
          }
        }
      });
      stage.defaultLayer.add(axis as unknown as IGraphic);
      stage.render();

      expect(axis.AABBBounds.width()).toBeGreaterThan(100);
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('left');
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.x).toBe(
        (axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x1
      );

      axis.setAttribute('label', { containerAlign: 'center' });
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('left');
      expect(
        (axis.getElementsByName('axis-label')[0] as IText).attribute.x +
          (axis.getElementsByName('axis-label')[0] as IText).attribute.dx +
          (axis.getElementsByName('axis-label')[0] as IText).AABBBounds.width() / 2
      ).toBe(
        ((axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x1 +
          (axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x2) *
          0.5
      );

      axis.setAttribute('label', { containerAlign: 'right' });
      expect((axis.getElementsByName('axis-label')[0] as IText).attribute.textAlign).toBe('left');
      expect(
        (axis.getElementsByName('axis-label')[0] as IText).attribute.x +
          (axis.getElementsByName('axis-label')[0] as IText).attribute.dx +
          (axis.getElementsByName('axis-label')[0] as IText).AABBBounds.width()
      ).toBeCloseTo((axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup).AABBBounds.x2);

      axis.setAttribute('verticalMinSize', 400);
      expect(axis.AABBBounds.width()).toBeLessThan(400);
    });

    it("should work in `orient: 'top'` axis", () => {
      const axis = new LineAxis({
        start: { x: 150, y: 150 },
        end: { x: 350, y: 150 },
        items: [xItems],
        title: {
          visible: true,
          position: 'middle',
          autoRotate: true,
          padding: 0,
          maxWidth: 100,
          text: 'x 轴 -- bottom',
          space: 0
        },
        tick: {
          visible: true,
          length: 10
        },
        label: {
          visible: true,
          autoRotate: false,
          autoRotateAngle: [45],
          autoHide: true,
          autoLimit: true,
          containerAlign: 'bottom'
          // formatMethod: () => 'AAAAAAAAAAAAAA',
        },
        orient: 'top',
        verticalLimitSize: 60,
        verticalMinSize: 60,
        verticalFactor: -1
      });
      stage.defaultLayer.add(axis as unknown as IGraphic);
      stage.render();

      let firstLabel = axis.getElementsByName('axis-label')[0] as IText;
      let firstLayer = axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup;
      expect(firstLabel.attribute.textBaseline).toBe('bottom');
      expect(firstLabel.attribute.y).toBe(firstLayer.AABBBounds.y2);

      axis.setAttribute('label', { containerAlign: 'middle' });
      firstLabel = axis.getElementsByName('axis-label')[0] as IText;
      firstLayer = axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup;
      expect(firstLabel.attribute.textBaseline).toBe('bottom');
      expect((firstLabel.AABBBounds.y1 + firstLabel.AABBBounds.y2) / 2).toBeCloseTo(
        (firstLayer.AABBBounds.y1 + firstLayer.AABBBounds.y2) * 0.5
      );

      axis.setAttribute('label', { containerAlign: 'top' });

      firstLabel = axis.getElementsByName('axis-label')[0] as IText;
      firstLayer = axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup;
      expect(firstLabel.attribute.textBaseline).toBe('bottom');
      expect(firstLabel.attribute.y + firstLabel.attribute.dy - firstLabel.AABBBounds.height()).toBeCloseTo(
        firstLayer.AABBBounds.y1
      );
    });

    it("should work in `orient: 'bottom'` axis", () => {
      const axis = new LineAxis({
        start: { x: 150, y: 350 },
        end: { x: 350, y: 350 },
        items: [xItems],
        title: {
          visible: true,
          position: 'middle',
          autoRotate: true,
          padding: 0,
          maxWidth: 100,
          text: 'x 轴 -- bottom',
          space: 0
        },
        tick: {
          visible: true,
          length: 10
        },
        label: {
          visible: true,
          space: 10,
          // autoRotate: true,
          // autoRotateAngle: [-90],
          autoHide: true,
          autoLimit: true,
          containerAlign: 'bottom'
        },
        orient: 'bottom',
        verticalLimitSize: 120,
        verticalMinSize: 120
      });
      stage.defaultLayer.add(axis as unknown as IGraphic);
      stage.render();

      let firstLabel = axis.getElementsByName('axis-label')[0] as IText;
      let firstLayer = axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup;
      expect(firstLabel.attribute.textBaseline).toBe('top');
      expect(firstLabel.attribute.y + firstLabel.attribute.dy + firstLabel.AABBBounds.height()).toBe(
        firstLayer.AABBBounds.y2
      );

      axis.setAttribute('label', { containerAlign: 'middle' });
      firstLabel = axis.getElementsByName('axis-label')[0] as IText;
      firstLayer = axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup;
      expect(firstLabel.attribute.textBaseline).toBe('top');
      expect(firstLabel.attribute.y + firstLabel.attribute.dy + firstLabel.AABBBounds.height() / 2).toBe(
        (firstLayer.AABBBounds.y1 + firstLayer.AABBBounds.y2) * 0.5
      );

      axis.setAttribute('label', { containerAlign: 'top' });
      firstLabel = axis.getElementsByName('axis-label')[0] as IText;
      firstLayer = axis.getElementsByName('axis-label-container-layer-0')[0] as IGroup;
      expect(firstLabel.attribute.textBaseline).toBe('top');
      expect(firstLabel.attribute.y + firstLabel.attribute.dy).toBe(firstLayer.AABBBounds.y1);
    });
  });
});
