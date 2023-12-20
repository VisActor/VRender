import type { IText } from '@visactor/vrender-core';

export function alignAxisLabels(labels: IText[], start: number, containerSize: number, orient: string, align: string) {
  if (orient === 'right' || orient === 'left') {
    if (align === 'left') {
      const flag = orient === 'right' ? 0 : -1;
      labels.forEach(label => {
        label.setAttributes({
          x: start + containerSize * flag,
          textAlign: 'left'
        });
      });
    } else if (align === 'right') {
      const flag = orient === 'right' ? 1 : 0;
      labels.forEach(label => {
        label.setAttributes({
          x: start + containerSize * flag,
          textAlign: 'right'
        });
      });
    } else if (align === 'center') {
      const flag = orient === 'right' ? 1 : -1;
      labels.forEach(label => {
        label.setAttributes({
          x: start + containerSize * 0.5 * flag,
          textAlign: 'center'
        });
      });
    }
  } else if (orient === 'bottom' || orient === 'top') {
    if (align === 'top') {
      const flag = orient === 'bottom' ? 0 : -1;
      labels.forEach(label => {
        label.setAttributes({
          y: start + containerSize * flag,
          textBaseline: 'top'
        });
      });
    } else if (align === 'bottom') {
      const flag = orient === 'bottom' ? 1 : 0;
      labels.forEach(label => {
        label.setAttributes({
          y: start + containerSize * flag,
          textBaseline: 'bottom'
        });
      });
    } else if (align === 'middle') {
      const flag = orient === 'bottom' ? 1 : -1;
      labels.forEach(label => {
        label.setAttributes({
          y: start + containerSize * 0.5 * flag,
          textBaseline: 'middle'
        });
      });
    }
  }
}
