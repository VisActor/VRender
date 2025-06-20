import type { ICustomPath2D } from './../interface/path';
import type { Dict, IPointLike, IAABBBounds, IOBBBounds } from '@visactor/vutils';
import { isArray, max, OBBBounds } from '@visactor/vutils';
import {
  AABBBounds,
  Matrix,
  normalTransform,
  Point,
  isNil,
  has,
  isString,
  isValidUrl,
  isBase64,
  isObject
} from '@visactor/vutils';
import type {
  GraphicType,
  IAnimateConfig,
  IGraphicAttribute,
  IGraphic,
  IGraphicAnimateParams,
  IGraphicJson,
  ISetAttributeContext,
  ITransform,
  GraphicReleaseStatus
} from '../interface/graphic';
import { Node } from './node-tree';
import type {
  IAnimate,
  IAnimateTarget,
  IGlyphGraphicAttribute,
  IGroup,
  ILayer,
  IPickerService,
  IShadowRoot,
  IStage,
  IStep,
  ISymbolClass
} from '../interface';
import { EventTarget, CustomEvent } from '../event';
import { DefaultTransform } from './config';
import { application } from '../application';
import { interpolateColor } from '../color-string/interpolate';
import { CustomPath2D } from '../common/custom-path2d';
import { ResourceLoader } from '../resource-loader/loader';
import { AttributeUpdateType, IContainPointMode, UpdateTag } from '../common/enums';
import { BoundsContext } from '../common/bounds-context';
import { renderCommandList } from '../common/render-command-list';
import { parsePadding } from '../common/utils';
import { builtinSymbolsMap, builtInSymbolStrMap, CustomSymbolClass } from './builtin-symbol';
import { isSvg, XMLParser } from '../common/xml';
import { SVG_PARSE_ATTRIBUTE_MAP, SVG_PARSE_ATTRIBUTE_MAP_KEYS } from './constants';
import { DefaultStateAnimateConfig } from '../animate/config';
import { EmptyContext2d } from '../canvas';

const _tempBounds = new AABBBounds();
/**
 * pathProxy参考自zrender
 * BSD 3-Clause License

  Copyright (c) 2017, Baidu Inc.
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  * Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const tempMatrix = new Matrix();
const tempBounds = new AABBBounds();

export const PURE_STYLE_KEY = [
  'stroke',
  'opacity',
  'strokeOpacity',
  'lineDash',
  'lineDashOffset',
  'lineCap',
  'lineJoin',
  'miterLimit',
  'fill',
  'fillOpacity'
];

export const GRAPHIC_UPDATE_TAG_KEY = [
  'lineWidth',
  // 'lineCap',
  // 'lineJoin',
  // 'miterLimit',
  'scaleX',
  'scaleY',
  'angle',
  'anchor',
  'visible'
];

const tempConstantXYKey = ['x', 'y'];
const tempConstantScaleXYKey = ['scaleX', 'scaleY'];
const tempConstantAngleKey = ['angle'];

const point = new Point();

export const NOWORK_ANIMATE_ATTR = {
  strokeSeg: 1,
  boundsPadding: 2,
  pickMode: 1,
  boundsMode: 1,
  customPickShape: 1,
  pickable: 1,
  childrenPickable: 1,
  visible: 1,
  zIndex: 1,
  layout: 1,
  keepDirIn3d: 1,
  globalZIndex: 1,

  outerBorder: 1,
  innerBorder: 1,
  lineDash: 1,
  lineCap: 1,
  lineJoin: 1,
  miterLimit: 2,
  strokeBoundsBuffer: 2,

  scaleCenter: 1,
  anchor: 1,
  anchor3d: 1,
  postMatrix: 1,

  backgroundMode: 2,
  background: 1,
  texture: 1,
  cursor: 1,
  html: 1
};

// function createTrackableObject(obj: any) {
//   // const accessedProperties = new Set(); // 记录被读取的属性
//   // const modifiedProperties = new Set(); // 记录被设置/修改的属性

//   const handler = {
//     get(target: any, property: any) {
//       // accessedProperties.add(property); // 记录读取操作
//       return Reflect.get(target, property);
//     },
//     set(target: any, property: any, value: any) {
//       if (property === 'size' && !isFinite(value)) {
//         console.log('set', property, value);
//       }
//       // modifiedProperties.add(property); // 记录设置/修改操作
//       return Reflect.set(target, property, value);
//     }
//   };

//   const proxy = new Proxy(obj, handler);

//   // 提供方法获取被追踪的属性
//   // proxy.getAccessedProperties = () => [...accessedProperties];
//   // proxy.getModifiedProperties = () => [...modifiedProperties];

//   return proxy;
// }

/**
 * globalTransMatrix更新逻辑
 * 1. group的transform修改，会下发到所有下层group，将所有下层的tag修改
 * 2. 叶子graphic每次获取globalTransMatrix都重新计算
 * 3. 所有节点的transform修改，或者globalTransform修改，都会下发到自己的shadowRoot上
 */

export abstract class Graphic<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>>
  extends Node
  implements IGraphic<T>, IAnimateTarget
{
  /**
   * Mixes all enumerable properties and methods from a source object to Element.
   * @param source - The source of properties and methods to mix in.
   */
  static mixin(source: Dict<any>): void {
    // in ES8/ES2017, this would be really easy:
    // Object.defineProperties(Element.prototype, Object.getOwnPropertyDescriptors(source));

    // get all the enumerable property keys
    const keys = Object.keys(source);

    // loop through properties
    for (let i = 0; i < keys.length; ++i) {
      const propertyName = keys[i];

      // Set the property using the property descriptor - this works for accessors and normal value properties
      Object.defineProperty(
        Graphic.prototype,
        propertyName,
        Object.getOwnPropertyDescriptor(source, propertyName) as PropertyDecorator
      );
    }
  }

  declare _events?: any;

  // 保存语法上下文
  declare context?: Record<string, any>;

  static userSymbolMap: Record<string, ISymbolClass> = {};

  declare onBeforeAttributeUpdate?: (
    val: any,
    attributes: Partial<T>,
    key: null | string | string[],
    context?: ISetAttributeContext
  ) => T | undefined;
  declare parent: any;

  declare resources?: Map<
    string | HTMLImageElement | HTMLCanvasElement,
    { state: 'init' | 'loading' | 'success' | 'fail'; data?: HTMLImageElement | HTMLCanvasElement }
  >;
  declare backgroundImg?: boolean;

  declare type: GraphicType;
  declare prefixed: string;
  declare numberType: number;
  declare isContainer?: boolean;
  declare valid: boolean;
  declare stage?: IStage;
  declare layer?: ILayer;
  declare incremental?: number;
  declare glyphHost?: IGraphic<IGlyphGraphicAttribute>;
  declare _onSetStage?: (g: IGraphic, stage: IStage, layer: ILayer) => void;
  // declare _beforeAttributeUpdate?: (key: string | string, value: any) => void;
  // 标记是否是在3d模式下
  declare in3dMode?: boolean;

  // 不考虑transform的宽高，特殊情况下会使用到
  declare widthWithoutTransform?: number;
  declare heightWithoutTransform?: number;
  declare x1WithoutTransform?: number;
  declare y1WithoutTransform?: number;

  // aabbBounds，所有图形都需要有，所以初始化即赋值
  protected declare _AABBBounds: IAABBBounds;
  get AABBBounds(): IAABBBounds {
    return this.tryUpdateAABBBounds();
  }
  // 具有旋转的包围盒，部分图元需要，动态初始化
  protected declare _OBBBounds?: IOBBBounds;
  get OBBBounds(): IOBBBounds {
    return this.tryUpdateOBBBounds();
  }
  protected declare _globalAABBBounds: IAABBBounds;
  // 全局包围盒，部分图元需要，动态初始化，建议使用AABBBounds
  get globalAABBBounds(): IAABBBounds {
    return this.tryUpdateGlobalAABBBounds();
  }
  protected declare _transMatrix: Matrix;
  get transMatrix(): Matrix {
    return this.tryUpdateLocalTransMatrix(true);
  }
  protected declare _globalTransMatrix: Matrix;
  get globalTransMatrix(): Matrix {
    return this.tryUpdateGlobalTransMatrix(true);
  }
  protected declare _updateTag: number;

  // 上次更新的stamp
  declare stamp?: number;

  declare attribute: T;

  declare shadowRoot?: IShadowRoot;

  declare releaseStatus?: GraphicReleaseStatus;

  /** 记录state对应的图形属性 */
  declare states?: Record<string, Partial<T>>;
  /** 当前state值 */
  declare currentStates?: string[];
  /** TODO: state更新对应的动画配置 */
  declare stateAnimateConfig?: IAnimateConfig;
  /** 记录应用state之前，attribute对应的原始图形属性 */
  declare normalAttrs?: Partial<T>;
  /** 获取state图形属性的方法 */
  declare stateProxy?: (stateName: string, targetStates?: string[]) => T;
  declare animates: Map<string | number, IAnimate>;

  declare animate?: () => IAnimate;

  // declare nextAttrs?: T;
  // declare prevAttrs?: T;
  // declare finalAttrs?: T;

  declare pathProxy?: ICustomPath2D;
  // 依附于某个theme，如果该节点不存在parent，那么这个Theme就作为节点的Theme，避免添加到节点前计算属性
  declare attachedThemeGraphic?: IGraphic;
  protected updateAABBBoundsStamp: number;
  protected updateOBBBoundsStamp?: number;
  declare clipPathMap?: Map<string, ISymbolClass>;

  constructor(params: T = {} as T) {
    super();
    this._AABBBounds = new AABBBounds();
    this._updateTag = UpdateTag.INIT;
    this.attribute = params;
    this.valid = this.isValid();
    this.updateAABBBoundsStamp = 0;
    if (params.background) {
      this.loadImage((params.background as any).background ?? params.background, true);
    } else if (params.shadowGraphic) {
      this.setShadowGraphic(params.shadowGraphic);
    }
    // this.attribute = createTrackableObject(this.attribute);
  }

  getGraphicService() {
    return this.stage?.graphicService ?? application.graphicService;
  }

  getAttributes(): T {
    return this.attribute;
  }

  setMode(mode: '2d' | '3d') {
    mode === '3d' ? this.set3dMode() : this.set2dMode();
  }

  set3dMode() {
    this.in3dMode = true;
  }
  set2dMode() {
    this.in3dMode = false;
  }
  getOffsetXY(attr?: ITransform, includeScroll: boolean = false) {
    const { dx = attr.dx, dy = attr.dy } = this.attribute;
    if (includeScroll && this.parent) {
      // const groupTheme = getTheme(this.parent).group;
      const attribute = this.parent.attribute;
      point.x = dx + (attribute.scrollX ?? 0);
      point.y = dy + (attribute.scrollY ?? 0);
    } else {
      point.x = dx;
      point.y = dy;
    }
    return point;
  }

  onAnimateBind(animate: IAnimate) {
    this._emitCustomEvent('animate-bind', animate);
  }

  protected tryUpdateAABBBounds(): IAABBBounds {
    const full = this.attribute.boundsMode === 'imprecise';
    if (!this.shouldUpdateAABBBounds()) {
      return this._AABBBounds;
    }
    if (!this.valid) {
      this._AABBBounds.clear();
      return this._AABBBounds;
    }

    this.getGraphicService().beforeUpdateAABBBounds(this, this.stage, true, this._AABBBounds);
    const bounds = this.doUpdateAABBBounds(full);
    // this.addUpdateLayoutTag();
    this.getGraphicService().afterUpdateAABBBounds(this, this.stage, this._AABBBounds, this, true);

    // 直接返回空Bounds，但是前面的流程还是要走
    if (this.attribute.boundsMode === 'empty') {
      bounds.clear();
    }
    return bounds;
  }

  protected tryUpdateOBBBounds(): IOBBBounds {
    if (!this._OBBBounds) {
      this._OBBBounds = new OBBBounds();
    }
    // 尝试更新AABBBounds
    this.tryUpdateAABBBounds();
    // 如果AABBBounds和OBBBounds不一致，则重新计算OBBBounds
    if (this.updateOBBBoundsStamp === this.updateAABBBoundsStamp) {
      return this._OBBBounds;
    }
    this.updateOBBBoundsStamp = this.updateAABBBoundsStamp;
    if (!this.valid) {
      this._OBBBounds.clear();
      return this._OBBBounds;
    }

    const bounds = this.doUpdateOBBBounds();
    return bounds;
  }

  protected combindShadowAABBBounds(bounds: IAABBBounds) {
    // 合并shadowRoot的Bounds
    if (this.shadowRoot) {
      const b = this.shadowRoot.AABBBounds.clone();
      bounds.union(b);
    }
  }

  abstract getGraphicTheme(): T;

  protected doUpdateOBBBounds(): IOBBBounds {
    return this._OBBBounds;
  }

  protected abstract updateAABBBounds(
    attribute: T,
    symbolTheme: Required<T>,
    aabbBounds: IAABBBounds,
    full?: boolean
  ): IAABBBounds;

  getClipPath() {
    const { clipConfig } = this.attribute;
    if (!clipConfig) {
      return null;
    }
    if (!this.clipPathMap) {
      this.clipPathMap = new Map();
    }

    const { shape } = clipConfig;
    let path = this.clipPathMap.get(shape) || null;
    if (!path) {
      // 即使清理，避免内存溢出
      if (this.clipPathMap.size > 10) {
        this.clipPathMap.clear();
      }
      path = this.parsePath(shape);
      path && this.clipPathMap.set(shape, path);
    }
    return path;
  }

  parsePath(symbolType: string) {
    if (!symbolType) {
      return null;
    }
    let path = builtinSymbolsMap[symbolType];
    if (path) {
      return path;
    }
    path = Graphic.userSymbolMap[symbolType];
    if (path) {
      return path;
    }
    const _symbolType = builtInSymbolStrMap[symbolType];
    symbolType = _symbolType || symbolType;
    const valid = isSvg(symbolType);
    if (valid === true) {
      const parser = new XMLParser();
      const { svg } = parser.parse(symbolType);
      if (!svg) {
        return null;
      }
      const path = isArray(svg.path) ? svg.path : [svg.path];
      _tempBounds.clear();
      const cacheList: { path: CustomPath2D; attribute: Record<string, any> }[] = [];
      path.forEach((item: any) => {
        const cache = new CustomPath2D().fromString(item.d);
        const attribute: any = {};
        SVG_PARSE_ATTRIBUTE_MAP_KEYS.forEach(k => {
          if (item[k]) {
            (attribute as any)[(SVG_PARSE_ATTRIBUTE_MAP as any)[k]] = item[k];
          }
        });
        // 查找
        cacheList.push({
          path: cache,
          attribute
        });
        _tempBounds.union(cache.bounds);
      });
      const width = _tempBounds.width();
      const height = _tempBounds.height();
      // 规范化到1
      const maxWH = max(width, height);
      const scale = 1 / maxWH;
      cacheList.forEach(cache => cache.path.transform(0, 0, scale, scale));

      const _parsedPath = new CustomSymbolClass(symbolType, cacheList, true);
      Graphic.userSymbolMap[symbolType] = _parsedPath;
      return _parsedPath;
    }

    const cache = new CustomPath2D().fromString(symbolType);
    const width = cache.bounds.width();
    const height = cache.bounds.height();
    // 规范化到1
    const maxWH = max(width, height);
    const scale = 1 / maxWH;
    cache.transform(0, 0, scale, scale);
    const _parsedPath = new CustomSymbolClass(symbolType, cache);
    Graphic.userSymbolMap[symbolType] = _parsedPath;
    return _parsedPath;
  }

  protected doUpdateAABBBounds(full?: boolean): IAABBBounds {
    this.updateAABBBoundsStamp++;
    const graphicTheme = this.getGraphicTheme();
    this._AABBBounds.clear();
    const attribute = this.attribute;
    const bounds = this.updateAABBBounds(attribute, graphicTheme as Required<T>, this._AABBBounds, full) as AABBBounds;

    const { boundsPadding = graphicTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds;
  }

  updatePathProxyAABBBounds(aabbBounds: IAABBBounds): boolean {
    const path = typeof this.pathProxy === 'function' ? (this.pathProxy as any)(this.attribute) : this.pathProxy;
    if (!path) {
      return false;
    }
    const boundsContext = new BoundsContext(aabbBounds);
    renderCommandList(path.commandList, boundsContext, 0, 0);
    return true;
  }

  protected tryUpdateGlobalAABBBounds(): IAABBBounds {
    const b = this.AABBBounds;
    if (!this._globalAABBBounds) {
      this._globalAABBBounds = b.clone();
    } else {
      this._globalAABBBounds.setValue(b.x1, b.y1, b.x2, b.y2);
    }
    if (this._globalAABBBounds.empty()) {
      return this._globalAABBBounds;
    }
    // 使用parent的grloalAABBBounds
    // todo: 考虑是否需要性能优化
    if (this.parent) {
      this._globalAABBBounds.transformWithMatrix((this.parent as IGroup).globalTransMatrix);
    }
    return this._globalAABBBounds;
  }

  /**
   * 这里都是叶子节点的UpdateGlobalTransMatrix函数，只要走进来就直接计算
   * @param clearTag
   * @returns
   */
  protected tryUpdateGlobalTransMatrix(clearTag: boolean = true): Matrix {
    if (!this._globalTransMatrix) {
      this._globalTransMatrix = this.parent
        ? (this.parent as IGroup).globalTransMatrix.clone()
        : this.transMatrix.clone();
    } else if (this.parent) {
      const m = (this.parent as IGroup).globalTransMatrix;
      this._globalTransMatrix.setValue(m.a, m.b, m.c, m.d, m.e, m.f);
    }
    if (this.shouldUpdateGlobalMatrix()) {
      this.doUpdateGlobalMatrix();
    }
    return this._globalTransMatrix;
  }

  shouldUpdateGlobalMatrix(): boolean {
    return true;
  }

  protected tryUpdateLocalTransMatrix(clearTag: boolean = true) {
    if (!this._transMatrix) {
      this._transMatrix = new Matrix();
    }
    if (this.shouldUpdateLocalMatrix()) {
      this.doUpdateLocalMatrix();
      clearTag && this.clearUpdateLocalPositionTag();
    }
    return this._transMatrix;
  }

  shouldUpdateAABBBounds(): boolean {
    // 如果存在shadowRoot，那么判断shadowRoot是否需要更新
    if (this.shadowRoot) {
      return (
        (!!(this._updateTag & UpdateTag.UPDATE_BOUNDS) || this.shadowRoot.shouldUpdateAABBBounds()) &&
        this.getGraphicService().validCheck(
          this.attribute,
          this.getGraphicTheme() as Required<T>,
          this._AABBBounds,
          this
        )
      );
    }
    return (
      !!(this._updateTag & UpdateTag.UPDATE_BOUNDS) &&
      this.getGraphicService().validCheck(this.attribute, this.getGraphicTheme() as Required<T>, this._AABBBounds, this)
    );
  }

  // 自身变化导致的AABBBounds的变化
  shouldSelfChangeUpdateAABBBounds(): boolean {
    // 如果存在shadowRoot，那么判断shadowRoot是否需要更新
    if (this.shadowRoot) {
      return !!(this._updateTag & UpdateTag.UPDATE_BOUNDS) || this.shadowRoot.shouldUpdateAABBBounds();
    }
    return !!(this._updateTag & UpdateTag.UPDATE_BOUNDS);
  }

  protected shouldUpdateLocalMatrix(): boolean {
    return !!(this._updateTag & UpdateTag.UPDATE_LOCAL_MATRIX);
  }

  isValid(): boolean {
    const attribute = this.attribute;
    return Number.isFinite((attribute.x ?? 0) + (attribute.y ?? 0));
  }

  protected _validNumber(num?: number) {
    return num == null || Number.isFinite(num);
  }

  shouldUpdateShape(): boolean {
    return !!(this._updateTag & UpdateTag.UPDATE_SHAPE);
  }
  clearUpdateShapeTag() {
    this._updateTag &= UpdateTag.CLEAR_SHAPE;
  }

  /**
   * 是否包含某个点（点需要是全局坐标系）
   * @param x
   * @param y
   * @param mode
   * @returns
   */
  containsPoint(x: number, y: number, mode: IContainPointMode, picker?: IPickerService): boolean {
    if (!picker) {
      return false;
    }
    if (mode === IContainPointMode.GLOBAL) {
      // 转换x，y更精准
      const point = new Point(x, y);
      if (this.parent) {
        this.parent.globalTransMatrix.transformPoint(point, point);
      }
      x = point.x;
      y = point.y;
    }
    return picker.containsPoint(this, { x, y });
  }

  protected setWidthHeightWithoutTransform(aabbBounds: IAABBBounds) {
    this.widthWithoutTransform = aabbBounds.x2 - aabbBounds.x1;
    this.heightWithoutTransform = aabbBounds.y2 - aabbBounds.y1;
  }
  setAttributesAndPreventAnimate(
    params: Partial<T>,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext,
    ignorePriority?: boolean
  ) {
    this.setAttributes(params, forceUpdateTag, context);
    this.animates &&
      this.animates.forEach(animate => {
        // 优先级最高的动画（一般是循环动画），不屏蔽
        if (animate.priority === Infinity && !ignorePriority) {
          return;
        }
        Object.keys(params).forEach(key => {
          animate.preventAttr(key);
        });
      });
  }

  setAttributes(params: Partial<T>, forceUpdateTag: boolean = false, context?: ISetAttributeContext) {
    params =
      (this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate(params, this.attribute, null, context)) || params;

    if (params.background) {
      this.loadImage(params.background, true);
    } else if (params.shadowGraphic) {
      this.setShadowGraphic(params.shadowGraphic);
    }
    this._setAttributes(params, forceUpdateTag, context);
  }

  _setAttributes(params: Partial<T>, forceUpdateTag: boolean = false, context?: ISetAttributeContext) {
    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      (this.attribute as any)[key] = (params as any)[key];
    }
    this.valid = this.isValid();
    // 没有设置shape&bounds的tag
    if (!this.updateShapeAndBoundsTagSetted() && (forceUpdateTag || this.needUpdateTags(keys))) {
      this.addUpdateShapeAndBoundsTag();
    } else {
      this.addUpdateBoundTag();
    }
    this.addUpdatePositionTag();
    this.addUpdateLayoutTag();
    this.onAttributeUpdate(context);
  }

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext) {
    const params =
      this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate({ [key]: value }, this.attribute, key, context);
    if (!params) {
      if (!isNil((this.normalAttrs as any)?.[key])) {
        (this.normalAttrs as any)[key] = value;
      } else {
        (this.attribute as any)[key] = value;
        this.valid = this.isValid();
        if (!this.updateShapeAndBoundsTagSetted() && (forceUpdateTag || this.needUpdateTag(key))) {
          this.addUpdateShapeAndBoundsTag();
        } else {
          this.addUpdateBoundTag();
        }
        this.addUpdatePositionTag();
        this.addUpdateLayoutTag();
        this.onAttributeUpdate(context);
      }
    } else {
      this._setAttributes(params, forceUpdateTag, context);
    }
    if (key === 'background') {
      this.loadImage(value, true);
    } else if (key === 'shadowGraphic') {
      this.setShadowGraphic(value);
    }
  }

  protected needUpdateTags(keys: string[], k: string[] = GRAPHIC_UPDATE_TAG_KEY): boolean {
    for (let i = 0; i < k.length; i++) {
      const attrKey = k[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return false;
  }

  protected needUpdateTag(key: string, k: string[] = GRAPHIC_UPDATE_TAG_KEY): boolean {
    for (let i = 0; i < k.length; i++) {
      const attrKey = k[i];
      if (key === attrKey) {
        return true;
      }
    }
    return false;
  }

  initAttributes(params: T) {
    // this.setAttributes(params, true);
    const context = { type: AttributeUpdateType.INIT };
    params =
      (this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate(params, this.attribute, null, context)) || params;
    this.attribute = params;
    if (params.background) {
      this.loadImage(params.background, true);
    } else if (params.shadowGraphic) {
      this.setShadowGraphic(params.shadowGraphic);
    }
    this._updateTag = UpdateTag.INIT;
    this.valid = this.isValid();
    this.onAttributeUpdate(context);
  }

  translate(x: number, y: number) {
    if (x === 0 && y === 0) {
      return this;
    }
    const context = {
      type: AttributeUpdateType.TRANSLATE
    };
    const params =
      this.onBeforeAttributeUpdate &&
      this.onBeforeAttributeUpdate({ x, y }, this.attribute, tempConstantXYKey, context);
    if (params) {
      x = params.x;
      y = params.y;
      delete params.x;
      delete params.y;
      this._setAttributes(params);
    }
    const attribute = this.attribute;
    const postMatrix = attribute.postMatrix;
    if (!postMatrix) {
      attribute.x = (attribute.x ?? DefaultTransform.x) + x;
      attribute.y = (attribute.y ?? DefaultTransform.y) + y;
    } else {
      application.transformUtil.fromMatrix(postMatrix, postMatrix).translate(x, y);
    }

    this.addUpdatePositionTag();
    this.addUpdateBoundTag();
    this.addUpdateLayoutTag();
    this.onAttributeUpdate(context);
    return this;
  }

  translateTo(x: number, y: number) {
    const attribute = this.attribute;
    if (attribute.x === x && attribute.y === y) {
      return this;
    }
    const context = {
      type: AttributeUpdateType.TRANSLATE_TO
    };
    const params =
      this.onBeforeAttributeUpdate &&
      this.onBeforeAttributeUpdate({ x, y }, this.attribute, tempConstantXYKey, context);
    if (params) {
      this._setAttributes(params, false, context);
      return this;
    }
    attribute.x = x;
    attribute.y = y;
    this.addUpdatePositionTag();
    this.addUpdateBoundTag();
    this.addUpdateLayoutTag();
    this.onAttributeUpdate(context);
    return this;
  }

  scale(scaleX: number, scaleY: number, scaleCenter?: IPointLike) {
    if (scaleX === 1 && scaleY === 1) {
      return this;
    }
    const context = {
      type: AttributeUpdateType.SCALE
    };
    const params =
      this.onBeforeAttributeUpdate &&
      this.onBeforeAttributeUpdate({ scaleX, scaleY, scaleCenter }, this.attribute, tempConstantScaleXYKey, context);
    if (params) {
      scaleX = params.scaleX;
      scaleY = params.scaleY;
      delete params.scaleX;
      delete params.scaleY;
      this._setAttributes(params);
    }
    const attribute = this.attribute;
    if (!scaleCenter) {
      attribute.scaleX = (attribute.scaleX ?? DefaultTransform.scaleX) * scaleX;
      attribute.scaleY = (attribute.scaleY ?? DefaultTransform.scaleY) * scaleY;
    } else {
      let { postMatrix } = this.attribute;
      if (!postMatrix) {
        postMatrix = new Matrix();
        attribute.postMatrix = postMatrix;
      }
      application.transformUtil.fromMatrix(postMatrix, postMatrix).scale(scaleX, scaleY, scaleCenter);
    }
    this.addUpdatePositionTag();
    this.addUpdateBoundTag();
    this.addUpdateLayoutTag();
    this.onAttributeUpdate(context);
    return this;
  }

  scaleTo(scaleX: number, scaleY: number) {
    const attribute = this.attribute;
    if (attribute.scaleX === scaleX && attribute.scaleY === scaleY) {
      return this;
    }
    const context = {
      type: AttributeUpdateType.SCALE_TO
    };
    const params =
      this.onBeforeAttributeUpdate &&
      this.onBeforeAttributeUpdate({ scaleX, scaleY }, this.attribute, tempConstantScaleXYKey, context);
    if (params) {
      this._setAttributes(params, false, context);
      return this;
    }
    attribute.scaleX = scaleX;
    attribute.scaleY = scaleY;
    this.addUpdatePositionTag();
    this.addUpdateBoundTag();
    this.addUpdateLayoutTag();
    this.onAttributeUpdate(context);
    return this;
  }

  rotate(angle: number, rotateCenter?: IPointLike) {
    if (angle === 0) {
      return this;
    }
    const context = { type: AttributeUpdateType.ROTATE };
    const params =
      this.onBeforeAttributeUpdate &&
      this.onBeforeAttributeUpdate({ angle, rotateCenter }, this.attribute, tempConstantAngleKey, context);
    if (params) {
      delete params.angle;
      this._setAttributes(params, false, context);
      // return this;
    }
    const attribute = this.attribute;
    if (!rotateCenter) {
      attribute.angle = (attribute.angle ?? DefaultTransform.angle) + angle;
    } else {
      let { postMatrix } = this.attribute;
      if (!postMatrix) {
        postMatrix = new Matrix();
        attribute.postMatrix = postMatrix;
      }
      application.transformUtil.fromMatrix(postMatrix, postMatrix).rotate(angle, rotateCenter);
    }
    this.addUpdatePositionTag();
    this.addUpdateBoundTag();
    this.addUpdateLayoutTag();
    this.onAttributeUpdate(context);
    return this;
  }

  rotateTo(angle: number) {
    const attribute = this.attribute;
    if (attribute.angle === angle) {
      return this;
    }
    const context = {
      type: AttributeUpdateType.ROTATE_TO
    };
    const params =
      this.onBeforeAttributeUpdate &&
      this.onBeforeAttributeUpdate(angle, this.attribute, tempConstantAngleKey, context);
    if (params) {
      this._setAttributes(params, false, context);
      return this;
    }
    attribute.angle = angle;
    this.addUpdatePositionTag();
    this.addUpdateBoundTag();
    this.addUpdateLayoutTag();
    this.onAttributeUpdate(context);
    return this;
  }

  skewTo(b: number, c: number) {
    return this;
  }

  onAttributeUpdate(context?: ISetAttributeContext) {
    if (context && context.skipUpdateCallback) {
      return;
    }
    this.getGraphicService().onAttributeUpdate(this);
    this._emitCustomEvent('afterAttributeUpdate', context);
  }

  // hasListener(event: string) {
  //   const prefix = this.prefixed;
  //   var evt = prefix ? prefix + event : event;
  //   return this._events[evt];
  // }

  update(d?: { bounds: boolean; trans: boolean }) {
    if (d) {
      d.bounds && this.tryUpdateAABBBounds();
      d.trans && this.tryUpdateLocalTransMatrix();
    } else {
      this.tryUpdateAABBBounds();
      this.tryUpdateLocalTransMatrix();
    }
  }

  hasState(stateName?: string) {
    if (!this.currentStates || !this.currentStates.length) {
      return false;
    }

    if (!isNil(stateName)) {
      return this.currentStates.includes(stateName);
    }

    return true;
  }
  getState(stateName: string) {
    return this.states?.[stateName];
  }

  applyStateAttrs(attrs: Partial<T>, stateNames: string[], hasAnimation?: boolean, isClear?: boolean) {
    // 应用状态的时候要停掉动画
    if (hasAnimation) {
      const keys = Object.keys(attrs);
      const noWorkAttrs = this.getNoWorkAnimateAttr();
      const animateAttrs: Partial<T> = {};
      let noAnimateAttrs: Partial<T> | undefined;

      keys.forEach(key => {
        if (!noWorkAttrs[key]) {
          (animateAttrs as any)[key] =
            isClear && (attrs as any)[key] === undefined ? this.getDefaultAttribute(key) : (attrs as any)[key];
        } else {
          if (!noAnimateAttrs) {
            noAnimateAttrs = {};
          }
          (noAnimateAttrs as any)[key] = (attrs as any)[key];
        }
      });

      const stateAnimateConfig =
        (this.context && this.context.stateAnimateConfig) ?? this.stateAnimateConfig ?? DefaultStateAnimateConfig;
      // 需要注册动画
      (this as any).applyAnimationState(
        ['state'],
        [
          {
            name: 'state',
            animation: {
              type: 'state',
              to: animateAttrs,
              duration: stateAnimateConfig.duration,
              easing: stateAnimateConfig.easing
            }
          }
        ]
      );
      // const animate = (this.animate as any)({ slience: true });
      // (animate as any).stateNames = stateNames;
      // animate.to(animateAttrs, stateAnimateConfig.duration, stateAnimateConfig.easing);
      noAnimateAttrs && this.setAttributesAndPreventAnimate(noAnimateAttrs, false, { type: AttributeUpdateType.STATE });
      // Object.assign((this as any).finalAttribute, attrs);
    } else {
      this.stopStateAnimates();
      this.setAttributesAndPreventAnimate(attrs, false, { type: AttributeUpdateType.STATE });
      if ((this as any).finalAttribute) {
        Object.assign((this as any).finalAttribute, attrs);
      }
    }

    this._emitCustomEvent('afterStateUpdate', { type: AttributeUpdateType.STATE });
  }

  updateNormalAttrs(stateAttrs: Partial<T>) {
    const newNormalAttrs = {};
    if (this.normalAttrs) {
      Object.keys(stateAttrs).forEach(key => {
        if (key in this.normalAttrs) {
          (newNormalAttrs as any)[key] = (this.normalAttrs as any)[key];
          delete (this.normalAttrs as any)[key];
        } else {
          (newNormalAttrs as any)[key] = this.getNormalAttribute(key);
        }
      });
      Object.keys(this.normalAttrs).forEach(key => {
        (stateAttrs as any)[key] = (this.normalAttrs as any)[key];
      });
    } else {
      Object.keys(stateAttrs).forEach(key => {
        (newNormalAttrs as any)[key] = this.getNormalAttribute(key);
      });
    }

    this.normalAttrs = newNormalAttrs;
  }

  protected stopStateAnimates(type: 'start' | 'end' = 'end') {
    if (this.animates) {
      this.animates.forEach(animate => {
        if ((animate as any).stateNames) {
          animate.stop(type);
          this.animates.delete(animate.id);
        }
      });
    }
  }

  private getNormalAttribute(key: string) {
    const value = (this.attribute as any)[key];

    if (this.animates) {
      // this.animates.forEach(animate => {
      //   if ((animate as any).stateNames) {
      //     const endProps = animate.getEndProps();
      //     if (has(endProps, key)) {
      //       value = endProps[key];
      //     }
      //   }
      // });
      // console.log(this.finalAttrs);
      return (this as any).finalAttribute?.[key];
    }

    return value ?? (this as any).finalAttribute?.[key];
  }

  clearStates(hasAnimation?: boolean) {
    if (this.hasState() && this.normalAttrs) {
      this.currentStates = [];
      this.applyStateAttrs(this.normalAttrs, this.currentStates, hasAnimation, true);
    } else {
      this.currentStates = [];
    }
    this.normalAttrs = null;
  }

  removeState(stateName: string | string[], hasAnimation?: boolean) {
    if (this.currentStates) {
      const filter = isArray(stateName) ? (s: string) => !stateName.includes(s) : (s: string) => s !== stateName;
      const newStates = this.currentStates.filter(filter);

      if (newStates.length !== this.currentStates.length) {
        this.useStates(newStates, hasAnimation);
      }
    }
  }

  toggleState(stateName: string, hasAnimation?: boolean) {
    if (this.hasState(stateName)) {
      this.removeState(stateName, hasAnimation);
    } else {
      const index = this.currentStates ? this.currentStates.indexOf(stateName) : -1;
      if (index < 0) {
        const nextStates = this.currentStates ? this.currentStates.slice() : [];
        nextStates.push(stateName);
        this.useStates(nextStates, hasAnimation);
      }
    }
  }

  addState(stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean) {
    if (
      this.currentStates &&
      this.currentStates.includes(stateName) &&
      (keepCurrentStates || this.currentStates.length === 1)
    ) {
      return;
    }

    const newStates =
      keepCurrentStates && this.currentStates?.length ? this.currentStates.concat([stateName]) : [stateName];

    this.useStates(newStates, hasAnimation);
  }

  useStates(states: string[], hasAnimation?: boolean) {
    if (!states.length) {
      this.clearStates(hasAnimation);
      return;
    }

    const isChange =
      this.currentStates?.length !== states.length ||
      states.some((stateName, index) => this.currentStates[index] !== stateName);

    if (!isChange) {
      return;
    }

    const stateAttrs = {};
    states.forEach(stateName => {
      const attrs = this.stateProxy ? this.stateProxy(stateName, states) : this.states?.[stateName];

      if (attrs) {
        Object.assign(stateAttrs, attrs);
      }
    });

    this.updateNormalAttrs(stateAttrs);

    this.currentStates = states;
    this.applyStateAttrs(stateAttrs, states, hasAnimation);
  }

  addUpdateBoundTag() {
    this._updateTag |= UpdateTag.UPDATE_BOUNDS; // for bounds
    if (this.parent) {
      this.parent.addChildUpdateBoundTag();
    }
    if (this.glyphHost) {
      this.glyphHost.addUpdateBoundTag();
    }
  }

  addUpdateShapeTag() {
    this._updateTag |= UpdateTag.UPDATE_SHAPE; // for shape
  }

  addUpdateShapeAndBoundsTag() {
    this._updateTag |= UpdateTag.UPDATE_SHAPE_AND_BOUNDS; // for shape&bounds
    if (this.parent) {
      this.parent.addChildUpdateBoundTag();
    }
    if (this.glyphHost) {
      this.glyphHost.addUpdateBoundTag();
    }
  }

  protected updateShapeAndBoundsTagSetted(): boolean {
    return (this._updateTag & UpdateTag.UPDATE_SHAPE_AND_BOUNDS) === UpdateTag.UPDATE_SHAPE_AND_BOUNDS;
  }

  protected clearUpdateBoundTag() {
    this._updateTag &= UpdateTag.CLEAR_BOUNDS;
  }
  /**
   * 更新位置tag，包括全局tag和局部tag
   */
  addUpdatePositionTag() {
    // 更新shadowRoot的全局位置
    this.shadowRoot && this.shadowRoot.addUpdateGlobalPositionTag();
    this._updateTag |= UpdateTag.UPDATE_GLOBAL_LOCAL_MATRIX;
  }
  /**
   * 更新全局位置tag
   */
  addUpdateGlobalPositionTag() {
    // 更新shadowRoot的全局位置
    this.shadowRoot && this.shadowRoot.addUpdateGlobalPositionTag();
    this._updateTag |= UpdateTag.UPDATE_GLOBAL_MATRIX;
  }
  /**
   * 清除局部位置tag
   */
  protected clearUpdateLocalPositionTag() {
    this._updateTag &= UpdateTag.CLEAR_LOCAL_MATRIX;
  }
  /**
   * 清除全局位置tag
   */
  protected clearUpdateGlobalPositionTag() {
    this._updateTag &= UpdateTag.CLEAR_GLOBAL_MATRIX;
  }

  addUpdateLayoutTag() {
    this._updateTag |= UpdateTag.UPDATE_LAYOUT;
  }

  protected clearUpdateLayoutTag() {
    this._updateTag &= UpdateTag.CLEAR_LAYOUT;
  }

  protected needUpdateLayout(): boolean {
    return !!(this._updateTag & UpdateTag.UPDATE_LAYOUT);
  }

  protected getAnchor(anchor: [string | number, string | number], params: { b?: IAABBBounds }, resetScale?: boolean) {
    const _anchor: [number, number] = [0, 0];
    const getBounds = () => {
      if (params.b) {
        return params.b;
      }
      // 拷贝一份，避免计算bounds的过程中计算matrix，然后matrix又修改了bounds
      const graphic = this.clone();
      graphic.attribute.angle = 0;
      graphic.attribute.scaleCenter = null;
      if (resetScale) {
        graphic.attribute.scaleX = 1;
        graphic.attribute.scaleY = 1;
      }
      // @ts-ignore
      // this.setAttributes({ angle: 0, scaleCenter: null });
      params.b = graphic.AABBBounds;

      return params.b;
    };
    if (typeof anchor[0] === 'string') {
      const ratio = parseFloat(anchor[0]) / 100;
      const bounds = getBounds();
      _anchor[0] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[0] = anchor[0];
    }
    if (typeof anchor[1] === 'string') {
      const ratio = parseFloat(anchor[1]) / 100;
      const bounds = getBounds();
      _anchor[1] = bounds.y1 + (bounds.y2 - bounds.y1) * ratio;
    } else {
      _anchor[1] = anchor[1];
    }

    return _anchor;
  }

  /**
   * 更新局部matrix的具体函数
   */
  protected doUpdateLocalMatrix() {
    const {
      x = DefaultTransform.x,
      y = DefaultTransform.y,
      scaleX = DefaultTransform.scaleX,
      scaleY = DefaultTransform.scaleY,
      angle = DefaultTransform.angle,
      scaleCenter,
      anchor,
      postMatrix
    } = this.attribute;
    let _anchor: [number, number] = [0, 0];
    const params = {};
    if (anchor && angle) {
      _anchor = this.getAnchor(anchor, params);
    }
    if (scaleCenter && (scaleX !== 1 || scaleY !== 1)) {
      const m = this._transMatrix;
      m.reset();
      m.translate(_anchor[0], _anchor[1]);
      m.rotate(angle);
      m.translate(-_anchor[0], -_anchor[1]);

      m.translate(x, y);
      // m.translate(scaleCenter[0] * scaleX, scaleCenter[1] * scaleY);
      // 计算bounds
      _anchor = this.getAnchor(scaleCenter, params, true);
      application.transformUtil.fromMatrix(m, m).scale(scaleX, scaleY, { x: _anchor[0], y: _anchor[1] });
      // m.translate(-scaleCenter[0], -scaleCenter[1]);
    } else {
      normalTransform(this._transMatrix, this._transMatrix.reset(), x, y, scaleX, scaleY, angle, anchor && _anchor);
    }
    const p = this.getOffsetXY(DefaultTransform);
    this._transMatrix.e += p.x;
    this._transMatrix.f += p.y;

    if (postMatrix) {
      const m1 = tempMatrix.setValue(
        postMatrix.a,
        postMatrix.b,
        postMatrix.c,
        postMatrix.d,
        postMatrix.e,
        postMatrix.f
      );
      const m2 = this._transMatrix;
      m1.multiply(m2.a, m2.b, m2.c, m2.d, m2.e, m2.f);
      m2.setValue(m1.a, m1.b, m1.c, m1.d, m1.e, m1.f);
    }
  }
  /**
   * 更新全局matrix的具体函数
   */
  protected doUpdateGlobalMatrix() {
    // 基于parent的matrix修改
    if (this.parent) {
      this._globalTransMatrix.multiply(
        this.transMatrix.a,
        this.transMatrix.b,
        this.transMatrix.c,
        this.transMatrix.d,
        this.transMatrix.e,
        this.transMatrix.f
      );
      const { scrollX = 0, scrollY = 0 } = this.parent.attribute;
      this._globalTransMatrix.translate(scrollX, scrollY);
    }
  }

  setStage(stage?: IStage, layer?: ILayer) {
    if (this.stage !== stage) {
      this.stage = stage;
      this.layer = layer;
      this.setStageToShadowRoot(stage, layer);
      if (this.animates && this.animates.size) {
        // 设置timeline为所属的stage上的timeline，但如果timeline并不是默认的timeline，就不用覆盖
        const timeline = stage.getTimeline();
        this.animates.forEach(a => {
          if (a.timeline.isGlobal) {
            a.setTimeline(timeline);
            timeline.addAnimate(a);
          }
        });
      }
      this._onSetStage && this._onSetStage(this, stage, layer);
      this.getGraphicService().onSetStage(this, stage);
    }
  }

  setStageToShadowRoot(stage?: IStage, layer?: ILayer) {
    if (this.shadowRoot) {
      this.shadowRoot.setStage(stage, layer);
    }
  }

  onAddStep(step: IStep) {
    return;
  }
  onStop(props?: Partial<T>): void {
    if (props) {
      this.setAttributes(props, false, { type: AttributeUpdateType.ANIMATE_END });
    }
  }

  getDefaultAttribute(name: string) {
    return (this.getGraphicTheme() as any)[name];
  }

  // 获取属性
  getComputedAttribute(name: string) {
    return (this.attribute as any)[name] ?? this.getDefaultAttribute(name);
  }
  /**
   * 添加onSetStage钩子
   * @param cb 回调函数
   * @param immediate 是否立刻执行，如果在回调添加之前stage就已经绑定，那么如果第二个参数为true就立刻执行回调
   */
  onSetStage(cb: (g: IGraphic, stage: IStage) => void, immediate: boolean = false) {
    this._onSetStage = cb;
    if (immediate && this.stage) {
      cb(this, this.stage);
    }
  }

  /******************** shadow graphic *********************/
  attachShadow(shadowRoot?: IShadowRoot) {
    if (shadowRoot) {
      shadowRoot.shadowHost = this;
    }

    this.shadowRoot = shadowRoot ?? application.graphicService.creator.shadowRoot(this);
    this.addUpdateBoundTag();
    this.shadowRoot.setStage(this.stage, this.layer);
    return this.shadowRoot;
  }

  detachShadow() {
    if (this.shadowRoot) {
      this.addUpdateBoundTag();
      this.shadowRoot.release(true);
      this.shadowRoot = null;
    }
  }

  toJson(): IGraphicJson {
    return {
      attribute: this.attribute,
      _uid: this._uid,
      type: this.type,
      name: this.name,
      children: this.children.map((item: IGraphic) => item.toJson())
    };
  }

  createPathProxy(path?: string) {
    if (isString(path, true)) {
      this.pathProxy = new CustomPath2D().fromString(path as string);
    } else {
      this.pathProxy = new CustomPath2D();
    }

    return this.pathProxy;
  }

  loadImage(image: any, background: boolean = false) {
    if (!image || (background && backgroundNotImage(image))) {
      return;
    }
    const url = image;
    if (!this.resources) {
      this.resources = new Map();
    }
    const cache: {
      state: 'loading' | 'success' | 'init' | 'fail';
      data: any;
    } = {
      data: 'init',
      state: null
    };
    this.resources.set(url, cache);
    if (typeof image === 'string') {
      cache.state = 'loading';
      if (image.startsWith('<svg')) {
        // TODO 封装isSvg到@visactor/vutils
        ResourceLoader.GetSvg(image, this);
        this.backgroundImg = this.backgroundImg || background;
      } else if (isValidUrl(image) || image.includes('/') || isBase64(image)) {
        ResourceLoader.GetImage(image, this);
        this.backgroundImg = this.backgroundImg || background;
      }
    } else if (isObject(image)) {
      (cache.state = 'success'), (cache.data = image);
      this.backgroundImg = this.backgroundImg || background;
    } else {
      cache.state = 'fail';
    }
  }

  setShadowGraphic(graphic: IGraphic) {
    if (!graphic) {
      this.detachShadow();
    } else {
      const root = this.attachShadow();
      root.add(graphic);
    }
  }

  imageLoadSuccess(url: string, image: HTMLImageElement, cb?: () => void) {
    // 更新属性
    // this.resourceState = 'success';
    // this.resource = image;
    if (!this.resources) {
      return;
    }
    const res = this.resources.get(url);
    if (!res) {
      return;
    }
    res.state = 'success';
    res.data = image;

    cb && cb();

    // 触发重绘
    // 暂时全量，TODO 启动局部重绘
    // this.stage.enableDirtyBounds();
    // this.stage.dirty(this.AABBBounds);
    this.addUpdateBoundTag(); // 添加bounds更新tag重绘才会绘制这个mark
    this.stage && this.stage.renderNextFrame();
  }

  imageLoadFail(url: string, cb?: () => void) {
    if (!this.resources) {
      return;
    }
    const res = this.resources.get(url);
    if (!res) {
      return;
    }
    res.state = 'fail';

    cb && cb();
  }

  private _stopAnimates(animates: Map<string | number, IAnimate>) {
    if (animates) {
      animates.forEach(animate => {
        animate.stop();
      });
    }
  }

  stopAnimates(stopChildren: boolean = false) {
    this._stopAnimates(this.animates);

    if (this.shadowRoot) {
      // 停止所有影子节点的动画
      this.shadowRoot.stopAnimates(true);
    }
    if (this.isContainer && stopChildren) {
      this.forEachChildren((c: IGraphic) => {
        c.stopAnimates(stopChildren);
      });
    }
  }

  release(): void {
    this.releaseStatus = 'released';
    this.stopAnimates();
    application.graphicService.onRelease(this);
  }

  protected _emitCustomEvent(type: string, context?: any) {
    if (this._events && type in this._events) {
      const changeEvent = new CustomEvent(type, context);
      changeEvent.bubbles = false;

      (changeEvent as any).manager = (this.stage as any)?.eventSystem?.manager;
      this.dispatchEvent(changeEvent);
    }
  }

  abstract getNoWorkAnimateAttr(): Record<string, number>;

  abstract clone(): IGraphic<any>;

  toCustomPath(): ICustomPath2D {
    // throw new Error('暂不支持');
    const renderer = (this.stage?.renderService || application.renderService)?.drawContribution?.getRenderContribution(
      this
    );
    if (renderer) {
      const context = new EmptyContext2d(null, 1);
      renderer.drawShape(this, context, 0, 0, {} as any, {});
      return context.path;
    }
    return null;
  }
}

Graphic.mixin(EventTarget);

function backgroundNotImage(image: any) {
  if (image.fill || image.stroke) {
    return true;
  }
  return false;
}
