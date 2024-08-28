import type { IText } from '@visactor/vrender-core';

export function alignAxisLabels(labels: IText[], start: number, containerSize: number, orient: string, align: string) {
  if (orient === 'left' || orient === 'right') {
    if (align === 'left') {
      labels.forEach(label => {
        label.setAttributes({
          dx: (label.attribute.dx ?? 0) + start - label.AABBBounds.x1
        });
      });
    } else if (align === 'right') {
      labels.forEach(label => {
        label.setAttributes({
          dx: (label.attribute.dx ?? 0) + start + containerSize - label.AABBBounds.x2
        });
      });
    } else if (align === 'center') {
      labels.forEach(label => {
        label.setAttributes({
          dx: (label.attribute.dx ?? 0) + start + containerSize / 2 - (label.AABBBounds.x1 + label.AABBBounds.x2) / 2
        });
      });
    }
  } else if (orient === 'bottom' || orient === 'top') {
    if (align === 'top') {
      labels.forEach(label => {
        label.setAttributes({
          dy: (label.attribute.dy ?? 0) + start - label.AABBBounds.y1
        });
      });
    } else if (align === 'bottom') {
      labels.forEach(label => {
        label.setAttributes({
          dy: (label.attribute.dy ?? 0) + start + containerSize - label.AABBBounds.y2
        });
      });
    } else if (align === 'middle') {
      labels.forEach(label => {
        label.setAttributes({
          dy: (label.attribute.dy ?? 0) + start + containerSize / 2 - (label.AABBBounds.y1 + label.AABBBounds.y2) / 2
        });
      });
    }
  }
}
