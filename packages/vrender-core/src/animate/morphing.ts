import {
  splitArc,
  splitCircle,
  splitLine,
  splitRect,
  splitPolygon,
  splitArea,
  splitPath
} from './../common/split-path';
import type {
  ICustomPath2D,
  IGraphic,
  MorphingAnimateConfig,
  IRect,
  EasingType,
  MultiMorphingAnimateConfig,
  IArc,
  ICircle,
  IGraphicAttribute,
  ILine,
  IPolygon,
  IArea,
  IPath
} from './../interface';
import { CustomPath2D } from '../common/custom-path2d';
import { ACustomAnimate } from './animate';
import {
  alignBezierCurves,
  applyTransformOnBezierCurves,
  findBestMorphingRotation,
  pathToBezierCurves
} from '../common/morphing-utils';
import { application } from '../application';
import type { IMatrix } from '@visactor/vutils';
import { isNil } from '@visactor/vutils';
import { interpolateColor } from '../color-string/interpolate';
import { ColorStore, ColorType } from '../color-string';
import { DefaultMorphingAnimateConfig } from './config';
import { isTransformKey } from '../common/utils';
import { AttributeUpdateType } from '../common/enums';

declare const __DEV__: boolean;

interface MorphingDataItem {
  from: number[];
  to: number[];
  fromCp: number[];
  toCp: number[];
  rotation: number;
}

interface OtherAttrItem {
  from: any;
  to: any;
  key: string;
}

const interpolateOtherAttrs = (attrs: OtherAttrItem[], out: any, ratio: number) => {
  attrs.forEach(entry => {
    if (Number.isFinite(entry.to)) {
      out[entry.key] = entry.from + (entry.to - entry.from) * ratio;
    } else if (entry.key === 'fill' || entry.key === 'stroke') {
      // 保存解析的结果到step
      const color = interpolateColor(entry.from, entry.to, ratio, false);
      if (color) {
        out[entry.key] = color;
      }
    }
  });
};

/* Adapted from zrender by ecomfe
 * https://github.com/ecomfe/zrender
 * Licensed under the BSD-3-Clause

 * url: https://github.com/ecomfe/zrender/blob/master/src/tool/morphPath.ts
 * License: https://github.com/ecomfe/zrender/blob/master/LICENSE
 * @license
 */
const interpolateMorphingData = (morphingData: MorphingDataItem[], path: ICustomPath2D, ratio: number) => {
  const tmpArr: number[] = [];
  const newCp: number[] = [];
  path.clear();

  for (let i = 0; i < morphingData.length; i++) {
    const item = morphingData[i];
    const from = item.from;
    const to = item.to;
    const angle = item.rotation * ratio;
    const fromCp = item.fromCp;
    const toCp = item.toCp;
    const sa = Math.sin(angle);
    const ca = Math.cos(angle);

    newCp[0] = fromCp[0] + (toCp[0] - fromCp[0]) * ratio;
    newCp[1] = fromCp[1] + (toCp[1] - fromCp[1]) * ratio;

    for (let m = 0; m < from.length; m += 2) {
      const x0 = from[m];
      const y0 = from[m + 1];
      const x1 = to[m];
      const y1 = to[m + 1];

      const x = x0 * (1 - ratio) + x1 * ratio;
      const y = y0 * (1 - ratio) + y1 * ratio;

      tmpArr[m] = x * ca - y * sa + newCp[0];
      tmpArr[m + 1] = x * sa + y * ca + newCp[1];
    }

    let x0 = tmpArr[0];
    let y0 = tmpArr[1];

    path.moveTo(x0, y0);

    for (let m = 2; m < from.length; m += 6) {
      const x1 = tmpArr[m];
      const y1 = tmpArr[m + 1];
      const x2 = tmpArr[m + 2];
      const y2 = tmpArr[m + 3];
      const x3 = tmpArr[m + 4];
      const y3 = tmpArr[m + 5];

      // Is a line.
      if (x0 === x1 && y0 === y1 && x2 === x3 && y2 === y3) {
        path.lineTo(x3, y3);
      } else {
        path.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      }
      x0 = x3;
      y0 = y3;
    }
  }
};

const parseMorphingData = (
  fromPath: ICustomPath2D | null,
  toPath: ICustomPath2D,
  config?: {
    fromTransform?: IMatrix;
    toTransfrom: IMatrix;
  }
) => {
  const fromBezier = fromPath ? pathToBezierCurves(fromPath) : [];
  const toBezier = pathToBezierCurves(toPath);

  if (config && fromBezier) {
    config.fromTransform && applyTransformOnBezierCurves(fromBezier, config.fromTransform.clone().getInverse());
    applyTransformOnBezierCurves(fromBezier, config.toTransfrom);
    // applyTransformOnBezierCurves(toBezier, config.toTransfrom.clone().getInverse());
  }

  const [fromBezierCurves, toBezierCurves] = alignBezierCurves(fromBezier, toBezier);

  return fromPath
    ? findBestMorphingRotation(fromBezierCurves, toBezierCurves, 10, Math.PI)
    : toBezierCurves.map((to, index) => {
        return {
          from: fromBezierCurves[index],
          to,
          fromCp: [0, 0],
          toCp: [0, 0],
          rotation: 0
        };
      });
};

const validateOtherAttrs = [
  'fill',
  'fillOpacity',
  'shadowBlur',
  'shadowColor',
  'shadowOffsetX',
  'shadowOffsetY',
  'stroke',
  'strokeOpacity',
  'lineDashOffset'
  // 'lineWidth'
];

const parseOtherAnimateAttrs = (
  fromAttrs: Partial<IGraphicAttribute> | null,
  toAttrs: Partial<IGraphicAttribute> | null
) => {
  if (!fromAttrs || !toAttrs) {
    return null;
  }
  const res: OtherAttrItem[] = [];
  let hasAttr = false;

  Object.keys(fromAttrs).forEach(fromKey => {
    if (!validateOtherAttrs.includes(fromKey)) {
      return;
    }

    const toValue = toAttrs[fromKey];
    if (!isNil(toValue) && !isNil(fromAttrs[fromKey]) && toValue !== fromAttrs[fromKey]) {
      if (fromKey === 'fill' || fromKey === 'stroke') {
        res.push({
          from:
            typeof fromAttrs[fromKey] === 'string'
              ? ColorStore.Get(fromAttrs[fromKey] as unknown as string, ColorType.Color255)
              : fromAttrs[fromKey],
          to: typeof toValue === 'string' ? ColorStore.Get(toValue as string, ColorType.Color255) : toValue,
          key: fromKey
        });
      } else {
        res.push({ from: fromAttrs[fromKey], to: toValue, key: fromKey });
      }

      hasAttr = true;
    }
  });

  return hasAttr ? res : null;
};

export class MorphingPath extends ACustomAnimate<number> {
  declare path: CustomPath2D;

  saveOnEnd?: boolean;
  otherAttrs?: OtherAttrItem[];

  constructor(
    config: { morphingData: MorphingDataItem[]; otherAttrs?: OtherAttrItem[]; saveOnEnd?: boolean },
    duration: number,
    easing: EasingType
  ) {
    super(0, 1, duration, easing);
    this.morphingData = config.morphingData;
    this.otherAttrs = config.otherAttrs;
    this.saveOnEnd = config.saveOnEnd;
  }

  private morphingData?: MorphingDataItem[];

  getEndProps(): Record<string, any> {
    return {};
  }

  onBind(): void {
    (this.target as IGraphic).createPathProxy();
    this.onUpdate(false, 0, (this.target as IGraphic).attribute);
  }

  onEnd(): void {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const target = this.target as IGraphic;
    const pathProxy = typeof target.pathProxy === 'function' ? target.pathProxy(target.attribute) : target.pathProxy;
    interpolateMorphingData(this.morphingData, pathProxy, ratio);
    if (this.otherAttrs && this.otherAttrs.length) {
      interpolateOtherAttrs(this.otherAttrs, out, ratio);
    }
    // 计算位置
    if (end && !this.saveOnEnd) {
      (this.target as IGraphic).pathProxy = null;
    }
  }
}

export const morphPath = (
  fromGraphic: IGraphic | null,
  toGraphic: IGraphic,
  animationConfig?: MorphingAnimateConfig,
  fromGraphicTransform?: IMatrix
) => {
  if (fromGraphic && (!fromGraphic.valid || !fromGraphic.toCustomPath)) {
    if (__DEV__) {
      console.error(fromGraphic, ' is not validate');
    }
    return null;
  }

  if (!toGraphic.valid || !toGraphic.toCustomPath) {
    if (__DEV__) {
      console.error(toGraphic, ' is not validate');
    }
    return null;
  }

  let fromTransform = fromGraphic?.globalTransMatrix;

  if (fromGraphicTransform && fromTransform) {
    fromTransform = fromGraphicTransform
      .clone()
      .multiply(fromTransform.a, fromTransform.b, fromTransform.c, fromTransform.d, fromTransform.e, fromTransform.f);
  }
  const morphingData = parseMorphingData(fromGraphic?.toCustomPath?.(), toGraphic.toCustomPath(), {
    fromTransform,
    toTransfrom: toGraphic.globalTransMatrix
  });

  const attrs = parseOtherAnimateAttrs(fromGraphic?.attribute, toGraphic.attribute);
  const animate = toGraphic.animate(animationConfig);

  if (animationConfig?.delay) {
    animate.wait(animationConfig.delay);
  }

  animate.play(
    new MorphingPath(
      { morphingData, otherAttrs: attrs },
      animationConfig?.duration ?? DefaultMorphingAnimateConfig.duration,
      animationConfig?.easing ?? DefaultMorphingAnimateConfig.easing
    )
  );

  return animate;
};

export const oneToMultiMorph = (
  fromGraphic: IGraphic,
  toGraphics: IGraphic[],
  animationConfig?: MultiMorphingAnimateConfig
) => {
  const validateToGraphics = toGraphics.filter(graphic => graphic && graphic.toCustomPath && graphic.valid);
  if (!validateToGraphics.length) {
    if (__DEV__) {
      console.error(validateToGraphics, ' is not validate');
    }
  }

  if (!fromGraphic.valid || !fromGraphic.toCustomPath) {
    if (__DEV__) {
      console.error(fromGraphic, ' is not validate');
    }
  }

  const childGraphics: IGraphic[] = (
    animationConfig?.splitPath === 'clone' ? cloneGraphic : animationConfig?.splitPath ?? splitGraphic
  )(fromGraphic, validateToGraphics.length, false);

  const oldOnEnd = animationConfig?.onEnd;
  let count = validateToGraphics.length;
  const onEachEnd = () => {
    count--;
    if (count === 0 && oldOnEnd) {
      oldOnEnd();
    }
  };

  validateToGraphics.forEach((toChild, index) => {
    const fromChild = childGraphics[index];
    const delay =
      (animationConfig?.delay ?? 0) +
      (animationConfig?.individualDelay
        ? animationConfig.individualDelay(index, validateToGraphics.length, fromChild, toChild)
        : 0);
    morphPath(
      fromChild,
      toChild,
      Object.assign({}, animationConfig, { onEnd: onEachEnd, delay }),
      fromGraphic.globalTransMatrix
    );
  });
};

export class MultiToOneMorphingPath extends ACustomAnimate<number> {
  declare path: CustomPath2D;

  otherAttrs?: OtherAttrItem[][];

  constructor(
    config: { morphingData: MorphingDataItem[][]; otherAttrs?: OtherAttrItem[][] },
    duration: number,
    easing: EasingType
  ) {
    super(0, 1, duration, easing);
    this.morphingData = config.morphingData;
    this.otherAttrs = config.otherAttrs;
  }

  private morphingData?: MorphingDataItem[][];

  getEndProps(): Record<string, any> {
    return {};
  }

  onBind(): void {
    this.addPathProxy();
  }

  private addPathProxy() {
    const shadowRoot = (this.target as IGraphic).shadowRoot;

    shadowRoot.forEachChildren(child => {
      (child as IGraphic).createPathProxy();
    });

    this.onUpdate(false, 0, (this.target as IGraphic).attribute);
  }

  private clearPathProxy() {
    const shadowRoot = (this.target as IGraphic).shadowRoot;

    shadowRoot.forEachChildren(child => {
      (child as IGraphic).pathProxy = null;
    });
  }

  onEnd(): void {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const shadowRoot = (this.target as IGraphic).shadowRoot;

    shadowRoot.forEachChildren((child: IGraphic, index) => {
      interpolateMorphingData(
        this.morphingData[index],
        typeof child.pathProxy === 'function' ? child.pathProxy(child.attribute) : child.pathProxy,
        ratio
      );

      if (this.otherAttrs?.[index] && this.otherAttrs[index].length) {
        interpolateOtherAttrs(this.otherAttrs[index], child.attribute, ratio);
      }
    });

    // 计算位置
    if (end) {
      this.clearPathProxy();
      this.morphingData = null;
    }
  }
}

const parseShadowChildAttrs = (graphicAttrs: Partial<IGraphicAttribute>) => {
  const attrs: Partial<IGraphicAttribute> = {};

  Object.keys(graphicAttrs).forEach(key => {
    if (!isTransformKey(key)) {
      attrs[key] = graphicAttrs[key];
    }
  });

  // if (attrs.fill == null) {
  //   attrs.fill = !!attrs.fillColor;
  // }
  // if (attrs.stroke == null) {
  //   attrs.stroke = !!attrs.strokeColor;
  // }

  return attrs;
};

const appendShadowChildrenToGraphic = (graphic: IGraphic, children: IGraphic[], count: number) => {
  const childAttrs = parseShadowChildAttrs(graphic.attribute);
  const shadowRoot = graphic.attachShadow();

  if (children.length) {
    shadowRoot.setTheme({
      [children[0].type]: childAttrs
    });
    children.forEach(element => {
      element.setAttributes({ pickable: false });
      shadowRoot.appendChild(element);
    });
  } else {
    const box = graphic.AABBBounds;
    const width = box.width();
    const height = box.height();

    shadowRoot.setTheme({
      rect: childAttrs
    });
    new Array(count).fill(0).forEach(el => {
      const child = application.graphicService.creator.rect({
        x: 0,
        y: 0,
        width,
        height: height,
        pickable: false
      });
      shadowRoot.appendChild(child);
      children.push(child);
    });
  }
};

export const cloneGraphic = (graphic: IGraphic, count: number, needAppend?: boolean) => {
  const children: IGraphic[] = [];
  const childAttrs = needAppend ? null : parseShadowChildAttrs(graphic.attribute);
  const path = graphic.toCustomPath();

  for (let i = 0; i < count; i++) {
    const element = {
      path: new CustomPath2D().fromCustomPath2D(path)
    };

    children.push(
      application.graphicService.creator.path(needAppend ? element : Object.assign({}, childAttrs, element))
    );
  }

  if (needAppend) {
    appendShadowChildrenToGraphic(graphic, children, count);
  }

  return children;
};

export const splitGraphic = (graphic: IGraphic, count: number, needAppend?: boolean) => {
  const children: IGraphic[] = [];
  const childAttrs = needAppend ? null : parseShadowChildAttrs(graphic.attribute);

  if (graphic.type === 'rect') {
    const childrenAttrs = splitRect(graphic as IRect, count);
    childrenAttrs.forEach(element => {
      children.push(
        application.graphicService.creator.rect(needAppend ? element : Object.assign({}, childAttrs, element))
      );
    });
  } else if (graphic.type === 'arc') {
    const childrenAttrs = splitArc(graphic as IArc, count);
    childrenAttrs.forEach(element => {
      children.push(
        application.graphicService.creator.arc(needAppend ? element : Object.assign({}, childAttrs, element))
      );
    });
  } else if (graphic.type === 'circle') {
    const childrenAttrs = splitCircle(graphic as ICircle, count);
    childrenAttrs.forEach(element => {
      children.push(
        application.graphicService.creator.arc(needAppend ? element : Object.assign({}, childAttrs, element))
      );
    });
  } else if (graphic.type === 'line') {
    const childrenAttrs = splitLine(graphic as ILine, count);
    const defaultSymbol = { size: 10, symbolType: 'circle' };

    childrenAttrs.forEach(element => {
      children.push(
        application.graphicService.creator.symbol(
          needAppend ? Object.assign({}, element, defaultSymbol) : Object.assign({}, childAttrs, element, defaultSymbol)
        )
      );
    });
  } else if (graphic.type === 'polygon') {
    const childrenAttrs = splitPolygon(graphic as IPolygon, count);
    childrenAttrs.forEach(element => {
      children.push(
        application.graphicService.creator.polygon(needAppend ? element : Object.assign({}, childAttrs, element))
      );
    });
  } else if (graphic.type === 'area') {
    const childrenAttrs = splitArea(graphic as IArea, count);
    childrenAttrs.forEach(element => {
      children.push(
        application.graphicService.creator.polygon(needAppend ? element : Object.assign({}, childAttrs, element))
      );
    });
  } else if (graphic.type === 'path') {
    const childrenAttrs = splitPath(graphic as IPath, count);
    childrenAttrs.forEach(element => {
      if ('path' in element) {
        children.push(
          application.graphicService.creator.path(needAppend ? element : Object.assign({}, childAttrs, element))
        );
      } else {
        children.push(
          application.graphicService.creator.polygon(needAppend ? element : Object.assign({}, childAttrs, element))
        );
      }
    });
  }

  if (needAppend) {
    appendShadowChildrenToGraphic(graphic, children, count);
  }

  return children;
};

/**
 * 多对一动画
 * @param fromGraphics
 * @param toGraphic
 * @param animationConfig
 */
export const multiToOneMorph = (
  fromGraphics: IGraphic[],
  toGraphic: IGraphic,
  animationConfig?: MultiMorphingAnimateConfig
) => {
  const validateFromGraphics = fromGraphics.filter(graphic => graphic.toCustomPath && graphic.valid);
  if (!validateFromGraphics.length) {
    if (__DEV__) {
      console.error(fromGraphics, ' is not validate');
    }
  }

  if (!toGraphic.valid || !toGraphic.toCustomPath) {
    if (__DEV__) {
      console.error(toGraphic, ' is not validate');
    }
  }

  const childGraphics: IGraphic[] = (
    animationConfig?.splitPath === 'clone' ? cloneGraphic : animationConfig?.splitPath ?? splitGraphic
  )(toGraphic, validateFromGraphics.length, true);

  const toAttrs = toGraphic.attribute;
  toGraphic.setAttribute('visible', false);

  const morphingData = validateFromGraphics.map((graphic, index) => {
    return parseMorphingData(graphic.toCustomPath(), childGraphics[index].toCustomPath(), {
      fromTransform: graphic.globalTransMatrix,
      toTransfrom: childGraphics[index].globalTransMatrix
    });
  });
  const otherAttrs = validateFromGraphics.map((graphic, index) => {
    return parseOtherAnimateAttrs(graphic.attribute, toAttrs);
  });

  if (animationConfig?.individualDelay) {
    const oldOnEnd = animationConfig.onEnd;
    let count = validateFromGraphics.length;
    const onEachEnd = () => {
      count--;
      if (count === 0) {
        toGraphic.setAttributes({ visible: true, ratio: null } as any, false, {
          type: AttributeUpdateType.ANIMATE_END
        });
        toGraphic.detachShadow();
        if (oldOnEnd) {
          oldOnEnd();
        }
      }
    };
    childGraphics.forEach((to, index) => {
      const delay =
        (animationConfig.delay ?? 0) +
        animationConfig.individualDelay(index, validateFromGraphics.length, fromGraphics[index], to);
      const animate = to.animate(Object.assign({}, animationConfig, { onEnd: onEachEnd }));
      animate.wait(delay);

      animate.play(
        new MorphingPath(
          {
            morphingData: morphingData[index],
            saveOnEnd: true,
            otherAttrs: otherAttrs[index]
          },
          animationConfig.duration ?? DefaultMorphingAnimateConfig.duration,
          animationConfig.easing ?? DefaultMorphingAnimateConfig.easing
        )
      );
    });
  } else {
    const oldOnEnd = animationConfig?.onEnd;
    const config = animationConfig ? Object.assign({}, animationConfig) : {};

    config.onEnd = () => {
      toGraphic.setAttribute('visible', true, false, { type: AttributeUpdateType.ANIMATE_END });
      toGraphic.detachShadow();

      if (oldOnEnd) {
        oldOnEnd();
      }
    };

    const animate = toGraphic.animate(config);

    if (animationConfig?.delay) {
      animate.wait(animationConfig.delay);
    }

    animate.play(
      new MultiToOneMorphingPath(
        { morphingData, otherAttrs },
        animationConfig?.duration ?? DefaultMorphingAnimateConfig.duration,
        animationConfig?.easing ?? DefaultMorphingAnimateConfig.easing
      )
    );
  }
};
