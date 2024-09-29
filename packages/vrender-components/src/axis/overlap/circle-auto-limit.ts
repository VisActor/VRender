import type { IText } from '@visactor/vrender-core';
import { isNumberClose } from '@visactor/vutils';
import type { Point } from '../../core/type';

type WrapConfig = {
  center: Point;
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

function adjustMaxLineWidth(label: IText, maxLineWidth: number, ellipsis: string) {
  label.setAttributes({
    maxLineWidth,
    ellipsis: label.attribute.ellipsis ?? ellipsis
  });
}

function adjustMaxHeight(
  labels: IText[],
  selfIndex: number,
  bounds: { x1: number; x2: number; y1: number; y2: number }
) {
  const siblings = [];
  if (labels.length >= 3) {
    const { prevLabel, nextLabel } = findSiblingLabels(labels, selfIndex);

    siblings.push(prevLabel, nextLabel);
  } else if (labels.length === 2) {
    siblings.push(labels[selfIndex === 0 ? 1 : 0]);
  }
  const label = labels[selfIndex];

  let heightLimit = Math.min(Math.abs(label.attribute.y - bounds.y1), Math.abs(label.attribute.y - bounds.y2));

  siblings.forEach(sibling => {
    heightLimit = Math.min(heightLimit, Math.abs(sibling.attribute.y - label.attribute.y));
  });

  if (heightLimit > 0) {
    label.setAttributes({ whiteSpace: 'normal', heightLimit });
  }
}
/**
 * 基于所有的标签初始化未知已经布局在圆的边缘
 * @param labels
 * @param labelPoints
 * @param config
 */
export function circleAutoLimit(labels: IText[], config: WrapConfig) {
  const { ellipsis, inside, bounds, autoWrap, center } = config;

  if (!inside) {
    // TODO inside label暂不处理，现在应该没有类似的需求
    labels.forEach((label, index) => {
      const { x, y } = label.attribute;
      const b = label.AABBBounds;

      if (isNumberClose(x, center.x)) {
        if (y > bounds.y2 || y < bounds.y1) {
          adjustMaxLineWidth(label, 0, ellipsis);
          return;
        }

        const boxWidth = bounds.x2 - bounds.x1;
        // 12点和6点钟方向对应的label
        if (labels.length >= 3) {
          // 这里其实有一个前提：所有的label都是按照顺时针或者逆时针排序好的
          const { prevLabel, nextLabel } = findSiblingLabels(labels, index);
          let leftX = prevLabel.attribute.x;
          let rightX = nextLabel.attribute.x;

          if (leftX > rightX) {
            leftX = nextLabel.attribute.x;
            rightX = prevLabel.attribute.x;
          }

          const maxWidth =
            leftX === rightX
              ? boxWidth
              : x >= leftX && x <= rightX
              ? rightX - leftX
              : Math.min(Math.abs(leftX - x), Math.abs(rightX - x));
          if (label.AABBBounds.width() > maxWidth) {
            adjustMaxLineWidth(label, maxWidth, ellipsis);
          }
        } else if (label.AABBBounds.width() > boxWidth) {
          adjustMaxLineWidth(label, boxWidth, ellipsis);
        }
      } else if (x > center.x && b.x2 > bounds.x2) {
        adjustMaxLineWidth(label, bounds.x2 - x, ellipsis);
        autoWrap && adjustMaxHeight(labels, index, bounds);
      } else if (x < center.x && b.x1 < bounds.x1) {
        adjustMaxLineWidth(label, x - bounds.x1, ellipsis);
        autoWrap && adjustMaxHeight(labels, index, bounds);
      }
    });
  }
}
