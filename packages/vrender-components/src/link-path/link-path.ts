/**
 * @description 桑基图Link组件，也适用于其他有宽度的连边展示
 * @author 康晓婷
 */
import type { IGroup, IPath } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { LinkPathAttributes } from './type';
import type { ComponentOptions } from '../interface';
import { loadLinkPathComponent } from './register';

export const getHorizontalPath = (options: LinkPathAttributes, ratio?: number) => {
  let x0 = options.x0;
  let x1 = options.x1;
  const thickness = typeof ratio === 'number' ? options.thickness * ratio : options.thickness;
  let y00 = options.y0 - options.thickness / 2;
  let y10 = options.y1 - options.thickness / 2;

  if (options.align === 'center') {
    y00 = options.y0 - thickness / 2;
    y10 = options.y1 - thickness / 2;
  } else if (options.align === 'end') {
    y00 = options.y0 + options.thickness / 2 - thickness;
    y10 = options.y1 + options.thickness / 2 - thickness;
  }

  let midX = (x0 + x1) / 2;
  let y01 = y00 + thickness;
  let y11 = y10 + thickness;

  if (options.round) {
    x0 = Math.round(x0);
    x1 = Math.round(x1);
    y00 = Math.round(y00);
    y10 = Math.round(y10);
    y01 = Math.round(y01);
    y11 = Math.round(y11);
    midX = Math.round(midX);
  }

  const hasLength = Math.abs(x1 - x0) > 1e-6;
  const endArrowPath =
    options.endArrow && hasLength
      ? `L${x1},${y10 - thickness / 2}L${x1 + thickness},${(y10 + y11) / 2}L${x1},${y11 + thickness / 2}`
      : '';
  const startArrowPath =
    options.startArrow && hasLength
      ? `L${x0},${y01 + thickness / 2}L${x0 - thickness},${(y00 + y01) / 2}L${x0},${y00 - thickness / 2}`
      : '';

  if (options.isSmooth === false) {
    return `M${x0},${y00}L${x1},${y10}${endArrowPath}L${x1},${y11}L${x0},${y01}${startArrowPath}Z`;
  }

  return `M${x0},${y00}
  C${midX},${y00},${midX},${y10},${x1},${y10}
  ${endArrowPath}
  L${x1},${y11}
  C${midX},${y11},${midX},${y01},${x0},${y01}
  ${startArrowPath}
  Z`;
};

export const getVerticalPath = (options: LinkPathAttributes, ratio?: number) => {
  let y0 = options.y0;
  let y1 = options.y1;
  let x00 = options.x0 - options.thickness / 2;
  let x10 = options.x1 - options.thickness / 2;
  const thickness = typeof ratio === 'number' ? options.thickness * ratio : options.thickness;

  if (options.align === 'center') {
    x00 = options.x0 - thickness / 2;
    x10 = options.x1 - thickness / 2;
  } else if (options.align === 'end') {
    x00 = options.x0 + options.thickness / 2 - thickness;
    x10 = options.x1 + options.thickness / 2 - thickness;
  }

  let midY = (y0 + y1) / 2;
  let x01 = x00 + thickness;
  let x11 = x10 + thickness;

  if (options.round) {
    y0 = Math.round(y0);
    y1 = Math.round(y1);
    x00 = Math.round(x00);
    x10 = Math.round(x10);
    x01 = Math.round(x01);
    x11 = Math.round(x11);
    midY = Math.round(midY);
  }

  const hasLength = Math.abs(y1 - y0) > 1e-6;
  const endArrowPath =
    options.endArrow && hasLength
      ? `L${x10 - thickness / 2},${y1}L${(x10 + x11) / 2},${y1 + thickness}L${x11 + thickness / 2},${y1}`
      : '';
  const startArrowPath =
    options.startArrow && hasLength
      ? `L${x01 + thickness / 2},${y0}L${(x01 + x00) / 2},${y0 - thickness}L${x00 - thickness / 2},${y0}`
      : '';

  if (options.isSmooth === false) {
    return `M${x00},${y0}L${x10},${y1}${endArrowPath}L${x11},${y1}L${x01},${y0}${startArrowPath}Z`;
  }
  return `M${x00},${y0}
  C${x00},${midY},${x10},${midY},${x10},${y1}
  ${endArrowPath}
  L${x11},${y1}
  C${x11},${midY},${x01},${midY},${x01},${y0}
  ${startArrowPath}
  Z`;
};

loadLinkPathComponent();

export class LinkPath extends AbstractComponent<Required<LinkPathAttributes>> {
  static defaultAttributes = {
    direction: 'horizontal',
    align: 'start'
  };

  private _container!: IGroup;

  private _backPath?: IPath;
  private _frontPath?: IPath;

  constructor(attributes: LinkPathAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, LinkPath.defaultAttributes, attributes));
  }

  protected render() {
    const { direction = 'horizontal' } = this.attribute as LinkPathAttributes;
    const parsePath = direction === 'vertical' ? getVerticalPath : getHorizontalPath;
    const isRatioShow =
      typeof this.attribute.ratio === 'number' && this.attribute.ratio >= 0 && this.attribute.ratio <= 1;
    const groupAttrKeys = [
      'direction',
      'x0',
      'x1',
      'y0',
      'y1',
      'thickness',
      'round',
      'ratio',
      'align',
      'isSmooth',
      'backgroudStyle'
    ];
    const commonStyle: any = {};
    Object.keys(this.attribute).forEach(key => {
      if (!groupAttrKeys.includes(key)) {
        commonStyle[key] = (this.attribute as any)[key];
      }
    });

    if (isRatioShow) {
      const background = this.createOrUpdateChild(
        'sankey-link-background',
        Object.assign({}, commonStyle, this.attribute.backgroudStyle, {
          path: parsePath(this.attribute as LinkPathAttributes, 1),
          visible: true,
          pickable: false,
          zIndex: -1
        }),
        'path'
      ) as IPath;
      this._backPath = background;
    } else if (this._backPath) {
      this._backPath.setAttribute('visible', false);
    }

    const front = this.createOrUpdateChild(
      'sankey-link-front',
      Object.assign({}, commonStyle, {
        path: parsePath(this.attribute as LinkPathAttributes, isRatioShow ? this.attribute.ratio : 1),
        pickable: false
      }),
      'path'
    ) as IPath;
    this._frontPath = front;
  }
}
