import '@visactor/vrender';
import { createRect } from '@visactor/vrender';
import { createRenderer } from '../../util/render';
import { RectLabel } from '../../../src';

export const run = () => {
  const stage = createRenderer('main');

  const rect = createRect({
    x: 180,
    y: 180,
    width: 160,
    height: 100,
    fill: '#2E62F1'
  });
  stage.defaultLayer.add(rect);

  const label = new RectLabel({
    data: [{ text: 'Intersect Background' }],
    // 放置在图形边缘附近以制造相交（根据文本尺寸可能略有不同）
    position: 'top',
    offset: -10,
    textStyle: {
      fill: '#000',
      stroke: '#fff',
      lineWidth: 1
    },
    smartInvert: {
      interactInvertType: 'background'
    }
  });

  // 关联 label 到 rect
  // @ts-ignore
  label.setRelatedGraphic(rect);
  stage.defaultLayer.add(label);

  stage.render();

  // 输出验证信息
  // eslint-disable-next-line no-console
  console.log('label.stroke:', label.attribute?.stroke);
  // eslint-disable-next-line no-console
  console.log('label.background:', label.attribute?.background);
};
