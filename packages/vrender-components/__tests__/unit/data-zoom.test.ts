import type { IArea, IGroup, ILine, IRect, ISymbol, Stage } from '@visactor/vrender-core';
import { Group } from '@visactor/vrender-core';
import type { Tag } from '../../src';
import { DataZoom } from '../../src';
import { createCanvas } from '../util/dom';
import { createStage } from '../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('DataZoom component test', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  test('Attribute', () => {
    const dataZoom: DataZoom = new DataZoom({
      start: 0.2,
      end: 0.5,
      position: {
        x: 50,
        y: 235
      },
      size: {
        width: 400,
        height: 30
      }
    });
    stage.defaultLayer.add(dataZoom as any);
    stage.render();
    const { position, start, end } = dataZoom.attribute;
    expect(start).toBe(0.2);
    expect(end).toBe(0.5);
    expect(position).toEqual({
      x: 50,
      y: 235
    });
    expect((dataZoom.getElementsByName('background')[0] as IRect).attribute.width).toBe(378);
    expect((dataZoom.getElementsByName('background')[0] as IRect).attribute.height).toBe(22);
    expect(dataZoom.AABBBounds.width()).toBe(379);
    expect(dataZoom.AABBBounds.height()).toBe(35);
  });

  test('Vertical Direction without Preview Data', () => {
    const dataZoom: DataZoom = new DataZoom({
      start: 0.2,
      end: 0.5,
      position: {
        x: 50,
        y: 235
      },
      size: {
        width: 400,
        height: 30
      },
      middleHandlerStyle: {
        visible: true
      },
      backgroundChartStyle: {
        line: {
          visible: false
        },
        area: {
          visible: false
        }
      },
      selectedBackgroundChartStyle: {
        line: {
          visible: false
        },
        area: {
          visible: false
        }
      }
    });
    stage.defaultLayer.add(dataZoom as any);
    stage.render();
    const position = dataZoom.attribute.position;
    expect(dataZoom.getChildren()[0].getChildren().length).toBe(9);

    const background = dataZoom.getElementsByName('background')[0] as IRect;
    expect(background.attribute.x).toBe(61);
    expect(background.attribute.y).toBe(243);
    expect(background.attribute.width).toBe(378);
    expect(background.attribute.height).toBe(22);

    const previewGroup = dataZoom.getElementsByName('previewGroup')[0] as IGroup;
    expect(previewGroup).toBeUndefined();

    const previewLine = dataZoom.getElementsByName('previewLine')[0] as ILine;
    expect(previewLine).toBeUndefined();

    const previewArea = dataZoom.getElementsByName('previewArea')[0] as IArea;
    expect(previewArea).toBeUndefined();

    const startHandler = dataZoom.getElementsByName('startHandler')[0] as ISymbol;
    expect(startHandler.attribute.x).toBeCloseTo(136.60000000000002);
    expect(startHandler.attribute.y).toBe(254);
    expect(startHandler.attribute.size).toBe(22);
    expect(startHandler.attribute.angle).toBe(0);

    const endHandler = dataZoom.getElementsByName('endHandler')[0] as ISymbol;
    expect(endHandler.attribute.x).toBe(250);
    expect(endHandler.attribute.y).toBe(254);
    expect(endHandler.attribute.size).toBe(22);
    expect(endHandler.attribute.angle).toBe(0);

    const middleHandlerRect = dataZoom.getElementsByName('middleHandlerRect')[0] as IRect;
    expect(middleHandlerRect.attribute.x).toBeCloseTo(136.60000000000002);
    expect(middleHandlerRect.attribute.y).toBe(235);
    expect(middleHandlerRect.attribute.width).toBeCloseTo(113.39999999999999);
    expect(middleHandlerRect.attribute.height).toBe(8);

    const middleHandlerSymbol = dataZoom.getElementsByName('middleHandlerSymbol')[0] as ISymbol;
    expect(middleHandlerSymbol.attribute.x).toBeCloseTo(193.29999999999998);
    expect(middleHandlerSymbol.attribute.y).toBe(239);
    expect(middleHandlerSymbol.attribute.angle).toBe(0);

    // visible: false not create
    // const startText = dataZoom.getElementsByName(`data-zoom-start-text-${position}`)[0] as unknown as Tag;
    // expect(startText.attribute.text).toBe(0.2);
    // expect(startText.attribute.x).toBeCloseTo(136.60000000000002);
    // expect(startText.attribute.y).toBe(254);
    // expect(startText.attribute.textStyle?.textAlign).toBe('right');
    // expect(startText.attribute.textStyle?.textBaseline).toBe('middle');

    // const endText = dataZoom.getElementsByName(`data-zoom-end-text-${position}`)[0] as unknown as Tag;
    // expect(endText.attribute.text).toBe(0.5);
    // expect(endText.attribute.x).toBe(250);
    // expect(endText.attribute.y).toBe(254);
    // expect(endText.attribute.textStyle?.textAlign).toBe('left');
    // expect(endText.attribute.textStyle?.textBaseline).toBe('middle');

    const selectedBackground = dataZoom.getElementsByName('selectedBackground')[0] as IRect;
    expect(selectedBackground.attribute.x).toBeCloseTo(136.60000000000002);
    expect(selectedBackground.attribute.y).toBe(243);
    expect(selectedBackground.attribute.width).toBe(113.39999999999999);
    expect(selectedBackground.attribute.height).toBe(22);

    // const dragMask = dataZoom.getElementsByName('dragMask')[0] as IRect;
    // expect(dragMask.attribute.x).toBe(0);
    // expect(dragMask.attribute.y).toBe(235);
    // expect(dragMask.attribute.width).toBe(0);
    // expect(dragMask.attribute.height).toBe(30);

    const selectedPreviewGroup = dataZoom.getElementsByName('selectedPreviewGroup')[0] as IGroup;
    expect(selectedPreviewGroup).toBeUndefined();

    const selectedPreviewLine = dataZoom.getElementsByName('selectedPreviewLine')[0] as ILine;
    expect(selectedPreviewLine).toBeUndefined();

    const selectedPreviewArea = dataZoom.getElementsByName('selectedPreviewArea')[0] as IArea;
    expect(selectedPreviewArea).toBeUndefined();
  });

  test('Orient Left without Preview Data', () => {
    const dataZoom: DataZoom = new DataZoom({
      orient: 'left',
      start: 0.2,
      end: 0.5,
      position: {
        x: 235,
        y: 50
      },
      size: {
        width: 30,
        height: 400
      },
      backgroundChartStyle: {
        line: {
          visible: false
        },
        area: {
          visible: false
        }
      },
      selectedBackgroundChartStyle: {
        line: {
          visible: false
        },
        area: {
          visible: false
        }
      }
    });
    stage.defaultLayer.add(dataZoom as any);
    stage.render();
    const position = dataZoom.attribute.position;
    expect(dataZoom.getChildren()[0].getChildren().length).toBe(9);
    const background = dataZoom.getElementsByName('background')[0] as IRect;
    expect(background.attribute.x).toBe(243);
    expect(background.attribute.y).toBe(72);
    expect(background.attribute.width).toBe(22);
    expect(background.attribute.height).toBe(378);

    const previewGroup = dataZoom.getElementsByName('previewGroup')[0] as IGroup;
    expect(previewGroup).toBeUndefined();

    const previewLine = dataZoom.getElementsByName('previewLine')[0] as ILine;
    expect(previewLine).toBeUndefined();

    const previewArea = dataZoom.getElementsByName('previewArea')[0] as IArea;
    expect(previewArea).toBeUndefined();

    const startHandler = dataZoom.getElementsByName('startHandler')[0] as ISymbol;
    expect(startHandler.attribute.x).toBe(254);
    expect(startHandler.attribute.y).toBe(147.60000000000002);
    expect(startHandler.attribute.size).toBe(22);
    expect(startHandler.attribute.angle).toBe(1.5707963267948966);

    const endHandler = dataZoom.getElementsByName('endHandler')[0] as ISymbol;
    expect(endHandler.attribute.x).toBe(254);
    expect(endHandler.attribute.y).toBe(261);
    expect(endHandler.attribute.size).toBe(22);
    expect(endHandler.attribute.angle).toBe(1.5707963267948966);

    // visible: false not create
    // const startText = dataZoom.getElementsByName(`data-zoom-start-text-${position}`)[0] as unknown as Tag;
    // expect(startText.attribute.text).toBe(0.2);
    // expect(startText.attribute.x).toBe(254);
    // expect(startText.attribute.y).toBe(147.60000000000002);
    // expect(startText.attribute.textStyle?.textAlign).toBe('center');
    // expect(startText.attribute.textStyle?.textBaseline).toBe('bottom');

    // const endText = dataZoom.getElementsByName(`data-zoom-end-text-${position}`)[0] as unknown as Tag;
    // expect(endText.attribute.x).toBe(254);
    // expect(endText.attribute.y).toBe(261);
    // expect(endText.attribute.textStyle?.textAlign).toBe('center');
    // expect(endText.attribute.textStyle?.textBaseline).toBe('top');

    const selectedBackground = dataZoom.getElementsByName('selectedBackground')[0] as IRect;
    expect(selectedBackground.attribute.x).toBe(243);
    expect(selectedBackground.attribute.y).toBeCloseTo(147.60000000000002);
    expect(selectedBackground.attribute.width).toBe(22);
    expect(selectedBackground.attribute.height).toBeCloseTo(113.39999999999999);

    // const dragMask = dataZoom.getElementsByName('dragMask')[0] as IRect;
    // expect(dragMask.attribute.x).toBe(235);
    // expect(dragMask.attribute.y).toBe(0);
    // expect(dragMask.attribute.width).toBe(30);
    // expect(dragMask.attribute.height).toBe(0);

    const selectedPreviewGroup = dataZoom.getElementsByName('selectedPreviewGroup')[0] as IGroup;
    expect(selectedPreviewGroup).toBeUndefined();

    const selectedPreviewLine = dataZoom.getElementsByName('selectedPreviewLine')[0] as ILine;
    expect(selectedPreviewLine).toBeUndefined();

    const selectedPreviewArea = dataZoom.getElementsByName('selectedPreviewArea')[0] as IArea;
    expect(selectedPreviewArea).toBeUndefined();
  });

  test('Orient Right without Preview Data', () => {
    const dataZoom: DataZoom = new DataZoom({
      orient: 'right',
      start: 0.2,
      end: 0.5,
      position: {
        x: 235,
        y: 50
      },
      size: {
        width: 30,
        height: 400
      },
      middleHandlerStyle: {
        visible: true
      }
    });
    stage.defaultLayer.add(dataZoom as any);
    stage.render();
    expect(dataZoom.getChildren()[0].getChildren().length).toBe(11);
    const middleHandlerRect = dataZoom.getElementsByName('middleHandlerRect')[0] as IRect;
    expect(middleHandlerRect.attribute.x).toBe(257);
    expect(middleHandlerRect.attribute.y).toBeCloseTo(147.60000000000002);
    expect(middleHandlerRect.attribute.width).toBe(8);
    expect(middleHandlerRect.attribute.height).toBeCloseTo(113.39999999999999);

    const middleHandlerSymbol = dataZoom.getElementsByName('middleHandlerSymbol')[0] as ISymbol;
    expect(middleHandlerSymbol.attribute.x).toBe(261);
    expect(middleHandlerSymbol.attribute.y).toBeCloseTo(204.29999999999998);
    expect(middleHandlerSymbol.attribute.angle).toBeCloseTo(1.5707963267948966);
  });

  test('Vertical Direction with Preview Data', () => {
    const data: any[] = [];
    for (let i = 0; i < 9; i++) {
      data.push({
        x: 50 + i * 50,
        y: 235 + 0.2 * 30
      });
    }
    const dataZoom: DataZoom = new DataZoom({
      start: 0.2,
      end: 0.5,
      position: {
        x: 50,
        y: 235
      },
      size: {
        width: 400,
        height: 30
      },
      backgroundChartStyle: {
        area: {
          fill: 'pink',
          curveType: 'basis',
          fillOpacity: 0.2
        }
      },
      selectedBackgroundChartStyle: {
        area: {
          fill: 'pink',
          curveType: 'basis'
        }
      }
    });
    dataZoom.setPreviewData(data);
    dataZoom.setPreviewPointsX(d => d.x);
    dataZoom.setPreviewPointsY(d => d.y);
    dataZoom.setPreviewPointsX1(d => d.x);
    dataZoom.setPreviewPointsY1(d => 265);
    stage.defaultLayer.add(dataZoom as any);
    stage.render();

    expect(dataZoom.getChildren()[0].getChildren().length).toBe(11);

    const previewGroup = dataZoom.getElementsByName('previewGroup')[0] as IGroup;
    expect(previewGroup.childrenCount).toBe(2);

    const previewLine = dataZoom.getElementsByName('previewLine')[0] as ILine;
    expect(previewLine.attribute.points?.[1]).toEqual({
      x: 50,
      y: 241
    });

    const previewArea = dataZoom.getElementsByName('previewArea')[0] as IArea;
    expect(previewArea.attribute.points).toHaveLength(11);
    expect(previewArea.attribute.points?.[1]).toEqual({
      x: 50,
      x1: 50,
      y: 241,
      y1: 265
    });
    expect(previewArea.attribute.fill).toBe('pink');
    expect(previewArea.attribute.fillOpacity).toBe(0.2);

    const selectedPreviewGroupClip = dataZoom.getElementsByName('selectedPreviewGroupClip')[0] as IGroup;
    expect(selectedPreviewGroupClip.getChildren()).toHaveLength(1);
    expect(selectedPreviewGroupClip.attribute.x).toBeCloseTo(136.60000000000002);
    expect(selectedPreviewGroupClip.attribute.y).toBe(243);
    expect(selectedPreviewGroupClip.attribute.width).toBeCloseTo(113.39999999999999);
    expect(selectedPreviewGroupClip.attribute.height).toBe(22);
    expect(selectedPreviewGroupClip.attribute.clip).toBeTruthy();

    const selectedPreviewGroup = dataZoom.getElementsByName('selectedPreviewGroup')[0] as IGroup;
    expect(selectedPreviewGroup.childrenCount).toBe(2);

    const selectedPreviewLine = dataZoom.getElementsByName('selectedPreviewLine')[0] as ILine;
    expect(selectedPreviewLine.attribute.points?.[1]).toEqual({
      x: 50,
      y: 241
    });

    const selectedPreviewArea = dataZoom.getElementsByName('selectedPreviewArea')[0] as IArea;
    expect(selectedPreviewArea.attribute.points).toHaveLength(11);
    expect(selectedPreviewArea.attribute.points?.[1]).toEqual({
      x: 50,
      x1: 50,
      y: 241,
      y1: 265
    });
    expect(selectedPreviewArea.attribute.fill).toBe('pink');
  });

  test('Horizontal Direction with Preview Data', () => {
    const data: any[] = [];
    for (let i = 0; i < 9; i++) {
      data.push({
        x: 265 - 0.3 * 30,
        y: 50 + i * 50
      });
    }
    const dataZoom: DataZoom = new DataZoom({
      orient: 'left',
      start: 0.2,
      end: 0.5,
      position: {
        x: 235,
        y: 50
      },
      size: {
        width: 30,
        height: 400
      },
      backgroundChartStyle: {
        area: {
          fill: '#2E8B57',
          curveType: 'basis',
          fillOpacity: 0.2
        }
      },
      selectedBackgroundChartStyle: {
        area: {
          fill: '#2E8B57',
          curveType: 'basis'
        }
      }
    });
    dataZoom.setPreviewData(data);
    dataZoom.setPreviewPointsX(d => d.x);
    dataZoom.setPreviewPointsY(d => d.y);
    dataZoom.setPreviewPointsX1(d => 265);
    dataZoom.setPreviewPointsY1(d => d.y);
    stage.defaultLayer.add(dataZoom as any);
    stage.render();

    expect(dataZoom.getChildren()[0].getChildren().length).toBe(11);

    const previewGroup = dataZoom.getElementsByName('previewGroup')[0] as IGroup;
    expect(previewGroup.childrenCount).toBe(2);

    const previewLine = dataZoom.getElementsByName('previewLine')[0] as ILine;
    expect(previewLine.attribute.points?.[1]).toEqual({
      x: 256,
      y: 50
    });

    const previewArea = dataZoom.getElementsByName('previewArea')[0] as IArea;
    expect(previewArea.attribute.points).toHaveLength(11);
    expect(previewArea.attribute.points?.[1]).toEqual({
      x: 256,
      x1: 265,
      y: 50,
      y1: 50
    });
    expect(previewArea.attribute.fill).toBe('#2E8B57');
    expect(previewArea.attribute.fillOpacity).toBe(0.2);

    const selectedPreviewGroupClip = dataZoom.getElementsByName('selectedPreviewGroupClip')[0] as IGroup;
    expect(selectedPreviewGroupClip.getChildren()).toHaveLength(1);
    expect(selectedPreviewGroupClip.attribute.x).toBe(243);
    expect(selectedPreviewGroupClip.attribute.y).toBeCloseTo(147.60000000000002);
    expect(selectedPreviewGroupClip.attribute.width).toBe(22);
    expect(selectedPreviewGroupClip.attribute.height).toBeCloseTo(113.39999999999999);
    expect(selectedPreviewGroupClip.attribute.clip).toBeTruthy();

    const selectedPreviewGroup = dataZoom.getElementsByName('selectedPreviewGroup')[0] as IGroup;
    expect(selectedPreviewGroup.childrenCount).toBe(2);

    const selectedPreviewLine = dataZoom.getElementsByName('selectedPreviewLine')[0] as ILine;
    expect(selectedPreviewLine.attribute.points?.[1]).toEqual({
      x: 256,
      y: 50
    });

    const selectedPreviewArea = dataZoom.getElementsByName('selectedPreviewArea')[0] as IArea;
    expect(selectedPreviewArea.attribute.points).toHaveLength(11);
    expect(selectedPreviewArea.attribute.points?.[1]).toEqual({
      x: 256,
      x1: 265,
      y: 50,
      y1: 50
    });
    expect(selectedPreviewArea.attribute.fill).toBe('#2E8B57');
  });
});
