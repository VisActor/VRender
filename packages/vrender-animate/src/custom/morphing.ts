import {
  splitArc,
  splitCircle,
  splitLine,
  splitRect,
  splitPolygon,
  splitArea,
  splitPath,
  CustomPath2D,
  application,
  interpolateColor,
  ColorStore,
  ColorType,
  alignBezierCurves,
  applyTransformOnBezierCurves,
  findBestMorphingRotation,
  pathToBezierCurves,
  AttributeUpdateType,
  type MorphingAnimateConfig,
  type MultiMorphingAnimateConfig,
  type ICustomPath2D,
  type IGraphic,
  type IRect,
  type EasingType,
  type IArc,
  type ICircle,
  type IGraphicAttribute,
  type ILine,
  type IPolygon,
  type IArea,
  type IPath
} from '@visactor/vrender-core';
import { isArray, isNil, type IMatrix } from '@visactor/vutils';
import { ACustomAnimate } from './custom-animate';
import { DefaultMorphingAnimateConfig } from '../config/morphing';
import { isTransformKey } from '../utils/transform';

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

/**
 * 插值计算非路径属性（如颜色、透明度等）
 * @param attrs 要插值的属性数组
 * @param out 输出对象
 * @param ratio 插值比例
 */
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
/**
 * 根据给定比例插值计算形变数据并应用到路径
 * @param morphingData 形变数据
 * @param path 目标路径对象
 * @param ratio 插值比例
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

/**
 * 解析形变数据，将源路径和目标路径转换为贝塞尔曲线并找到最佳旋转角度
 * @param fromPath 源路径
 * @param toPath 目标路径
 * @param config 变换配置
 * @returns 形变数据数组
 */
const parseMorphingData = (
  fromPath: ICustomPath2D | null,
  toPath: ICustomPath2D,
  config?: {
    fromTransform?: IMatrix;
    toTransfrom: IMatrix;
  }
) => {
  // [fromPath, toPath] = [toPath, fromPath];
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

/**
 * 解析可动画属性，提取源属性和目标属性的差异
 * @param fromAttrs 源属性
 * @param toAttrs 目标属性
 * @returns 可动画属性数组
 */
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

    const toValue = (toAttrs as any)[fromKey];
    if (!isNil(toValue) && !isNil((fromAttrs as any)[fromKey]) && toValue !== (fromAttrs as any)[fromKey]) {
      if (fromKey === 'fill' || fromKey === 'stroke') {
        const parseColor = (color: string) => {
          return typeof color === 'string' ? ColorStore.Get(color, ColorType.Color255) : color;
        };
        res.push({
          from: isArray(fromAttrs[fromKey])
            ? fromAttrs[fromKey].map(parseColor)
            : parseColor((fromAttrs as any)[fromKey]),
          to: isArray(toValue) ? toValue.map(parseColor) : parseColor(toValue),
          key: fromKey
        });
      } else {
        res.push({ from: (fromAttrs as any)[fromKey], to: toValue, key: fromKey });
      }

      hasAttr = true;
    }
  });

  return hasAttr ? res : null;
};

/**
 * 形变路径动画类，用于处理路径和其他属性的形变
 */
export class MorphingPath extends ACustomAnimate<Record<string, any>> {
  declare path: CustomPath2D;

  saveOnEnd?: boolean;
  otherAttrs?: OtherAttrItem[];

  constructor(
    config: { morphingData: MorphingDataItem[]; otherAttrs?: OtherAttrItem[]; saveOnEnd?: boolean },
    duration: number,
    easing: EasingType
  ) {
    super({}, {}, duration, easing);
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

  /**
   * 更新动画状态
   * @param end 是否结束
   * @param ratio 动画进度比例
   * @param out 输出属性对象
   */
  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const target = this.target as IGraphic;
    const pathProxy = typeof target.pathProxy === 'function' ? target.pathProxy(target.attribute) : target.pathProxy;
    interpolateMorphingData(this.morphingData, pathProxy, ratio);
    if (this.otherAttrs && this.otherAttrs.length) {
      interpolateOtherAttrs(this.otherAttrs, out, ratio);
    }
    this.target.setAttributes(out);
    // 计算位置
    if (end && !this.saveOnEnd) {
      (this.target as IGraphic).pathProxy = null;
    }
  }
}

/**
 * 创建从一个图形到另一个图形的形变动画
 * @param fromGraphic 源图形
 * @param toGraphic 目标图形
 * @param animationConfig 动画配置
 * @param fromGraphicTransform 源图形变换矩阵
 * @returns 动画实例
 */
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

  const morphingPath = new MorphingPath(
    { morphingData, otherAttrs: attrs },
    animationConfig?.duration ?? DefaultMorphingAnimateConfig.duration,
    animationConfig?.easing ?? DefaultMorphingAnimateConfig.easing
  );
  animate.play(morphingPath);

  return animate;
};

/**
 * 创建从一个图形到多个图形的形变动画
 * @param fromGraphic 源图形
 * @param toGraphics 目标图形数组
 * @param animationConfig 动画配置
 */
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

/**
 * 多对一形变路径动画类，用于处理多个路径形变为一个目标路径
 */
export class MultiToOneMorphingPath extends ACustomAnimate<Record<string, any>> {
  declare path: CustomPath2D;

  otherAttrs?: OtherAttrItem[][];

  constructor(
    config: { morphingData: MorphingDataItem[][]; otherAttrs?: OtherAttrItem[][] },
    duration: number,
    easing: EasingType
  ) {
    super({}, {}, duration, easing);
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

  /**
   * 为每个子图形添加路径代理
   */
  private addPathProxy() {
    const shadowRoot = (this.target as IGraphic).shadowRoot;

    shadowRoot.forEachChildren(child => {
      (child as IGraphic).createPathProxy();
    });

    this.onUpdate(false, 0, (this.target as IGraphic).attribute);
  }

  /**
   * 清除所有子图形的路径代理
   */
  private clearPathProxy() {
    const shadowRoot = (this.target as IGraphic).shadowRoot;

    shadowRoot.forEachChildren(child => {
      (child as IGraphic).pathProxy = null;
    });
  }

  onEnd(): void {
    return;
  }

  /**
   * 更新动画状态
   * @param end 是否结束
   * @param ratio 动画进度比例
   * @param out 输出属性对象
   */
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

/**
 * 解析图形的阴影子元素属性（排除变换相关属性）
 * @param graphicAttrs 图形属性
 * @returns 阴影子元素属性
 */
const parseShadowChildAttrs = (graphicAttrs: Partial<IGraphicAttribute>) => {
  const attrs: Partial<IGraphicAttribute> = {};

  Object.keys(graphicAttrs).forEach(key => {
    if (!isTransformKey(key)) {
      (attrs as any)[key] = (graphicAttrs as any)[key];
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

/**
 * 将阴影子元素添加到图形中
 * @param graphic 目标图形
 * @param children 子元素数组
 * @param count 子元素数量
 */
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

/**
 * 克隆图形为多个相同的图形
 * @param graphic 源图形
 * @param count 克隆数量
 * @param needAppend 是否需要添加到源图形中
 * @returns 克隆的图形数组
 */
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

/**
 * 将图形分割为多个子图形
 * @param graphic 源图形
 * @param count 分割数量
 * @param needAppend 是否需要添加到源图形中
 * @returns 分割后的图形数组
 */
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
 * 创建从多个图形到一个图形的形变动画
 * @param fromGraphics 源图形数组
 * @param toGraphic 目标图形
 * @param animationConfig 动画配置
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
