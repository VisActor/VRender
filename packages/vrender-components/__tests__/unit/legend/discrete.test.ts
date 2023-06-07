import { IGraphic, Stage } from '@visactor/vrender';
import { DiscreteLegend } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';

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
});
