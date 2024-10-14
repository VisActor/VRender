import type { IGraphic, ISymbol, Stage } from '@visactor/vrender-core';
import { DiscreteLegend, LEGEND_ELEMENT_NAME } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('Legend focus layout', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item with value', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 100,
      fill: 'rgba(33, 100, 60, .2)',
      item: {
        maxWidth: 100,
        value: {
          style: {
            fill: '#000'
          }
        }
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          value: 100,
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', value: 100, shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(422.05995178222656);
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item without value', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 200,
      fill: 'rgba(33, 100, 60, .2)',
      item: {
        maxWidth: 100
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(310);
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item with focus', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 250,
      fill: 'rgba(33, 100, 60, .2)',
      layout: 'vertical',
      item: {
        maxWidth: 100,
        focus: true
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(108.71428571428572);
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item with focus and value', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 400,
      fill: 'rgba(33, 100, 60, .2)',
      layout: 'vertical',
      item: {
        maxWidth: 100,
        focus: true,
        value: {
          style: {
            fill: '#000'
          }
        }
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          value: 100,
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', value: 100, shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(99.92627607073103);
  });

  it('should calculate when legend item just has label', () => {
    const legend = new DiscreteLegend({
      layout: 'vertical',
      title: {
        align: 'start',
        space: 12,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#2C3542'
        }
      },
      item: {
        spaceCol: 10,
        spaceRow: 6,
        shape: {
          space: 6,
          style: {
            size: 10,
            cursor: 'pointer',
            lineWidth: 0,
            fillOpacity: 1,
            opacity: 1
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              opacity: 1,
              fillOpacity: 0.2
            }
          }
        },
        label: {
          space: 6,
          style: {
            fontSize: 12,
            fill: '#606773',
            cursor: 'pointer',
            lineHeight: 15.600000000000001,
            opacity: 1
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              fill: '#bcc1cb',
              opacity: 1
            }
          }
        },
        value: {
          alignRight: false,
          style: {
            fontSize: 12,
            fill: '#ccc',
            cursor: 'pointer'
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              fill: '#D8D8D8'
            }
          }
        },
        background: {
          style: {
            cursor: 'pointer'
          },
          state: {
            selectedHover: {
              fill: '#f1f2f5'
            },
            unSelectedHover: {
              fill: '#f1f2f5'
            }
          }
        },
        focus: true,
        focusIconStyle: {
          size: 10,
          symbolType:
            'M8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1ZM8.75044 2.55077L8.75 3.75H7.25L7.25006 2.5507C4.81247 2.88304 2.88304 4.81247 2.5507 7.25006L3.75 7.25V8.75L2.55077 8.75044C2.8833 11.1878 4.81264 13.117 7.25006 13.4493L7.25 12.25H8.75L8.75044 13.4492C11.1876 13.1167 13.1167 11.1876 13.4492 8.75044L12.25 8.75V7.25L13.4493 7.25006C13.117 4.81264 11.1878 2.8833 8.75044 2.55077ZM8 5.5C9.38071 5.5 10.5 6.61929 10.5 8C10.5 9.38071 9.38071 10.5 8 10.5C6.61929 10.5 5.5 9.38071 5.5 8C5.5 6.61929 6.61929 5.5 8 5.5ZM8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7Z',
          fill: '#333',
          cursor: 'pointer'
        },
        visible: true,
        padding: {
          right: 2,
          bottom: 2,
          left: 2,
          top: 2
        }
      },
      autoPage: true,
      pager: {
        space: 12,
        handler: {
          style: {
            size: 10
          },
          space: 4
        }
      },
      hover: true,
      select: true,
      selectMode: 'multiple',
      allowAllCanceled: true,
      items: [
        {
          label: '水果',
          shape: {
            symbolType: 'square',
            fill: '#1664FF',
            stroke: '#1664FF'
          },
          id: '水果',
          index: 0
        },
        {
          label: '米面',
          shape: {
            symbolType: 'square',
            fill: '#1AC6FF',
            stroke: '#1AC6FF'
          },
          id: '米面',
          index: 1
        },
        {
          label: '特产零食',
          shape: {
            symbolType: 'square',
            fill: '#FF8A00',
            stroke: '#FF8A00'
          },
          id: '特产零食',
          index: 2
        },
        {
          label: '茶叶',
          shape: {
            symbolType: 'square',
            fill: '#3CC780',
            stroke: '#3CC780'
          },
          id: '茶叶',
          index: 3
        }
      ],
      zIndex: 500,
      defaultSelected: ['特产零食', '米面'],
      maxWidth: 759,
      maxHeight: 460,
      width: 68,
      height: 96.4,
      dx: 0,
      dy: 0,
      x: 300,
      y: 100
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();
    expect(legend.getElementsByName(LEGEND_ELEMENT_NAME.focus).length).toBe(4);
    expect((legend.getElementsByName(LEGEND_ELEMENT_NAME.focus)[0] as ISymbol).attribute.x).toBe(41);
  });
});
