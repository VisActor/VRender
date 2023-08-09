import type { IGraphic, Stage, Group, ILine, Text, IText } from '@visactor/vrender';
import { LineAxis } from '../../../../src';
import { createCanvas } from '../../../util/dom';
import { createStage } from '../../../util/vrender';
import { AXIS_ELEMENT_NAME } from '../../../../src/axis/constant';

describe('Auto Limit', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  it('should consider label style when do auto limit', () => {
    const axis = new LineAxis({
      title: {
        space: 20,
        padding: 0,
        textStyle: {
          fontSize: 14,
          fill: '#333333',
          fontWeight: 'normal',
          fillOpacity: 1,
          textAlign: 'center',
          textBaseline: 'bottom'
        },
        autoRotate: false,
        angle: -1.5707963267948966,
        shape: {},
        background: {},
        state: {
          text: null,
          shape: null,
          background: null
        },
        text: 'y',
        maxWidth: null
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
          maxLineWidth: 50,
          ellipsis: '等'
        },
        formatMethod: text => {
          return `format_method_${text}`;
        },
        autoRotate: false,
        autoHide: false,
        autoLimit: true
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
      grid: {
        style: {
          lineWidth: 1,
          stroke: '#EBEDF2',
          strokeOpacity: 1,
          lineDash: []
        },
        visible: true,
        length: 306,
        type: 'line',
        depth: 0
      },

      x: 210,
      y: 12,
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 448
      },
      items: [
        [
          {
            id: 0,
            label: 0,
            value: 1,
            rawValue: 0
          },
          {
            id: 200,
            label: 200,
            value: 0.7777777777777778,
            rawValue: 200
          },
          {
            id: 400,
            label: 400,
            value: 0.5555555555555556,
            rawValue: 400
          },
          {
            id: 600,
            label: 600,
            value: 0.33333333333333337,
            rawValue: 600
          },
          {
            id: 800,
            label: 800,
            value: 0.11111111111111116,
            rawValue: 800
          }
        ]
      ],
      visible: true,
      pickable: true,
      orient: 'left',
      verticalFactor: 1,
      verticalLimitSize: 120
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();
    expect((axis.getElementsByName('axis-label')[0] as IText).clipedText).toBe('form等');

    axis.setAttribute('verticalLimitSize', 60);
    expect((axis.getElementsByName('axis-label')[0] as IText).clipedText).toBe('for等');
  });

  it('should ignore when the ceil of label size is not bigger than limitSize', () => {
    const axis = new LineAxis({
      title: {
        space: 20,
        padding: 0,
        textStyle: {
          fontSize: 14,
          fill: '#333333',
          fontWeight: 'normal',
          fillOpacity: 1,
          textAlign: 'center',
          textBaseline: 'bottom'
        },
        autoRotate: false,
        angle: -1.5707963267948966,
        shape: {},
        background: {},
        text: 'age'
      },
      label: {
        visible: true,
        inside: false,
        space: 20,
        style: {
          fontSize: 14,
          fill: '#89909D',
          fontWeight: 'normal',
          fillOpacity: 1
        },
        autoRotate: false,
        autoHide: false,
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
      line: {
        visible: true,
        style: {
          lineWidth: 1,
          stroke: '#D9DDE4',
          strokeOpacity: 1
        }
      },
      x: 79,
      y: 82,
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 304
      },
      items: [
        [
          {
            id: '0-4',
            label: '0-4',
            value: 0.9651162790697675,
            rawValue: '0-4'
          },
          {
            id: '10-14',
            label: '10-14',
            value: 0.8720930232558138,
            rawValue: '10-14'
          },
          {
            id: '20-24',
            label: '20-24',
            value: 0.7790697674418605,
            rawValue: '20-24'
          },
          {
            id: '30-34',
            label: '30-34',
            value: 0.686046511627907,
            rawValue: '30-34'
          },
          {
            id: '40-44',
            label: '40-44',
            value: 0.5930232558139535,
            rawValue: '40-44'
          },
          {
            id: '50-54',
            label: '50-54',
            value: 0.5,
            rawValue: '50-54'
          },
          {
            id: '60-64',
            label: '60-64',
            value: 0.4069767441860465,
            rawValue: '60-64'
          },
          {
            id: '70-74',
            label: '70-74',
            value: 0.313953488372093,
            rawValue: '70-74'
          },
          {
            id: '80-84',
            label: '80-84',
            value: 0.2209302325581395,
            rawValue: '80-84'
          },
          {
            id: '90-94',
            label: '90-94',
            value: 0.12790697674418605,
            rawValue: '90-94'
          },
          {
            id: '100+',
            label: '100+',
            value: 0.03488372093023255,
            rawValue: '100+'
          }
        ]
      ],
      visible: true,
      pickable: true,
      orient: 'right',
      verticalFactor: -1,
      verticalLimitSize: 67
    });
    stage.defaultLayer.add(axis as unknown as IGraphic);
    stage.render();
    expect((axis.getElementsByName('axis-label')[4] as IText).clipedText).toBe('40-44');
    expect(Math.floor(axis.AABBBounds.width())).toBe(67);
  });
});
