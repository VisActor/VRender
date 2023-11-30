import type { OrientType } from '../interface';

export function getSizeHandlerPath(align: OrientType = 'bottom') {
  let centerX = 0;
  const centerY = 0;
  const upperHalf = 3.5;
  const leftHalf = 2.5;
  const arrowY = 6;

  if (align === 'top') {
    return `
    M${centerX},${centerY - arrowY}L${centerX - upperHalf},${centerY - leftHalf}
    v${2 * leftHalf}
    h${2 * upperHalf}
    v${-2 * leftHalf}
    Z
`;
  }

  if (align === 'left') {
    centerX = 1;
    return `
    M${centerX - arrowY},${centerY}L${centerX - arrowY + leftHalf},${centerY - upperHalf}
    h${2 * leftHalf}
    v${2 * upperHalf}
    h${-2 * leftHalf}
    Z
`;
  }

  if (align === 'right') {
    centerX = -1;

    return `
    M${centerX + arrowY},${centerY}L${centerX + arrowY - leftHalf},${centerY - upperHalf}
    h${-2 * leftHalf}
    v${2 * upperHalf}
    h${2 * leftHalf}
    Z
  `;
  }

  return `
    M${centerX},${centerY + arrowY}L${centerX - upperHalf},${centerY + leftHalf}
    v${-2 * leftHalf}
    h${2 * upperHalf}
    v${2 * leftHalf}
    Z
`;
}
