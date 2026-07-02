import type { ICustomPath2D } from './../interface/path';
import {
  AABBBounds,
  isArray,
  isEqual,
  max,
  Matrix,
  OBBBounds,
  normalTransform,
  Point,
  type Dict,
  type IAABBBounds,
  type IOBBBounds,
  type IPointLike,
  isNil,
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
  IGraphicJson,
  ISetAttributeContext,
  ISetStatesOptions,
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
import type {
  CompiledStateDefinition,
  StateDefinition,
  StateDefinitionsInput,
  StateMergeMode,
  StateTransitionResult
} from './state/state-definition';
import { StateDefinitionCompiler } from './state/state-definition-compiler';
import { StateEngine } from './state/state-engine';
import { ATTRIBUTE_CATEGORY, UpdateCategory, classifyAttributeDelta } from './state/attribute-update-classifier';
import { StateTransitionOrchestrator } from './state/state-transition-orchestrator';
import {
  collectSharedStateScopeChain,
  ensureSharedStateScopeFresh,
  type SharedStateScope
} from './state/shared-state-scope';
import { enqueueGraphicSharedStateRefresh, scheduleStageSharedStateRefresh } from './state/shared-state-refresh';

declare const require: (id: string) => unknown;

const _tempBounds = new AABBBounds();
type TShadowRootModule = {
  createShadowRoot: (graphic?: IGraphic) => IShadowRoot;
};
const loadShadowRootFactory = () => require('./shadow-root') as TShadowRootModule;
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
const builtinTextureTypes = new Set([
  'circle',
  'diamond',
  'rect',
  'vertical-line',
  'horizontal-line',
  'bias-lr',
  'bias-rl',
  'grid',
  'wave'
]);

const point = new Point();
const EMPTY_STATE_NAMES: readonly string[] = [];
const BROAD_UPDATE_CATEGORY =
  UpdateCategory.PAINT |
  UpdateCategory.SHAPE |
  UpdateCategory.BOUNDS |
  UpdateCategory.TRANSFORM |
  UpdateCategory.LAYOUT;

type AttributeDelta = Map<string, { prev: unknown; next: unknown }>;
type GraphicStateTransition = {
  changed: boolean;
  states: string[];
  effectiveStates?: string[];
};
type ResolvedGraphicStateTransition<T> = {
  transition: GraphicStateTransition;
  effectiveStates: string[];
  resolvedStateAttrs: Partial<T>;
};

function isPlainObjectValue(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function cloneAttributeValue<T>(value: T): T {
  if (!isPlainObjectValue(value)) {
    return value;
  }

  const source = value as Record<string, any>;
  const clone: Record<string, any> = {};
  Object.keys(source).forEach(key => {
    const nextValue = source[key];
    clone[key] = isPlainObjectValue(nextValue) ? cloneAttributeValue(nextValue) : nextValue;
  });
  return clone as T;
}

function cloneAttributeSurface<T>(value: T): T {
  if (!isPlainObjectValue(value)) {
    return value;
  }

  const source = value as Record<string, any>;
  const clone: Record<string, any> = {};
  Object.keys(source).forEach(key => {
    const nextValue = source[key];
    clone[key] = isPlainObjectValue(nextValue) ? { ...nextValue } : nextValue;
  });
  return clone as T;
}

function areAttributeValuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }
  if (!isPlainObjectValue(left) && !isPlainObjectValue(right) && !Array.isArray(left) && !Array.isArray(right)) {
    return false;
  }
  return isEqual(left, right);
}

type ExcludedAttributeKeys = Record<string, true>;

function deepMergeAttributeValue(base: Record<string, any>, value: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = cloneAttributeValue(base) ?? {};

  Object.keys(value).forEach(key => {
    const nextValue = value[key];
    const previousValue = result[key];

    if (isPlainObjectValue(previousValue) && isPlainObjectValue(nextValue)) {
      result[key] = deepMergeAttributeValue(previousValue, nextValue);
      return;
    }

    result[key] = cloneAttributeValue(nextValue);
  });

  return result;
}

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

abstract class GraphicImpl<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>>
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
        this.prototype,
        propertyName,
        Object.getOwnPropertyDescriptor(source, propertyName) as PropertyDecorator
      );
    }
  }

  declare _events?: any;

  // 保存语法上下文
  declare context?: Record<string, any>;
  private transientFromAttrsBeforePreventAnimate?: Record<string, any> | null;
  private transientFromAttrsBeforePreventAnimateDiffAttrs?: Record<string, any> | null;

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
  protected _baseAttributes?: Partial<T>;

  get baseAttributes(): Partial<T> {
    return this._baseAttributes ?? this.attribute;
  }

  set baseAttributes(value: Partial<T>) {
    if (value === this.attribute) {
      this._baseAttributes = undefined;
      return;
    }
    this._baseAttributes = value;
  }

  declare shadowRoot?: IShadowRoot;

  declare releaseStatus?: GraphicReleaseStatus;

  /** 记录state对应的图形属性 */
  declare states?: StateDefinitionsInput<T>;
  /** 当前state值 */
  declare currentStates?: string[];
  declare effectiveStates?: string[];
  declare resolvedStatePatch?: Partial<T>;
  declare boundSharedStateScope?: SharedStateScope<T>;
  declare boundSharedStateRevision?: number;
  declare sharedStateDirty?: boolean;
  declare registeredActiveScopes?: Set<SharedStateScope<T>>;
  /** TODO: state更新对应的动画配置 */
  declare stateAnimateConfig?: IAnimateConfig;
  /** 状态样式合并模式，默认浅合并，可选深度合并 */
  declare stateMergeMode?: StateMergeMode;
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

  // 外部设置，用于选择所使用的textMeasureId
  declare textMeasureId?: string;

  // state 排序方法
  protected stateSort?: (stateA: string, stateB: string) => number;
  protected compiledStateDefinitions?: Map<string, CompiledStateDefinition<T>>;
  protected compiledStateDefinitionsCacheKey?: string;
  protected stateEngine?: StateEngine<T>;
  protected stateEngineCompiledDefinitions?: Map<string, CompiledStateDefinition<T>>;
  protected stateEngineStateSort?: (stateA: string, stateB: string) => number;
  protected stateEngineMergeMode?: StateMergeMode;
  protected stateTransitionOrchestrator?: StateTransitionOrchestrator<T>;
  protected localStateDefinitionsSource?: StateDefinitionsInput<T>;
  protected localStateDefinitionsVersion?: number;
  protected resolverEpoch?: number;
  protected attributeMayContainTransientAttrs?: boolean;

  constructor(params: T = {} as T) {
    super();
    this._AABBBounds = new AABBBounds();
    this._updateTag = UpdateTag.INIT;
    this.attribute = params;
    this.valid = this.isValid();
    this.updateAABBBoundsStamp = 0;
    if (params.background) {
      this.loadImage((params.background as any).background ?? params.background, true);
    }
    if (params.texture && isExternalTexture(params.texture)) {
      this.loadImage(params.texture, false);
    }
    if (params.shadowGraphic) {
      this.setShadowGraphic(params.shadowGraphic);
    }
    // this.attribute = createTrackableObject(this.attribute);
  }

  get normalAttrs(): Partial<T> | undefined {
    return this.baseAttributes;
  }

  set normalAttrs(_value: Partial<T> | undefined) {
    void _value;
  }

  protected getBaseAttributesStorage(): Partial<T> {
    return this._baseAttributes ?? this.attribute;
  }

  getGraphicService() {
    return this.stage?.graphicService ?? application.graphicService;
  }

  getAttributes(): T {
    return this.attribute;
  }

  protected getStateTransitionOrchestrator(): StateTransitionOrchestrator<T> {
    if (!this.stateTransitionOrchestrator) {
      this.stateTransitionOrchestrator = new StateTransitionOrchestrator<T>();
    }

    return this.stateTransitionOrchestrator;
  }

  protected resolveBoundSharedStateScope(): SharedStateScope<T> | SharedStateScope<Record<string, any>> | undefined {
    let parent = this.parent as IGroup | null;

    while (parent) {
      if ((parent as any).sharedStateScope) {
        return (parent as any).sharedStateScope;
      }
      parent = parent.parent as IGroup | null;
    }

    return this.stage?.rootSharedStateScope as SharedStateScope<Record<string, any>> | undefined;
  }

  protected syncSharedStateScopeBindingFromTree(markDirty: boolean = true): boolean {
    const nextScope = this.resolveBoundSharedStateScope();
    if (this.boundSharedStateScope === nextScope) {
      this.syncSharedStateActiveRegistrations();
      return false;
    }

    this.boundSharedStateScope = nextScope as SharedStateScope<T> | undefined;
    this.boundSharedStateRevision = undefined;
    this.compiledStateDefinitions = undefined;
    this.compiledStateDefinitionsCacheKey = undefined;
    this.stateEngine = undefined;
    this.stateEngineCompiledDefinitions = undefined;
    this.syncSharedStateActiveRegistrations();

    if (markDirty && this.currentStates?.length) {
      this.markSharedStateDirty();
    }

    return true;
  }

  protected syncSharedStateScopeBindingOnTreeChange(markDirty: boolean = true): boolean {
    if (
      !this.currentStates?.length &&
      !this.boundSharedStateScope &&
      !this.registeredActiveScopes?.size &&
      !this.sharedStateDirty
    ) {
      return false;
    }

    return this.syncSharedStateScopeBindingFromTree(markDirty);
  }

  protected syncSharedStateActiveRegistrations(): void {
    const previousScopes = this.registeredActiveScopes;

    if (!this.currentStates?.length || !this.boundSharedStateScope) {
      if (previousScopes?.size) {
        previousScopes.forEach(scope => {
          scope.subtreeActiveDescendants.delete(this);
        });
        previousScopes.clear();
      }
      this.registeredActiveScopes = undefined;
      return;
    }

    const nextScopes = new Set(collectSharedStateScopeChain(this.boundSharedStateScope));

    previousScopes?.forEach(scope => {
      if (!nextScopes.has(scope)) {
        scope.subtreeActiveDescendants.delete(this);
      }
    });

    nextScopes.forEach(scope => {
      scope.subtreeActiveDescendants.add(this);
    });

    this.registeredActiveScopes = nextScopes;
  }

  protected clearSharedStateActiveRegistrations(): void {
    const previousScopes = this.registeredActiveScopes;
    if (previousScopes) {
      previousScopes.forEach(scope => {
        scope.subtreeActiveDescendants.delete(this);
      });
      previousScopes.clear();
    }
    this.registeredActiveScopes = undefined;
  }

  protected markSharedStateDirty(): void {
    this.sharedStateDirty = true;
    enqueueGraphicSharedStateRefresh(this.stage, this);
    scheduleStageSharedStateRefresh(this.stage);
  }

  onParentSharedStateTreeChanged(stage?: IStage, layer?: ILayer): void {
    if (this.stage !== stage || this.layer !== layer) {
      this.setStage(stage, layer);
      return;
    }

    this.syncSharedStateScopeBindingOnTreeChange();
  }

  refreshSharedStateBeforeRender(): void {
    if (!this.currentStates?.length) {
      this.sharedStateDirty = false;
      return;
    }

    this.syncSharedStateScopeBindingFromTree(false);
    if (this.boundSharedStateScope) {
      ensureSharedStateScopeFresh(this.boundSharedStateScope);
    }

    this.recomputeCurrentStatePatch();
    this.stopStateAnimates();
    this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
    this.emitStateUpdateEvent();
    this.sharedStateDirty = false;
  }

  protected getLocalStatesVersion(): number {
    if (this.localStateDefinitionsSource !== this.states) {
      this.localStateDefinitionsSource = this.states;
      this.localStateDefinitionsVersion = (this.localStateDefinitionsVersion ?? 0) + 1;
    }

    return this.localStateDefinitionsVersion ?? 0;
  }

  protected resolveEffectiveCompiledDefinitions(): {
    compiledDefinitions?: Map<string, CompiledStateDefinition<T>>;
  } {
    this.syncSharedStateScopeBindingFromTree(false);
    const boundScope = this.boundSharedStateScope;
    if (boundScope) {
      ensureSharedStateScopeFresh(boundScope);
      this.boundSharedStateRevision = boundScope.revision;
    }

    const hasStates = !!this.states && Object.keys(this.states).length > 0;
    if (!boundScope) {
      if (!hasStates) {
        return {
          compiledDefinitions: undefined
        };
      }

      const localStatesVersion = this.getLocalStatesVersion();
      const cacheKey = `local:${localStatesVersion}`;
      if (!this.compiledStateDefinitions || this.compiledStateDefinitionsCacheKey !== cacheKey) {
        this.compiledStateDefinitions = new StateDefinitionCompiler<T>().compile(this.states);
        this.compiledStateDefinitionsCacheKey = cacheKey;
      }

      return {
        compiledDefinitions: this.compiledStateDefinitions
      };
    }

    const sharedCompiledDefinitions = boundScope.effectiveCompiledDefinitions as Map<
      string,
      CompiledStateDefinition<T>
    >;
    return {
      compiledDefinitions: sharedCompiledDefinitions
    };
  }

  protected recomputeCurrentStatePatch(): void {
    if (!this.currentStates?.length) {
      this.effectiveStates = [];
      this.resolvedStatePatch = undefined;
      this.syncSharedStateActiveRegistrations();
      return;
    }

    const stateResolveBaseAttrs = this.getStateResolveBaseAttrs();
    const transition = this.resolveUseStatesTransition(this.currentStates, stateResolveBaseAttrs);
    const effectiveStates = transition.effectiveStates ?? transition.states;
    const resolvedStateAttrs =
      this.stateEngine && this.compiledStateDefinitions ? { ...(this.stateEngine.resolvedPatch as Partial<T>) } : {};

    this.currentStates = transition.states;
    this.effectiveStates = [...effectiveStates];
    this.resolvedStatePatch = resolvedStateAttrs;
    this.syncSharedStateActiveRegistrations();
  }

  protected buildStaticAttributeSnapshot(): Partial<T> {
    const snapshot = cloneAttributeValue((this.baseAttributes ?? {}) as Partial<T>) as Partial<T>;
    const resolvedPatch = this.resolvedStatePatch;

    if (!resolvedPatch) {
      return snapshot;
    }

    Object.keys(resolvedPatch).forEach(key => {
      const nextValue = (resolvedPatch as Record<string, any>)[key];
      const previousValue = (snapshot as Record<string, any>)[key];

      if (this.stateMergeMode === 'deep' && isPlainObjectValue(previousValue) && isPlainObjectValue(nextValue)) {
        (snapshot as Record<string, any>)[key] = deepMergeAttributeValue(previousValue, nextValue);
        return;
      }

      (snapshot as Record<string, any>)[key] = cloneAttributeValue(nextValue);
    });

    return snapshot;
  }

  protected buildRemovedStateAnimationAttrs(
    targetStateAttrs: Partial<T>,
    previousResolvedStatePatch?: Partial<T>
  ): Partial<T> {
    const extraAttrs: Record<string, any> = {};

    if (!previousResolvedStatePatch) {
      return extraAttrs as Partial<T>;
    }

    const snapshot = this.buildStaticAttributeSnapshot() as Record<string, any>;
    const staticTargetAttrs = snapshot as Partial<T>;
    Object.keys(previousResolvedStatePatch).forEach(key => {
      const hasTargetAttr = Object.prototype.hasOwnProperty.call(targetStateAttrs, key);
      if (hasTargetAttr && (targetStateAttrs as Record<string, any>)[key] !== undefined) {
        return;
      }

      const assignFallbackAttr = (value: any): void => {
        if (value === undefined && this.shouldSkipStateTransitionDefaultAttribute(key, staticTargetAttrs)) {
          return;
        }
        extraAttrs[key] = value === undefined ? value : cloneAttributeValue(value);
      };

      if (hasTargetAttr) {
        assignFallbackAttr(this.getStateTransitionDefaultAttribute(key, staticTargetAttrs));
        return;
      }

      if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
        const snapshotValue = snapshot[key];
        assignFallbackAttr(
          snapshotValue === undefined ? this.getStateTransitionDefaultAttribute(key, staticTargetAttrs) : snapshotValue
        );
        return;
      }

      assignFallbackAttr(this.getStateTransitionDefaultAttribute(key, staticTargetAttrs));
    });

    return extraAttrs as Partial<T>;
  }

  protected syncObjectToSnapshot(
    target: Record<string, any>,
    snapshot: Record<string, any>,
    excludedKeys?: ExcludedAttributeKeys
  ): AttributeDelta {
    const delta: AttributeDelta = new Map();
    const keySet = new Set<string>([...Object.keys(target), ...Object.keys(snapshot)]);

    keySet.forEach(key => {
      if (excludedKeys?.[key] === true) {
        return;
      }
      const hasNext = Object.prototype.hasOwnProperty.call(snapshot, key);
      const previousValue = target[key];

      if (!hasNext) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          delta.set(key, { prev: previousValue, next: undefined });
          delete target[key];
        }
        return;
      }

      const nextValue = snapshot[key];
      if (areAttributeValuesEqual(previousValue, nextValue)) {
        return;
      }

      delta.set(key, { prev: previousValue, next: nextValue });
      target[key] = cloneAttributeValue(nextValue);
    });

    return delta;
  }

  protected _syncAttribute(excludedKeys?: ExcludedAttributeKeys): AttributeDelta {
    if (this.attribute === this.baseAttributes && this.resolvedStatePatch) {
      this.detachAttributeFromBaseAttributes();
    }
    const snapshot = this.buildStaticAttributeSnapshot() as Record<string, any>;
    const delta = this.syncObjectToSnapshot(this.attribute as Record<string, any>, snapshot, excludedKeys);
    this.valid = this.isValid();
    this.attributeMayContainTransientAttrs = !!excludedKeys;
    return delta;
  }

  protected _syncFinalAttributeFromStaticTruth(excludedKeys?: ExcludedAttributeKeys): void {
    const target = (this as any).finalAttribute;
    if (!target) {
      return;
    }
    const snapshot = this.buildStaticAttributeSnapshot() as Record<string, any>;
    this.syncObjectToSnapshot(target, snapshot, excludedKeys);
  }

  protected mergeAttributeDeltaCategory(category: UpdateCategory, key: string, prev: unknown, next: unknown) {
    let nextCategory =
      key === 'stroke' || key === 'shadowBlur'
        ? classifyAttributeDelta(key, prev, next)
        : ATTRIBUTE_CATEGORY[key] ?? UpdateCategory.PAINT;
    if (nextCategory & UpdateCategory.PICK) {
      // Phase 2 keeps PICK invalidation on the existing bounds path instead of adding a dedicated pick tag.
      nextCategory |= UpdateCategory.BOUNDS;
    }
    if (nextCategory === UpdateCategory.PAINT && this.needUpdateTag(key)) {
      nextCategory = UpdateCategory.SHAPE | UpdateCategory.BOUNDS;
    }
    return category | nextCategory;
  }

  protected submitUpdateByCategory(category: UpdateCategory, forceUpdateTag: boolean = false): void {
    if (forceUpdateTag) {
      this.addUpdateShapeAndBoundsTag();
      this.addUpdatePositionTag();
      this.addUpdateLayoutTag();
      return;
    }

    if ((category & BROAD_UPDATE_CATEGORY) === BROAD_UPDATE_CATEGORY) {
      this.addBroadUpdateTag();
      return;
    }

    if (category & UpdateCategory.SHAPE) {
      this.addUpdateShapeAndBoundsTag();
    } else if (category & UpdateCategory.BOUNDS) {
      this.addUpdateBoundTag();
    }

    if (category & UpdateCategory.PAINT) {
      this.addUpdatePaintTag();
    }

    if (category & UpdateCategory.TRANSFORM) {
      this.addUpdatePositionTag();
    }

    if (category & UpdateCategory.LAYOUT) {
      this.addUpdateLayoutTag();
    }
  }

  protected submitUpdateByDelta(delta: AttributeDelta, forceUpdateTag: boolean = false): void {
    let category = UpdateCategory.NONE;

    delta.forEach((entry, key) => {
      category = this.mergeAttributeDeltaCategory(category, key, entry.prev, entry.next);
    });

    this.submitUpdateByCategory(category, forceUpdateTag);
  }

  protected submitTouchedKeyUpdate(keys: string[], forceUpdateTag: boolean = false): void {
    this.submitTouchedUpdate(forceUpdateTag || this.needUpdateTags(keys));
  }

  protected submitTouchedUpdate(needsShapeAndBounds: boolean): void {
    if (!this.updateShapeAndBoundsTagSetted() && needsShapeAndBounds) {
      this.addUpdateShapeAndBoundsTag();
    } else {
      this.addUpdateBoundTag();
    }
    this.addUpdatePositionTag();
    this.addUpdateLayoutTag();
  }

  protected commitBaseAttributeMutation(forceUpdateTag: boolean = false, context?: ISetAttributeContext): void {
    if (this.currentStates?.length) {
      this.resolverEpoch = (this.resolverEpoch ?? 0) + 1;
      this.stateEngine?.invalidateResolverCache();
      this.recomputeCurrentStatePatch();
    }
    const delta = this._syncAttribute();
    this.submitUpdateByDelta(delta, forceUpdateTag);
    this.onAttributeUpdate(context);
  }

  protected canCommitBaseAttributesByTouchedKeys(): boolean {
    if (this.currentStates?.length || this.resolvedStatePatch || this.attributeMayContainTransientAttrs) {
      return false;
    }
    if (!this.animates?.size && !(this as any)._animationStateManager) {
      return true;
    }
    return !this.hasAnyTrackedAnimate();
  }

  protected detachAttributeFromBaseAttributes(): void {
    if (this.attribute === this.baseAttributes) {
      this._baseAttributes = this.attribute as Partial<T>;
      this.attribute = cloneAttributeSurface(this.attribute) as T;
    }
  }

  protected commitInternalBaseAttributes(params: Partial<T>, context?: ISetAttributeContext): void {
    if (!params || !Object.keys(params).length) {
      return;
    }

    if (this.canCommitBaseAttributesByTouchedKeys()) {
      this.commitBaseAttributesByTouchedKeys(params, false, context);
      return;
    }

    this.detachAttributeFromBaseAttributes();
    this.applyBaseAttributes(params);
    this.commitBaseAttributeMutation(false, context);
  }

  protected commitBaseAttributesByTouchedKeys(
    params: Partial<T>,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ): void {
    const source = params as Record<string, any>;
    const baseAttributes = this.getBaseAttributesStorage() as Record<string, any>;
    let hasKeys = false;
    let needsShapeAndBounds = forceUpdateTag;

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }
      hasKeys = true;
      baseAttributes[key] = source[key];
      if (!needsShapeAndBounds && this.needUpdateTag(key)) {
        needsShapeAndBounds = true;
      }
    }

    if (!hasKeys) {
      return;
    }

    this.attribute = baseAttributes as T;
    this._baseAttributes = undefined;
    this.valid = this.isValid();
    this.attributeMayContainTransientAttrs = false;
    this.submitTouchedUpdate(needsShapeAndBounds);
    this.onAttributeUpdate(context);
  }

  protected commitBaseAttributeBySingleKey(
    key: string,
    value: any,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ): void {
    (this.getBaseAttributesStorage() as Record<string, any>)[key] = value;
    this.attribute = this.getBaseAttributesStorage() as T;
    this._baseAttributes = undefined;
    this.valid = this.isValid();
    this.attributeMayContainTransientAttrs = false;
    this.submitTouchedUpdate(forceUpdateTag || this.needUpdateTag(key));
    this.onAttributeUpdate(context);
  }

  protected applyBaseAttributes(params: Partial<T>) {
    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      (this.getBaseAttributesStorage() as Record<string, any>)[key] = (params as any)[key];
    }
  }

  protected _commitAnimationStaticAttributes(params: Partial<T>, context?: ISetAttributeContext): void {
    if (!params) {
      return;
    }

    const source = params as Record<string, any>;
    const baseAttributes = this.getBaseAttributesStorage() as Record<string, any>;
    const target = this.attribute as Record<string, any>;
    const delta: AttributeDelta = new Map();
    let hasKeys = false;

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }
      hasKeys = true;
      const previousValue = target[key];
      const nextValue = source[key];
      baseAttributes[key] = nextValue;
      target[key] = nextValue;
      if (!areAttributeValuesEqual(previousValue, nextValue)) {
        delta.set(key, { prev: previousValue, next: nextValue });
      }
    }

    if (!hasKeys) {
      return;
    }

    this.valid = this.isValid();
    this.attributeMayContainTransientAttrs = true;
    this.submitUpdateByDelta(delta);
    this.onAttributeUpdate(context);
  }

  applyAnimationTransientAttributes(
    params: Partial<T>,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ) {
    const source = params as Record<string, any>;
    let target: Record<string, any> | undefined;
    let needsShapeAndBounds = forceUpdateTag;

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }
      if (!target) {
        this.detachAttributeFromBaseAttributes();
        target = this.attribute as Record<string, any>;
      }
      target[key] = source[key];
      if (!needsShapeAndBounds && this.needUpdateTag(key)) {
        needsShapeAndBounds = true;
      }
    }

    if (!target) {
      return;
    }

    this.attributeMayContainTransientAttrs = true;
    this.valid = this.isValid();
    this.submitTouchedUpdate(needsShapeAndBounds);
    this.onAttributeUpdate(context);
  }

  protected applyTransientAttributes(
    params: Partial<T>,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ) {
    this.detachAttributeFromBaseAttributes();
    const delta: AttributeDelta = new Map();
    const keys = Object.keys(params);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const previousValue = (this.attribute as Record<string, any>)[key];
      const nextValue = (params as Record<string, any>)[key];
      if (areAttributeValuesEqual(previousValue, nextValue)) {
        continue;
      }
      delta.set(key, { prev: previousValue, next: nextValue });
      (this.attribute as Record<string, any>)[key] = nextValue;
    }

    if (delta.size) {
      this.attributeMayContainTransientAttrs = true;
    }
    this.valid = this.isValid();
    this.submitUpdateByDelta(delta, forceUpdateTag);
    this.onAttributeUpdate(context);
  }

  protected _restoreAttributeFromStaticTruth(
    context?: ISetAttributeContext,
    excludedKeys?: ExcludedAttributeKeys
  ): void {
    this._syncFinalAttributeFromStaticTruth(excludedKeys);
    const delta = this._syncAttribute(excludedKeys);
    this.submitUpdateByDelta(delta);
    this.onAttributeUpdate(context);
  }

  protected collectStatePatchDeltaKeys(previousPatch?: Partial<T>, nextPatch?: Partial<T>): string[] {
    const keys = previousPatch ? Object.keys(previousPatch) : [];
    if (!nextPatch) {
      return keys;
    }

    for (const key in nextPatch) {
      if (
        Object.prototype.hasOwnProperty.call(nextPatch, key) &&
        !Object.prototype.hasOwnProperty.call(previousPatch ?? {}, key)
      ) {
        keys.push(key);
      }
    }
    return keys;
  }

  protected getStaticTruthValueForStateKey(key: string, nextPatch?: Partial<T>): { hasValue: boolean; value: any } {
    const baseAttributes = (this.baseAttributes ?? {}) as Record<string, any>;
    const patch = nextPatch as Record<string, any> | undefined;

    if (patch && Object.prototype.hasOwnProperty.call(patch, key)) {
      const patchValue = patch[key];
      const baseValue = baseAttributes[key];
      if (this.stateMergeMode === 'deep' && isPlainObjectValue(baseValue) && isPlainObjectValue(patchValue)) {
        return {
          hasValue: true,
          value: deepMergeAttributeValue(baseValue, patchValue)
        };
      }
      return {
        hasValue: true,
        value: patchValue
      };
    }

    if (Object.prototype.hasOwnProperty.call(baseAttributes, key)) {
      return {
        hasValue: true,
        value: baseAttributes[key]
      };
    }

    return {
      hasValue: false,
      value: undefined
    };
  }

  protected syncStatePatchDeltaToTarget(
    target: Record<string, any>,
    keys: string[],
    nextPatch?: Partial<T>,
    collectCategory: boolean = false
  ): UpdateCategory {
    let category = UpdateCategory.NONE;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const previousValue = target[key];
      const next = this.getStaticTruthValueForStateKey(key, nextPatch);

      if (!next.hasValue) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          delete target[key];
          if (collectCategory) {
            category = this.mergeAttributeDeltaCategory(category, key, previousValue, undefined);
          }
        }
        continue;
      }

      if (areAttributeValuesEqual(previousValue, next.value)) {
        continue;
      }

      const nextValue = cloneAttributeValue(next.value);
      target[key] = nextValue;
      if (collectCategory) {
        category = this.mergeAttributeDeltaCategory(category, key, previousValue, nextValue);
      }
    }

    return category;
  }

  protected restoreAttributeFromStatePatchDelta(
    previousPatch?: Partial<T>,
    nextPatch?: Partial<T>,
    context?: ISetAttributeContext
  ): void {
    this.detachAttributeFromBaseAttributes();
    const keys = this.collectStatePatchDeltaKeys(previousPatch, nextPatch);
    const finalAttribute = (this as any).finalAttribute as Record<string, any> | undefined;
    if (finalAttribute) {
      this.syncStatePatchDeltaToTarget(finalAttribute, keys, nextPatch, false);
    }
    const category = this.syncStatePatchDeltaToTarget(this.attribute as Record<string, any>, keys, nextPatch, true);

    this.valid = this.isValid();
    this.attributeMayContainTransientAttrs = false;
    this.submitUpdateByCategory(category);
    this.onAttributeUpdate(context);
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
    this.detachAttributeFromBaseAttributes();
    this._emitCustomEvent('animate-bind', animate);
  }

  protected visitTrackedAnimates(cb: (animate: IAnimate) => void) {
    const hook = (this as any).forEachTrackedAnimate;
    if (typeof hook === 'function') {
      hook.call(this, cb);
      return;
    }
    this.animates && this.animates.forEach(cb);
  }

  protected hasAnyTrackedAnimate() {
    const hook = (this as any).hasTrackedAnimate;
    if (typeof hook === 'function') {
      return hook.call(this);
    }
    const getTrackedAnimates = (this as any).getTrackedAnimates;
    if (typeof getTrackedAnimates === 'function') {
      return getTrackedAnimates.call(this).size > 0;
    }
    return !!this.animates?.size;
  }

  protected mayHaveTrackedAnimates() {
    return !!this.animates?.size || !!(this as any)._animationStateManager;
  }

  protected tryUpdateAABBBounds(): IAABBBounds {
    if (!this.shadowRoot && !(this._updateTag & UpdateTag.UPDATE_BOUNDS)) {
      return this._AABBBounds;
    }
    const full = this.attribute.boundsMode === 'imprecise';

    if (!this.shadowRoot) {
      const graphicService = this.getGraphicService();
      const graphicTheme = this.getGraphicTheme() as Required<T>;
      if (!graphicService.validCheck(this.attribute, graphicTheme, this._AABBBounds, this)) {
        return this._AABBBounds;
      }
      if (!this.valid) {
        this._AABBBounds.clear();
        return this._AABBBounds;
      }

      graphicService.beforeUpdateAABBBounds(this, this.stage, true, this._AABBBounds);
      const bounds = this.doUpdateAABBBounds(full, graphicTheme);
      graphicService.afterUpdateAABBBounds(this, this.stage, this._AABBBounds, this, true);

      // 直接返回空Bounds，但是前面的流程还是要走
      if (this.attribute.boundsMode === 'empty') {
        bounds.clear();
      }
      return bounds;
    }

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

  protected doUpdateAABBBounds(full?: boolean, graphicTheme?: Required<T>): IAABBBounds {
    this.updateAABBBoundsStamp++;
    const resolvedGraphicTheme = graphicTheme ?? (this.getGraphicTheme() as Required<T>);
    this._AABBBounds.clear();
    const attribute = this.attribute;
    const bounds = this.updateAABBBounds(attribute, resolvedGraphicTheme, this._AABBBounds, full) as AABBBounds;

    const { boundsPadding = resolvedGraphicTheme.boundsPadding } = attribute;
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
    if (!params) {
      return;
    }
    const keys = Object.keys(params);
    this.captureTransientFromAttrsBeforePreventAnimate(params, keys, context);
    this.syncFinalAttributesFromUpdateContext(context);
    this.visitTrackedAnimates(animate => {
      // 优先级最高的动画（一般是循环动画），不屏蔽
      if (animate.priority === Infinity && !ignorePriority) {
        return;
      }
      animate.preventAttrs(keys);
    });
    this.applyTransientAttributes(params, forceUpdateTag, context);
  }

  protected syncFinalAttributesFromUpdateContext(context?: ISetAttributeContext): void {
    const updateType = context?.type;
    if (
      updateType === AttributeUpdateType.STATE ||
      (updateType != null &&
        updateType >= AttributeUpdateType.ANIMATE_BIND &&
        updateType <= AttributeUpdateType.ANIMATE_END)
    ) {
      return;
    }

    const finalAttrs = (this.context as Record<string, any> | undefined)?.finalAttrs;
    const setFinalAttributes = (this as any).setFinalAttributes;
    if (finalAttrs && typeof setFinalAttributes === 'function') {
      setFinalAttributes.call(this, finalAttrs);
    }
  }

  protected captureTransientFromAttrsBeforePreventAnimate(
    params: Partial<T>,
    keys: string[],
    context?: ISetAttributeContext
  ) {
    const graphicContext = this.context as Record<string, any> | undefined;
    const diffAttrs = (graphicContext?.diffAttrs as Record<string, any> | undefined) ?? (params as Record<string, any>);
    const updateType = context?.type;
    if (
      !keys.length ||
      !diffAttrs ||
      updateType === AttributeUpdateType.STATE ||
      (updateType != null &&
        updateType >= AttributeUpdateType.ANIMATE_BIND &&
        updateType <= AttributeUpdateType.ANIMATE_END)
    ) {
      return;
    }

    const sameDiffAttrs = this.transientFromAttrsBeforePreventAnimateDiffAttrs === diffAttrs;
    let fromAttrs: Record<string, any> | null = sameDiffAttrs
      ? this.transientFromAttrsBeforePreventAnimate ?? null
      : null;
    if (!sameDiffAttrs) {
      this.transientFromAttrsBeforePreventAnimate = null;
      this.transientFromAttrsBeforePreventAnimateDiffAttrs = null;
    }
    let captured = false;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!Object.prototype.hasOwnProperty.call(diffAttrs, key)) {
        continue;
      }

      const previousValue = (this.attribute as Record<string, any>)[key];
      const nextValue = (params as Record<string, any>)[key];
      if (isEqual(previousValue, nextValue)) {
        continue;
      }

      fromAttrs ?? (fromAttrs = {});
      fromAttrs[key] = cloneAttributeValue(previousValue);
      captured = true;
    }

    if (captured) {
      this.transientFromAttrsBeforePreventAnimate = fromAttrs;
      this.transientFromAttrsBeforePreventAnimateDiffAttrs = diffAttrs;
    }
  }

  protected consumeTransientFromAttrsBeforePreventAnimate(diffAttrs: Record<string, any>): Record<string, any> | null {
    const transientFromAttrs = this.transientFromAttrsBeforePreventAnimate;
    const sourceDiffAttrs = this.transientFromAttrsBeforePreventAnimateDiffAttrs;
    if (!transientFromAttrs || !sourceDiffAttrs) {
      return null;
    }
    for (const key in diffAttrs) {
      if (
        Object.prototype.hasOwnProperty.call(diffAttrs, key) &&
        (!Object.prototype.hasOwnProperty.call(sourceDiffAttrs, key) || !isEqual(sourceDiffAttrs[key], diffAttrs[key]))
      ) {
        return null;
      }
    }

    let fromAttrs: Record<string, any> | null = null;
    let remaining = false;
    for (const key in transientFromAttrs) {
      if (!Object.prototype.hasOwnProperty.call(transientFromAttrs, key)) {
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(diffAttrs, key)) {
        fromAttrs ?? (fromAttrs = {});
        fromAttrs[key] = transientFromAttrs[key];
        continue;
      }

      remaining = true;
    }

    if (remaining) {
      const nextTransientFromAttrs: Record<string, any> = {};
      for (const key in transientFromAttrs) {
        if (
          Object.prototype.hasOwnProperty.call(transientFromAttrs, key) &&
          !Object.prototype.hasOwnProperty.call(diffAttrs, key)
        ) {
          nextTransientFromAttrs[key] = transientFromAttrs[key];
        }
      }
      this.transientFromAttrsBeforePreventAnimate = nextTransientFromAttrs;
    } else {
      this.transientFromAttrsBeforePreventAnimate = null;
      this.transientFromAttrsBeforePreventAnimateDiffAttrs = null;
    }

    return fromAttrs;
  }

  setAttributes(params: Partial<T>, forceUpdateTag: boolean = false, context?: ISetAttributeContext) {
    if (!params) {
      return;
    }
    params =
      (this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate(params, this.attribute, null, context)) || params;

    if (params.background) {
      this.loadImage(params.background, true);
    }
    if (params.texture && isExternalTexture(params.texture)) {
      this.loadImage(params.texture, false);
    }
    if (params.shadowGraphic) {
      this.setShadowGraphic(params.shadowGraphic);
    }
    this._setAttributes(params, forceUpdateTag, context);
  }

  _setAttributes(params: Partial<T>, forceUpdateTag: boolean = false, context?: ISetAttributeContext) {
    if (this.canCommitBaseAttributesByTouchedKeys()) {
      this.commitBaseAttributesByTouchedKeys(params, forceUpdateTag, context);
      return;
    }
    this.detachAttributeFromBaseAttributes();
    this.applyBaseAttributes(params);
    this.commitBaseAttributeMutation(forceUpdateTag, context);
  }

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext) {
    const params =
      this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate({ [key]: value }, this.attribute, key, context);
    if (!params) {
      if (this.canCommitBaseAttributesByTouchedKeys()) {
        this.commitBaseAttributeBySingleKey(key, value, !!forceUpdateTag, context);
      } else {
        const nextAttrs = { [key]: value } as Partial<T>;
        this.applyBaseAttributes(nextAttrs);
        this.commitBaseAttributeMutation(!!forceUpdateTag, context);
      }
    } else {
      this._setAttributes(params, forceUpdateTag, context);
    }
    if (key === 'background') {
      this.loadImage(value, true);
    } else if (key === 'texture' && isExternalTexture(value)) {
      this.loadImage(value, false);
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
    this._baseAttributes = undefined;
    this.resolvedStatePatch = undefined;
    this.attributeMayContainTransientAttrs = false;
    this.valid = this.isValid();
    if (params.background) {
      this.loadImage(params.background, true);
    }
    if (params.texture && isExternalTexture(params.texture)) {
      this.loadImage(params.texture, false);
    }
    if (params.shadowGraphic) {
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
    }
    const attribute = this.baseAttributes as T;
    const postMatrix = attribute.postMatrix;
    const nextAttrs = (params || {}) as Partial<T>;
    if (!postMatrix) {
      (nextAttrs as any).x = (attribute.x ?? DefaultTransform.x) + x;
      (nextAttrs as any).y = (attribute.y ?? DefaultTransform.y) + y;
    } else {
      const nextPostMatrix = postMatrix.clone();
      application.transformUtil.fromMatrix(nextPostMatrix, nextPostMatrix).translate(x, y);
      (nextAttrs as any).postMatrix = nextPostMatrix;
    }

    this.commitInternalBaseAttributes(nextAttrs, context);
    return this;
  }

  translateTo(x: number, y: number) {
    const attribute = this.baseAttributes as T;
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
      this.commitInternalBaseAttributes(params, context);
      return this;
    }
    this.commitInternalBaseAttributes({ x, y } as Partial<T>, context);
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
    }
    const attribute = this.baseAttributes as T;
    const nextAttrs = (params || {}) as Partial<T>;
    if (!scaleCenter) {
      (nextAttrs as any).scaleX = (attribute.scaleX ?? DefaultTransform.scaleX) * scaleX;
      (nextAttrs as any).scaleY = (attribute.scaleY ?? DefaultTransform.scaleY) * scaleY;
    } else {
      let { postMatrix } = this.baseAttributes as T;
      if (!postMatrix) {
        postMatrix = new Matrix();
      } else {
        postMatrix = postMatrix.clone();
      }
      application.transformUtil.fromMatrix(postMatrix, postMatrix).scale(scaleX, scaleY, scaleCenter);
      (nextAttrs as any).postMatrix = postMatrix;
    }
    this.commitInternalBaseAttributes(nextAttrs, context);
    return this;
  }

  scaleTo(scaleX: number, scaleY: number) {
    const attribute = this.baseAttributes as T;
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
      this.commitInternalBaseAttributes(params, context);
      return this;
    }
    this.commitInternalBaseAttributes({ scaleX, scaleY } as Partial<T>, context);
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
    }
    const attribute = this.baseAttributes as T;
    const nextAttrs = (params || {}) as Partial<T>;
    if (!rotateCenter) {
      (nextAttrs as any).angle = (attribute.angle ?? DefaultTransform.angle) + angle;
    } else {
      let { postMatrix } = this.baseAttributes as T;
      if (!postMatrix) {
        postMatrix = new Matrix();
      } else {
        postMatrix = postMatrix.clone();
      }
      application.transformUtil.fromMatrix(postMatrix, postMatrix).rotate(angle, rotateCenter);
      (nextAttrs as any).postMatrix = postMatrix;
    }
    this.commitInternalBaseAttributes(nextAttrs, context);
    return this;
  }

  rotateTo(angle: number) {
    const attribute = this.baseAttributes as T;
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
      this.commitInternalBaseAttributes(params, context);
      return this;
    }
    this.commitInternalBaseAttributes({ angle } as Partial<T>, context);
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
  getState(stateName: string): Partial<T> | StateDefinition<T> | undefined {
    return this.states?.[stateName];
  }

  protected getStateResolveBaseAttrs(): Partial<T> {
    return (this.baseAttributes ?? this.attribute) as Partial<T>;
  }

  protected syncStateResolveContext(stateResolveBaseAttrs: Partial<T> = this.getStateResolveBaseAttrs()): Partial<T> {
    this.stateEngine?.setResolveContext(this, stateResolveBaseAttrs);
    return stateResolveBaseAttrs;
  }

  protected ensureStateEngine(stateResolveBaseAttrs: Partial<T> = this.getStateResolveBaseAttrs()) {
    const { compiledDefinitions } = this.resolveEffectiveCompiledDefinitions();
    this.compiledStateDefinitions = compiledDefinitions;

    if (!compiledDefinitions) {
      this.stateEngine = undefined;
      this.stateEngineCompiledDefinitions = undefined;
    } else if (
      !this.stateEngine ||
      this.stateEngineCompiledDefinitions !== compiledDefinitions ||
      this.stateEngineStateSort !== this.stateSort ||
      this.stateEngineMergeMode !== this.stateMergeMode
    ) {
      this.stateEngine = new StateEngine<T>({
        compiledDefinitions,
        stateSort: this.stateSort,
        mergeMode: this.stateMergeMode
      });
      this.stateEngineCompiledDefinitions = compiledDefinitions;
      this.stateEngineStateSort = this.stateSort;
      this.stateEngineMergeMode = this.stateMergeMode;
    }

    this.syncStateResolveContext(stateResolveBaseAttrs);

    if (
      this.stateEngine &&
      this.currentStates &&
      !this.sameStateNames(this.stateEngine.activeStates, this.currentStates)
    ) {
      this.stateEngine.applyStates(this.currentStates);
    }

    return this.stateEngine;
  }

  protected toGraphicStateTransition(result: StateTransitionResult): GraphicStateTransition {
    return {
      changed: result.changed,
      states: [...result.activeStates],
      effectiveStates: [...result.effectiveStates]
    };
  }

  protected sortLocalStates(states: readonly string[]): string[] {
    return this.stateSort ? [...states].sort(this.stateSort) : [...states];
  }

  protected resolveLocalUseStatesTransition(states: readonly string[]): GraphicStateTransition {
    if (!states.length) {
      return this.resolveLocalClearStatesTransition();
    }

    const previousStates = this.currentStates ?? EMPTY_STATE_NAMES;
    const changed =
      previousStates.length !== states.length || states.some((stateName, index) => previousStates[index] !== stateName);
    const nextStates = this.sortLocalStates(states);

    return {
      changed,
      states: changed ? nextStates : [...previousStates]
    };
  }

  protected resolveLocalClearStatesTransition(): GraphicStateTransition {
    return {
      changed: this.hasState(),
      states: []
    };
  }

  protected resolveUseStatesTransition(
    states: string[],
    stateResolveBaseAttrs: Partial<T> = this.getStateResolveBaseAttrs()
  ): GraphicStateTransition {
    const stateEngine = this.ensureStateEngine(stateResolveBaseAttrs);
    return stateEngine
      ? this.toGraphicStateTransition(stateEngine.applyStates(states))
      : this.resolveLocalUseStatesTransition(states);
  }

  protected resolveClearStatesTransition(): GraphicStateTransition {
    const stateEngine = this.ensureStateEngine();
    return stateEngine
      ? this.toGraphicStateTransition(stateEngine.clearStates())
      : this.resolveLocalClearStatesTransition();
  }

  protected resolveAddStateTransition(stateName: string, keepCurrentStates?: boolean): GraphicStateTransition {
    const stateEngine = this.ensureStateEngine();
    if (stateEngine) {
      return this.toGraphicStateTransition(stateEngine.addState(stateName, keepCurrentStates));
    }

    if (
      this.currentStates &&
      this.currentStates.includes(stateName) &&
      (keepCurrentStates || this.currentStates.length === 1)
    ) {
      return {
        changed: false,
        states: [...this.currentStates]
      };
    }

    const nextStates =
      keepCurrentStates && this.currentStates?.length ? this.currentStates.concat([stateName]) : [stateName];

    return this.resolveLocalUseStatesTransition(nextStates);
  }

  protected resolveRemoveStateTransition(stateName: string | string[]): GraphicStateTransition {
    const stateEngine = this.ensureStateEngine();
    if (stateEngine) {
      return this.toGraphicStateTransition(stateEngine.removeState(stateName));
    }

    if (!this.currentStates) {
      return {
        changed: false,
        states: []
      };
    }

    const filter = Array.isArray(stateName) ? (s: string) => !stateName.includes(s) : (s: string) => s !== stateName;
    const nextStates = this.currentStates.filter(filter);

    if (nextStates.length === this.currentStates.length) {
      return {
        changed: false,
        states: [...this.currentStates]
      };
    }

    return this.resolveLocalUseStatesTransition(nextStates);
  }

  protected resolveToggleStateTransition(stateName: string): GraphicStateTransition {
    const stateEngine = this.ensureStateEngine();
    if (stateEngine) {
      return this.toGraphicStateTransition(stateEngine.toggleState(stateName));
    }

    if (this.hasState(stateName)) {
      return this.resolveRemoveStateTransition(stateName);
    }

    const nextStates = this.currentStates ? this.currentStates.slice() : [];
    nextStates.push(stateName);

    return this.resolveLocalUseStatesTransition(nextStates);
  }

  protected resolveGraphicStateTransition(
    states: string[],
    forceResolverRefresh: boolean = false
  ): ResolvedGraphicStateTransition<T> {
    const stateResolveBaseAttrs = this.getStateResolveBaseAttrs();
    const stateEngine = this.ensureStateEngine(stateResolveBaseAttrs);
    if (forceResolverRefresh) {
      stateEngine?.invalidateResolverCache();
    }
    const transition = stateEngine
      ? this.toGraphicStateTransition(stateEngine.applyStates(states))
      : this.resolveLocalUseStatesTransition(states);
    const resolvedStateAttrs =
      this.stateEngine && this.compiledStateDefinitions ? { ...(this.stateEngine.resolvedPatch as Partial<T>) } : {};

    const effectiveStates = transition.effectiveStates ?? transition.states;

    return {
      transition,
      effectiveStates: effectiveStates as string[],
      resolvedStateAttrs
    };
  }

  protected normalizeSetStatesOptions(options?: boolean | ISetStatesOptions): {
    hasAnimation?: boolean;
    animateSameStatePatchChange: boolean;
    shouldRefreshSameStatePatch: boolean;
  } {
    if (options && typeof options === 'object') {
      return {
        hasAnimation: options.animate,
        animateSameStatePatchChange: options.animateSameStatePatchChange === true,
        shouldRefreshSameStatePatch: true
      };
    }

    return {
      hasAnimation: typeof options === 'boolean' ? options : undefined,
      animateSameStatePatchChange: false,
      shouldRefreshSameStatePatch: false
    };
  }

  protected sameStatePatches(left?: Partial<T>, right?: Partial<T>): boolean {
    const leftRecord = (left ?? {}) as Record<string, unknown>;
    const rightRecord = (right ?? {}) as Record<string, unknown>;
    const keys = new Set<string>([...Object.keys(leftRecord), ...Object.keys(rightRecord)]);

    for (const key of keys) {
      const hasLeft = Object.prototype.hasOwnProperty.call(leftRecord, key);
      const hasRight = Object.prototype.hasOwnProperty.call(rightRecord, key);
      if (hasLeft !== hasRight) {
        return false;
      }
      if (!areAttributeValuesEqual(leftRecord[key], rightRecord[key])) {
        return false;
      }
    }

    return true;
  }

  protected commitSameStatePatchRefresh(
    states: string[],
    hasAnimation?: boolean,
    animateSameStatePatchChange: boolean = false
  ): void {
    const previousStates = this.currentStates ?? EMPTY_STATE_NAMES;
    const previousResolvedStatePatch = this.resolvedStatePatch;
    const { transition, effectiveStates, resolvedStateAttrs } = this.resolveGraphicStateTransition(states, true);
    const patchChanged = !this.sameStatePatches(previousResolvedStatePatch, resolvedStateAttrs);

    if (
      patchChanged &&
      !this.beforeStateUpdate(resolvedStateAttrs, previousStates, transition.states, hasAnimation, false)
    ) {
      return;
    }

    this.currentStates = transition.states;
    this.effectiveStates = [...effectiveStates];
    this.resolvedStatePatch = resolvedStateAttrs;
    this.sharedStateDirty = false;
    this.syncSharedStateActiveRegistrations();

    if (!patchChanged) {
      return;
    }

    if (hasAnimation && animateSameStatePatchChange) {
      this._syncFinalAttributeFromStaticTruth();
      this.applyStateAttrs(
        resolvedStateAttrs,
        transition.states,
        hasAnimation,
        false,
        undefined,
        this.buildRemovedStateAnimationAttrs(resolvedStateAttrs, previousResolvedStatePatch)
      );
    } else {
      this.stopStateAnimates();
      if (this.attributeMayContainTransientAttrs) {
        this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
      } else {
        this.restoreAttributeFromStatePatchDelta(previousResolvedStatePatch, this.resolvedStatePatch, {
          type: AttributeUpdateType.STATE
        });
      }
      this.emitStateUpdateEvent();
    }
  }

  protected resolveStateAnimateConfig(animateConfig?: IAnimateConfig) {
    return animateConfig ?? this.stateAnimateConfig ?? this.context?.stateAnimateConfig ?? DefaultStateAnimateConfig;
  }

  applyStateAttrs(
    attrs: Partial<T>,
    stateNames: string[],
    hasAnimation?: boolean,
    isClear?: boolean,
    animateConfig?: IAnimateConfig,
    extraAnimateAttrs?: Partial<T>
  ) {
    const resolvedAnimateConfig = hasAnimation ? this.resolveStateAnimateConfig(animateConfig) : undefined;
    const transitionOptions = resolvedAnimateConfig
      ? {
          animateConfig: resolvedAnimateConfig,
          extraAnimateAttrs: extraAnimateAttrs as Record<string, unknown>,
          shouldSkipDefaultAttribute: this.shouldSkipStateTransitionDefaultAttribute.bind(this) as (
            key: string,
            targetAttrs: Record<string, unknown>
          ) => boolean
        }
      : undefined;

    if (isClear) {
      this.getStateTransitionOrchestrator().applyClearTransition(this as any, attrs, hasAnimation, transitionOptions);
      return;
    }

    const plan = this.getStateTransitionOrchestrator().analyzeTransition(attrs, hasAnimation, {
      noWorkAnimateAttr: this.getNoWorkAnimateAttr(),
      animateConfig: resolvedAnimateConfig,
      extraAnimateAttrs: extraAnimateAttrs as Record<string, unknown>,
      shouldSkipDefaultAttribute: this.shouldSkipStateTransitionDefaultAttribute.bind(this) as (
        key: string,
        targetAttrs: Record<string, unknown>
      ) => boolean
    });

    this.getStateTransitionOrchestrator().applyTransition(this as any, plan, hasAnimation, transitionOptions);
  }

  updateNormalAttrs(_stateAttrs: Partial<T>) {
    void _stateAttrs;
  }

  protected getStateTransitionDefaultAttribute(key: string, targetAttrs?: Partial<T>) {
    return this.getDefaultAttribute(key);
  }

  protected shouldSkipStateTransitionDefaultAttribute(_key: string, _targetAttrs?: Partial<T>): boolean {
    return false;
  }

  protected stopStateAnimates(type: 'start' | 'end' = 'end') {
    const stopAnimationState = (this as any).stopAnimationState;
    if (typeof stopAnimationState === 'function') {
      stopAnimationState.call(this, 'state', type);
      return;
    }
    if (!this.mayHaveTrackedAnimates()) {
      return;
    }

    const stateAnimates: IAnimate[] = [];
    this.visitTrackedAnimates(animate => {
      if ((animate as any).stateNames) {
        stateAnimates.push(animate);
      }
    });
    stateAnimates.forEach(animate => animate.stop(type));
  }

  clearStates(hasAnimation?: boolean) {
    const previousStates = this.currentStates ?? EMPTY_STATE_NAMES;
    const previousResolvedStatePatch = this.resolvedStatePatch;
    const transition = this.resolveClearStatesTransition();
    if (!transition.changed && previousStates.length === 0) {
      this.currentStates = [];
      this.effectiveStates = [];
      this.resolvedStatePatch = undefined;
      this.sharedStateDirty = false;
      this.clearSharedStateActiveRegistrations();
      return;
    }
    const resolvedStateAttrs =
      hasAnimation || this.hasCustomEvent('beforeStateUpdate')
        ? (cloneAttributeValue((this.baseAttributes ?? {}) as Partial<T>) as Partial<T>)
        : ((this.baseAttributes ?? {}) as Partial<T>);

    if (
      transition.changed &&
      !this.beforeStateUpdate(resolvedStateAttrs, previousStates, transition.states, hasAnimation, true)
    ) {
      return;
    }

    this.currentStates = transition.states;
    this.effectiveStates = [];
    this.resolvedStatePatch = undefined;
    this.sharedStateDirty = false;
    this.clearSharedStateActiveRegistrations();
    if (hasAnimation) {
      this._syncFinalAttributeFromStaticTruth();
      this.applyStateAttrs(
        resolvedStateAttrs,
        transition.states,
        hasAnimation,
        true,
        undefined,
        this.buildRemovedStateAnimationAttrs(resolvedStateAttrs, previousResolvedStatePatch)
      );
    } else {
      this.stopStateAnimates();
      if (this.attributeMayContainTransientAttrs) {
        this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
      } else {
        this.restoreAttributeFromStatePatchDelta(previousResolvedStatePatch, undefined, {
          type: AttributeUpdateType.STATE
        });
      }
      this.emitStateUpdateEvent();
    }
  }

  removeState(stateName: string | string[], hasAnimation?: boolean) {
    const transition = this.resolveRemoveStateTransition(stateName);
    if (transition.changed) {
      this.useStates(transition.states, hasAnimation);
    }
  }

  toggleState(stateName: string, hasAnimation?: boolean) {
    const transition = this.resolveToggleStateTransition(stateName);
    if (transition.changed) {
      this.useStates(transition.states, hasAnimation);
    }
  }

  addState(stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean) {
    const transition = this.resolveAddStateTransition(stateName, keepCurrentStates);
    if (!transition.changed) {
      return;
    }
    this.useStates(transition.states, hasAnimation);
  }

  setStates(states?: string[] | null, hasAnimation?: boolean): void;
  setStates(states?: string[] | null, options?: ISetStatesOptions): void;
  setStates(states?: string[] | null, options?: boolean | ISetStatesOptions) {
    const { hasAnimation, animateSameStatePatchChange, shouldRefreshSameStatePatch } =
      this.normalizeSetStatesOptions(options);
    const nextStates = states?.length ? states : EMPTY_STATE_NAMES;
    const hasCurrentState =
      !!this.currentStates?.length ||
      !!this.effectiveStates?.length ||
      !!this.resolvedStatePatch ||
      !!this.registeredActiveScopes?.size;

    if (!nextStates.length) {
      if (!hasCurrentState && !this.sharedStateDirty) {
        return;
      }
      this.clearStates(hasAnimation);
      return;
    }

    if (this.sameStateNames(this.currentStates, nextStates)) {
      if (shouldRefreshSameStatePatch) {
        this.commitSameStatePatchRefresh(nextStates as string[], hasAnimation, animateSameStatePatchChange);
        return;
      }
      if (this.sharedStateDirty) {
        this.refreshSharedStateBeforeRender();
      }
      return;
    }

    this.useStates(nextStates as string[], hasAnimation);
  }

  useStates(states: string[], hasAnimation?: boolean) {
    if (!states.length) {
      this.clearStates(hasAnimation);
      return;
    }

    const previousStates = this.currentStates ?? EMPTY_STATE_NAMES;
    const previousResolvedStatePatch = this.resolvedStatePatch;
    const { transition, effectiveStates, resolvedStateAttrs } = this.resolveGraphicStateTransition(states);
    if (!transition.changed && this.sameStateNames(previousStates, transition.states)) {
      return;
    }

    if (!this.beforeStateUpdate(resolvedStateAttrs, previousStates, transition.states, hasAnimation, false)) {
      return;
    }

    this.currentStates = transition.states;
    this.effectiveStates = [...effectiveStates];
    this.resolvedStatePatch = resolvedStateAttrs;
    this.sharedStateDirty = false;
    this.syncSharedStateActiveRegistrations();
    if (hasAnimation) {
      this._syncFinalAttributeFromStaticTruth();
      this.applyStateAttrs(
        resolvedStateAttrs,
        transition.states,
        hasAnimation,
        false,
        undefined,
        this.buildRemovedStateAnimationAttrs(resolvedStateAttrs, previousResolvedStatePatch)
      );
    } else {
      this.stopStateAnimates();
      if (this.attributeMayContainTransientAttrs) {
        this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
      } else {
        this.restoreAttributeFromStatePatchDelta(previousResolvedStatePatch, this.resolvedStatePatch, {
          type: AttributeUpdateType.STATE
        });
      }
      this.emitStateUpdateEvent();
    }
  }

  invalidateResolver() {
    if (!this.stateEngine || !this.currentStates?.length || !this.compiledStateDefinitions) {
      return;
    }

    this.syncStateResolveContext();
    this.resolverEpoch = (this.resolverEpoch ?? 0) + 1;
    this.stateEngine.invalidateResolverCache();
    const transition = this.stateEngine.applyStates(this.currentStates);
    const resolvedStateAttrs = { ...(this.stateEngine.resolvedPatch as Partial<T>) };
    this.effectiveStates = [...transition.effectiveStates];
    this.resolvedStatePatch = resolvedStateAttrs;
    this.sharedStateDirty = false;
    this.syncSharedStateActiveRegistrations();
    this.stopStateAnimates();
    this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
    this.emitStateUpdateEvent();
  }

  private sameStateNames(left?: readonly string[], right?: readonly string[]): boolean {
    const normalizedLeft = left ?? [];
    const normalizedRight = right ?? [];
    if (normalizedLeft.length !== normalizedRight.length) {
      return false;
    }

    for (let index = 0; index < normalizedLeft.length; index++) {
      if (normalizedLeft[index] !== normalizedRight[index]) {
        return false;
      }
    }

    return true;
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

  addUpdatePaintTag() {
    this._updateTag |= UpdateTag.UPDATE_PAINT;
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

  protected addBroadUpdateTag() {
    this.shadowRoot && this.shadowRoot.addUpdateGlobalPositionTag();
    this._updateTag |=
      UpdateTag.UPDATE_SHAPE_AND_BOUNDS |
      UpdateTag.UPDATE_PAINT |
      UpdateTag.UPDATE_GLOBAL_LOCAL_MATRIX |
      UpdateTag.UPDATE_LAYOUT;
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

  protected clearUpdatePaintTag() {
    this._updateTag &= UpdateTag.CLEAR_PAINT;
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
    const graphicService = stage?.graphicService ?? this.stage?.graphicService ?? application.graphicService;
    const previousStage = this.stage;
    if (this.stage !== stage || this.layer !== layer) {
      this.stage = stage;
      this.layer = layer;
      if (
        this.currentStates?.length ||
        this.boundSharedStateScope ||
        this.registeredActiveScopes?.size ||
        this.sharedStateDirty
      ) {
        this.syncSharedStateScopeBindingOnTreeChange(true);
      }
      this.setStageToShadowRoot(stage, layer);
      if (this.mayHaveTrackedAnimates() && this.hasAnyTrackedAnimate()) {
        const previousTimeline = previousStage?.getTimeline?.();
        const nextTimeline = stage?.getTimeline?.();
        const detachedStageAnimates: IAnimate[] = [];
        this.visitTrackedAnimates(a => {
          const boundToPreviousStage = !!previousTimeline && a.timeline === previousTimeline;

          if (!boundToPreviousStage && !a.timeline.isGlobal) {
            return;
          }

          if (!nextTimeline) {
            if (previousTimeline && a.timeline === previousTimeline) {
              previousTimeline.removeAnimate(a, false);
              detachedStageAnimates.push(a);
            }
            return;
          }

          if (a.timeline !== nextTimeline) {
            if (previousTimeline && a.timeline === previousTimeline) {
              previousTimeline.removeAnimate(a, false);
            }
            a.setTimeline(nextTimeline);
            nextTimeline.addAnimate(a);
          }
        });

        if (detachedStageAnimates.length) {
          detachedStageAnimates.forEach(animate => {
            animate.stop();
            const untrackAnimate = (this as any).untrackAnimate;
            if (typeof untrackAnimate === 'function') {
              untrackAnimate.call(this, animate.id);
            } else {
              this.animates?.delete(animate.id);
            }
          });
          this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.ANIMATE_END });
        }
      }
      this._onSetStage && this._onSetStage(this, stage, layer);
      graphicService?.onSetStage?.(this, stage);
      return;
    }

    if (
      this.currentStates?.length ||
      this.boundSharedStateScope ||
      this.registeredActiveScopes?.size ||
      this.sharedStateDirty
    ) {
      this.syncSharedStateScopeBindingOnTreeChange(true);
    }
  }

  detachStageForRelease() {
    if (this.registeredActiveScopes?.size) {
      this.clearSharedStateActiveRegistrations();
    }
    if (this.mayHaveTrackedAnimates() || this.shadowRoot) {
      this.stopAnimates();
    }
    this.boundSharedStateScope = undefined;
    this.boundSharedStateRevision = undefined;
    this.compiledStateDefinitions = undefined;
    this.compiledStateDefinitionsCacheKey = undefined;
    this.stateEngine = undefined;
    this.stateEngineCompiledDefinitions = undefined;
    this.sharedStateDirty = false;
    this.stage = null as any;
    this.layer = null as any;
    if (this.shadowRoot) {
      this.shadowRoot.detachStageForRelease?.();
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
    this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.ANIMATE_END });
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

    this.shadowRoot =
      shadowRoot ??
      application.graphicService.creator.shadowRoot?.(this) ??
      (loadShadowRootFactory().createShadowRoot(this) as IShadowRoot);
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
    if (background && image?.background) {
      image = image.background;
    }
    if (background && (!image || backgroundNotImage(image))) {
      this.backgroundImg = false;
      return;
    }
    if (!image) {
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

  private _stopAnimates() {
    if (!this.mayHaveTrackedAnimates()) {
      return;
    }

    const animates: IAnimate[] = [];
    this.visitTrackedAnimates(animate => {
      animates.push(animate);
    });
    animates.forEach(animate => {
      animate.stop();
    });
  }

  stopAnimates(stopChildren: boolean = false) {
    this._stopAnimates();

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
    if (this.registeredActiveScopes?.size) {
      this.clearSharedStateActiveRegistrations();
    }
    if (this.mayHaveTrackedAnimates() || this.shadowRoot) {
      this.stopAnimates();
    }
    const graphicService = this.stage?.graphicService ?? application.graphicService;
    graphicService?.onRelease?.(this);
    super.release();
  }

  protected hasCustomEvent(type: string): boolean {
    return !!this._events && type in this._events;
  }

  protected _dispatchCustomEvent(type: string, context?: any) {
    if (this.hasCustomEvent(type)) {
      const changeEvent = new CustomEvent(type, context);
      changeEvent.bubbles = false;
      const manager = (this.stage as any)?.eventSystem?.manager;

      if (manager) {
        (changeEvent as any).manager = manager;
        return this.dispatchEvent(changeEvent);
      }

      return Node.prototype.dispatchEvent.call(this, changeEvent);
    }
    return true;
  }

  protected beforeStateUpdate(
    attrs: Partial<T>,
    prevStates: readonly string[],
    nextStates: readonly string[],
    hasAnimation?: boolean,
    isClear?: boolean
  ) {
    if (!this.hasCustomEvent('beforeStateUpdate')) {
      return true;
    }
    return this._dispatchCustomEvent('beforeStateUpdate', {
      type: AttributeUpdateType.STATE,
      attrs: { ...attrs },
      prevStates: prevStates.slice(),
      nextStates: nextStates.slice(),
      hasAnimation: !!hasAnimation,
      isClear: !!isClear
    });
  }

  protected emitStateUpdateEvent() {
    if (this.hasCustomEvent('afterStateUpdate')) {
      this._emitCustomEvent('afterStateUpdate', { type: AttributeUpdateType.STATE });
    }
  }

  protected _emitCustomEvent(type: string, context?: any) {
    this._dispatchCustomEvent(type, context);
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

export type Graphic<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>> = GraphicImpl<T>;

export const GRAPHIC_CLASS_SYMBOL = Symbol.for('@visactor/vrender-core/graphic-class');

export interface IGraphicClassState {
  Graphic: typeof GraphicImpl;
}

function createGraphicClassState(): IGraphicClassState {
  return {
    Graphic: GraphicImpl
  };
}

export function getGraphicClassState(): IGraphicClassState {
  const globalScope = globalThis as typeof globalThis & {
    [GRAPHIC_CLASS_SYMBOL]?: IGraphicClassState;
  };

  globalScope[GRAPHIC_CLASS_SYMBOL] ??= createGraphicClassState();
  return globalScope[GRAPHIC_CLASS_SYMBOL];
}

export const Graphic = getGraphicClassState().Graphic;

Graphic.mixin(EventTarget);

function backgroundNotImage(image: any) {
  if (typeof image === 'string') {
    return !(image.startsWith('<svg') || isValidUrl(image) || image.includes('/') || isBase64(image));
  }
  if (image.fill || image.stroke) {
    return true;
  }
  if (typeof image.gradient === 'string' && Array.isArray(image.stops)) {
    return true;
  }
  return false;
}

function isExternalTexture(texture: any) {
  if (!texture) {
    return false;
  }
  if (typeof texture === 'string') {
    if (builtinTextureTypes.has(texture)) {
      return false;
    }
    return texture.startsWith('<svg') || isValidUrl(texture) || texture.includes('/') || isBase64(texture);
  }
  return isObject(texture);
}
