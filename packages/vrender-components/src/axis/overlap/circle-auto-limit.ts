import type { IText, ITextGraphicAttribute } from '@visactor/vrender-core';
import { isNumberClose } from '@visactor/vutils';
import type { Point } from '../../core/type';

type WrapConfig = {
  inside?: boolean;
  ellipsis?: string;
  bounds: { x1: number; x2: number; y1: number; y2: number };
  autoWrap?: boolean;
};

function findSiblingLabels(labels: IText[], selfIndex: number) {
  const len = labels.length;
  const prevLabel = selfIndex >= 1 ? labels[selfIndex - 1] : labels[len - 1];
  const nextLabel = selfIndex < len - 1 ? labels[selfIndex + 1] : labels[0];

  return { prevLabel, nextLabel };
}
/**
 * 基于所有的标签初始化未知已经布局在圆的边缘
 * @param labels
 * @param labelPoints
 * @param config
 */
export function circleAutoLimit(labels: IText[], labelPoints: Point[], config: WrapConfig) {
  const { ellipsis, inside, bounds, autoWrap } = config;

  if (!inside) {
    // TODO inside label暂不处理，现在应该没有类似的需求
    labels.forEach((label, index) => {
      const b = label.AABBBounds;
      const point = labelPoints[index];

      if (isNumberClose(point.x, 0)) {
        const boxWidth = bounds.x2 - bounds.x1;
        // 12点和6点钟方向对应的label
        if (labels.length >= 3) {
          // 这里其实有一个前提：所有的label都是按照顺时针或者逆时针排序好的
          const prevLabel = index >= 1 ? labels[index - 1] : labels[labels.length - 1];
          const nextLabel = index < labels.length - 1 ? labels[index + 1] : labels[0];
          const maxWidth =
            nextLabel.AABBBounds.x1 > prevLabel.AABBBounds.x2
              ? nextLabel.AABBBounds.x1 - prevLabel.AABBBounds.x2
              : nextLabel.AABBBounds.x2 < prevLabel.AABBBounds.x1
              ? prevLabel.AABBBounds.x1 - nextLabel.AABBBounds.x2
              : boxWidth;
          if (label.AABBBounds.width() > maxWidth) {
            adjustMaxLineWidth(label, label.AABBBounds.width() - maxWidth, ellipsis);
          }
        } else if (label.AABBBounds.width() > boxWidth) {
          adjustMaxLineWidth(label, label.AABBBounds.width() - boxWidth, ellipsis);
        }
      } else if (b.x2 > bounds.x2) {
        if (autoWrap) {
          //  const heightLimit =
        }
        adjustMaxLineWidth(label, b.x2 - bounds.x2, ellipsis);
      } else if (b.x1 < bounds.x1) {
        adjustMaxLineWidth(label, bounds.x1 - b.x1, ellipsis);
      }
    });
  }
}

export function adjustMaxLineWidth(label: IText, delta: number, ellipsis: string) {
  const maxLineWidth = label.AABBBounds.width() - delta;
  const { x = 0, textAlign } = label.attribute;
  const newAttrs: ITextGraphicAttribute = {
    maxLineWidth,
    ellipsis: label.attribute.ellipsis ?? ellipsis
  };

  if (textAlign === 'right') {
    newAttrs.x = x - delta;
  } else if (textAlign === 'center') {
    newAttrs.x = x - delta / 2;
  }

  label.setAttributes(newAttrs);
}
