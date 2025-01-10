import type { IGraphic, IGroup, IText, Stage } from '@visactor/vrender-core';
import { DiscreteLegend } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('DiscreteLegend', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });
  it('DiscreteLegend should be render correctly', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 100,
      // ==== 测试使用 ====
      width: 300,
      height: 300,
      fill: 'rgba(33, 100, 60, .2)',

      // ==== 测试使用 end ====
      title: {
        visible: true,
        text: '标题',
        padding: 4,
        background: {
          visible: true,
          style: {
            fill: 'red'
          }
        }
      },
      item: {
        // padding: 10,
        // width: 120,
        shape: {
          style: {
            size: 8
          }
        },
        value: {
          alignRight: true
        },
        background: {
          style: {
            stroke: '#000',
            lineWidth: 1
          }
        }
      },
      items: [
        { label: '苹果', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
        { label: '香蕉', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', value: 100, shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    // pager.addEventListener('toPrev', e => {
    //   console.log(e.detail);
    // });

    // pager.addEventListener('toNext', e => {
    //   console.log(e.detail);
    // });
  });

  it('should return its own width when its own width does not exceed maxWidth', () => {
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
        spaceCol: 0,
        spaceRow: 0,
        shape: {
          space: 4,
          style: {
            size: 10,
            cursor: 'pointer',
            symbolType: 'square'
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              fill: '#D8D8D8',
              fillOpacity: 0.5
            }
          }
        },
        label: {
          space: 4,
          style: {
            fontSize: 12,
            fill: '#6F6F6F',
            cursor: 'pointer'
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              fill: '#D8D8D8',
              fillOpacity: 0.5
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
            cursor: 'pointer',
            fillOpacity: 0.001
          },
          state: {
            selectedHover: {
              fill: 'gray',
              fillOpacity: 0.7
            },
            unSelectedHover: {
              fill: 'gray',
              fillOpacity: 0.2
            }
          }
        },
        focus: false,
        focusIconStyle: {
          size: 10,
          symbolType:
            'M8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1ZM8.75044 2.55077L8.75 3.75H7.25L7.25006 2.5507C4.81247 2.88304 2.88304 4.81247 2.5507 7.25006L3.75 7.25V8.75L2.55077 8.75044C2.8833 11.1878 4.81264 13.117 7.25006 13.4493L7.25 12.25H8.75L8.75044 13.4492C11.1876 13.1167 13.1167 11.1876 13.4492 8.75044L12.25 8.75V7.25L13.4493 7.25006C13.117 4.81264 11.1878 2.8833 8.75044 2.55077ZM8 5.5C9.38071 5.5 10.5 6.61929 10.5 8C10.5 9.38071 9.38071 10.5 8 10.5C6.61929 10.5 5.5 9.38071 5.5 8C5.5 6.61929 6.61929 5.5 8 5.5ZM8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7Z',
          fill: '#333',
          cursor: 'pointer'
        },
        visible: true,
        padding: {
          top: 4,
          bottom: 4,
          left: 4,
          right: 22
        },
        maxWidth: 1000
      },
      autoPage: true,
      pager: {
        space: 12,
        handler: {
          style: {
            size: 10
          },
          space: 4,
          state: {
            disable: {}
          }
        },
        textStyle: {}
      },
      hover: false,
      select: true,
      selectMode: 'multiple',
      allowAllCanceled: false,
      items: [
        {
          label: '销售额',
          shape: {
            fill: '#2E62F1',
            symbolType: 'square'
          },
          id: '销售额',
          index: 0
        },
        {
          label: '数量',
          shape: {
            fill: '#4DC36A',
            symbolType: 'square'
          },
          id: '数量',
          index: 1
        }
      ],
      zIndex: 500,
      maxWidth: 884,
      maxHeight: 476,
      maxCol: 1,
      defaultSelected: ['销售额', '数量'],
      width: 1000,
      height: 40,
      dx: 0,
      dy: 0,
      x: 28,
      y: 12
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(76);
  });

  it("should omit when label's width exceeds item's width", () => {
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
        spaceRow: 10,
        shape: {
          space: 4,
          style: {
            size: 10,
            cursor: 'pointer'
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              fill: '#D8D8D8',
              fillOpacity: 0.5
            }
          }
        },
        label: {
          space: 4,
          style: {
            fontSize: 12,
            fill: '#89909D',
            cursor: 'pointer'
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              fill: '#D8D8D8',
              fillOpacity: 0.5
            }
          }
        },
        value: {
          alignRight: true,
          style: {
            fontSize: 10,
            fill: '#333',
            cursor: 'pointer',
            fillOpacity: 0.8
          },
          state: {
            selectedHover: {
              opacity: 0.85
            },
            unSelected: {
              fill: '#D8D8D8'
            },
            unselected: {
              fill: '#d8d8d8'
            }
          }
        },
        background: {
          style: {
            cursor: 'pointer'
          },
          state: {
            selectedHover: {
              fill: 'gray',
              fillOpacity: 0.7
            },
            unSelectedHover: {
              fill: 'gray',
              fillOpacity: 0.2
            }
          }
        },
        visible: true,
        padding: 2,
        width: 121.95
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
      allowAllCanceled: false,
      items: [
        {
          label: 'OneOneOneOneOne',
          shape: {
            fill: '#1664FF',
            symbolType: 'square'
          },
          value: '26.32%',
          id: 'OneOneOneOneOne',
          index: 0
        },
        {
          label: 'Two',
          shape: {
            fill: '#1AC6FF',
            symbolType: 'square'
          },
          value: '23.68%',
          id: 'Two',
          index: 1
        },
        {
          label: 'Three',
          shape: {
            fill: '#FF8A00',
            symbolType: 'square'
          },
          value: '15.79%',
          id: 'Three',
          index: 2
        },
        {
          label: 'Four',
          shape: {
            fill: '#3CC780',
            symbolType: 'square'
          },
          value: '13.16%',
          id: 'Four',
          index: 3
        },
        {
          label: 'Five',
          shape: {
            fill: '#7442D4',
            symbolType: 'square'
          },
          value: '10.53%',
          id: 'Five',
          index: 4
        },
        {
          label: 'Six',
          shape: {
            fill: '#FFC400',
            symbolType: 'square'
          },
          value: '7.89%',
          id: 'Six',
          index: 5
        },
        {
          label: 'Seven',
          shape: {
            fill: '#304D77',
            symbolType: 'square'
          },
          value: '2.63%',
          id: 'Seven',
          index: 6
        }
      ],
      zIndex: 500,
      maxWidth: 813,
      maxHeight: 416,
      defaultSelected: ['OneOneOneOneOne', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
      width: 147.6698455810547,
      height: 186,
      dx: 0,
      dy: 0,
      x: 100,
      y: 42
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect((legend.getElementsByName('legendItem')[0] as IGroup).AABBBounds.width()).toBe(121.95);
    expect(
      (legend.getElementsByName('legendItem')[0].getElementsByName('legendItemLabel')[0] as IText)._AABBBounds.width()
    ).toBeCloseTo(57.167938232421875);
    expect(
      (legend.getElementsByName('legendItem')[0].getElementsByName('legendItemValue')[0] as IText).attribute
        .maxLineWidth
    ).toBeCloseTo(49.975);
  });
});
