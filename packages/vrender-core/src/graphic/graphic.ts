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
import type { CompiledStateDefinition, StateDefinition, StateDefinitionsInput } from './state/state-definition';
import { StateDefinitionCompiler } from './state/state-definition-compiler';
import { StateEngine } from './state/state-engine';
import { StateModel } from './state/state-model';
import { UpdateCategory, classifyAttributeDelta } from './state/attribute-update-classifier';
import { StateStyleResolver, type StateMergeMode } from './state/state-style-resolver';
import { StateTransitionOrchestrator } from './state/state-transition-orchestrator';
import {
  collectSharedStateScopeChain,
  ensureSharedStateScopeFresh,
  type SharedStateScope
} from './state/shared-state-scope';
import { enqueueGraphicSharedStateRefresh, scheduleStageSharedStateRefresh } from './state/shared-state-refresh';
import { getStageStatePerfMonitor } from './state/state-perf-monitor';

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

const point = new Point();

type AttributeDelta = Map<string, { prev: unknown; next: unknown }>;

function isPlainObjectValue(value: unknown): value is Record<string, any> {
  return value != null && isObject(value) && !isArray(value);
}

function cloneAttributeValue<T>(value: T): T {
  if (!isPlainObjectValue(value)) {
    return value;
  }

  const clone: Record<string, any> = {};
  Object.keys(value).forEach(key => {
    clone[key] = cloneAttributeValue((value as Record<string, any>)[key]);
  });
  return clone as T;
}

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
  declare baseAttributes: Partial<T>;

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
  declare localFallbackCompiledDefinitions?: Map<string, CompiledStateDefinition<T>>;
  declare localFallbackVersion?: number;
  /** TODO: state更新对应的动画配置 */
  declare stateAnimateConfig?: IAnimateConfig;
  /** 获取state图形属性的方法 */
  declare stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T>;
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
  protected stateEngineStateProxy?: (stateName: string, targetStates?: string[]) => Partial<T>;
  protected stateEngineStateSort?: (stateA: string, stateB: string) => number;
  protected stateEngineMergeMode?: StateMergeMode;
  protected stateEngineStateProxyModeKey?: string;
  protected readonly stateStyleResolver = new StateStyleResolver<T>();
  protected readonly deepStateStyleResolver = new StateStyleResolver<T>({ mergeMode: 'deep' });
  protected readonly stateTransitionOrchestrator = new StateTransitionOrchestrator<T>();
  protected _deprecatedNormalAttrsView?: Partial<T> | null;
  protected localStateDefinitionsSource?: StateDefinitionsInput<T>;
  protected resolverEpoch: number = 0;

  constructor(params: T = {} as T) {
    super();
    this._AABBBounds = new AABBBounds();
    this._updateTag = UpdateTag.INIT;
    const initialAttributes = cloneAttributeValue(params) as T;
    this.attribute = initialAttributes;
    this.baseAttributes = cloneAttributeValue(initialAttributes) as Partial<T>;
    this.valid = this.isValid();
    this.updateAABBBoundsStamp = 0;
    if (params.background) {
      this.loadImage((params.background as any).background ?? params.background, true);
    } else if (params.shadowGraphic) {
      this.setShadowGraphic(params.shadowGraphic);
    }
    // this.attribute = createTrackableObject(this.attribute);
  }

  get normalAttrs(): Partial<T> | undefined {
    return this.baseAttributes;
  }

  set normalAttrs(value: Partial<T> | undefined) {
    this._deprecatedNormalAttrsView = value ?? undefined;
  }

  getGraphicService() {
    return this.stage?.graphicService ?? application.graphicService;
  }

  getAttributes(): T {
    return this.attribute;
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
    this.localFallbackCompiledDefinitions = undefined;
    this.compiledStateDefinitions = undefined;
    this.compiledStateDefinitionsCacheKey = undefined;
    this.stateEngine = undefined;
    this.stateEngineCompiledDefinitions = undefined;
    this.stateEngineStateProxyModeKey = undefined;
    this.syncSharedStateActiveRegistrations();

    if (markDirty && this.currentStates?.length) {
      this.markSharedStateDirty();
    }

    return true;
  }

  protected syncSharedStateActiveRegistrations(): void {
    const nextScopes =
      this.currentStates?.length && this.boundSharedStateScope
        ? new Set(collectSharedStateScopeChain(this.boundSharedStateScope))
        : new Set<SharedStateScope<T>>();
    const previousScopes = this.registeredActiveScopes ?? new Set<SharedStateScope<T>>();

    previousScopes.forEach(scope => {
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

    this.syncSharedStateScopeBindingFromTree();
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
    this._emitCustomEvent('afterStateUpdate', { type: AttributeUpdateType.STATE });
    this.sharedStateDirty = false;
  }

  protected getLocalStatesVersion(): number {
    if (this.localStateDefinitionsSource !== this.states) {
      this.localStateDefinitionsSource = this.states;
      this.localFallbackVersion = (this.localFallbackVersion ?? 0) + 1;
    }

    return this.localFallbackVersion ?? 0;
  }

  protected resolveEffectiveCompiledDefinitions(): {
    compiledDefinitions?: Map<string, CompiledStateDefinition<T>>;
    stateProxyModeKey: string;
    stateProxyEligibility?: (stateName: string) => boolean;
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
          compiledDefinitions: undefined,
          stateProxyModeKey: 'none'
        };
      }

      const localStatesVersion = this.getLocalStatesVersion();
      const cacheKey = `local:${localStatesVersion}`;
      if (!this.compiledStateDefinitions || this.compiledStateDefinitionsCacheKey !== cacheKey) {
        this.compiledStateDefinitions = new StateDefinitionCompiler<T>().compile(this.states);
        this.compiledStateDefinitionsCacheKey = cacheKey;
      }

      return {
        compiledDefinitions: this.compiledStateDefinitions,
        stateProxyModeKey: this.stateProxy ? 'legacy-all' : 'none'
      };
    }

    const sharedCompiledDefinitions = boundScope.effectiveCompiledDefinitions as Map<
      string,
      CompiledStateDefinition<T>
    >;
    if (!hasStates) {
      this.localFallbackCompiledDefinitions = undefined;
      return {
        compiledDefinitions: sharedCompiledDefinitions,
        stateProxyModeKey: this.stateProxy ? 'shared-disabled' : 'none',
        stateProxyEligibility: this.stateProxy ? () => false : undefined
      };
    }

    const localStates = this.states as StateDefinitionsInput<T>;
    const missingLocalStateDefinitions = {} as StateDefinitionsInput<T>;
    const missingStateNames: string[] = [];
    Object.keys(localStates).forEach(stateName => {
      if (sharedCompiledDefinitions.has(stateName)) {
        return;
      }
      missingLocalStateDefinitions[stateName] = localStates[stateName];
      missingStateNames.push(stateName);
    });

    if (!missingStateNames.length) {
      this.localFallbackCompiledDefinitions = undefined;
      return {
        compiledDefinitions: sharedCompiledDefinitions,
        stateProxyModeKey: this.stateProxy ? 'shared-disabled' : 'none',
        stateProxyEligibility: this.stateProxy ? () => false : undefined
      };
    }

    const localStatesVersion = this.getLocalStatesVersion();
    const stateProxyModeKey = this.stateProxy ? `missing:${missingStateNames.sort().join('|')}` : 'none';
    const cacheKey = `shared:${boundScope.revision}:fallback:${localStatesVersion}:${stateProxyModeKey}`;
    if (!this.localFallbackCompiledDefinitions || this.compiledStateDefinitionsCacheKey !== cacheKey) {
      this.localFallbackCompiledDefinitions = new StateDefinitionCompiler<T>().compile({
        ...(boundScope.effectiveSourceDefinitions as StateDefinitionsInput<T>),
        ...missingLocalStateDefinitions
      });
      this.compiledStateDefinitionsCacheKey = cacheKey;
    }

    return {
      compiledDefinitions: this.localFallbackCompiledDefinitions,
      stateProxyModeKey,
      stateProxyEligibility: this.stateProxy
        ? (stateName: string) => !sharedCompiledDefinitions.has(stateName)
        : undefined
    };
  }

  protected recomputeCurrentStatePatch(): void {
    if (!this.currentStates?.length) {
      this.effectiveStates = [];
      this.resolvedStatePatch = undefined;
      this.syncSharedStateActiveRegistrations();
      return;
    }

    const stateResolveBaseAttrs = (this.baseAttributes ?? this.attribute) as Partial<T>;
    const stateModel = this.createStateModel();
    this.stateEngine?.setResolveContext(this, stateResolveBaseAttrs);
    const transition = stateModel.useStates(this.currentStates);
    const effectiveStates = transition.effectiveStates ?? transition.states;
    const resolvedStateAttrs =
      this.stateEngine && this.compiledStateDefinitions
        ? { ...(this.stateEngine.resolvedPatch as Partial<T>) }
        : (this.stateMergeMode === 'deep' ? this.deepStateStyleResolver : this.stateStyleResolver).resolve(
            stateResolveBaseAttrs,
            this.states as any,
            this.stateProxy as any,
            transition.states,
            this.stateSort
          );

    this.currentStates = transition.states;
    this.effectiveStates = [...effectiveStates];
    this.resolvedStatePatch = { ...resolvedStateAttrs };
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

  protected syncObjectToSnapshot(target: Record<string, any>, snapshot: Record<string, any>): AttributeDelta {
    const delta: AttributeDelta = new Map();
    const keySet = new Set<string>([...Object.keys(target), ...Object.keys(snapshot)]);

    keySet.forEach(key => {
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
      if (isEqual(previousValue, nextValue)) {
        return;
      }

      delta.set(key, { prev: previousValue, next: nextValue });
      target[key] = cloneAttributeValue(nextValue);
    });

    return delta;
  }

  protected _syncAttribute(): AttributeDelta {
    const snapshot = this.buildStaticAttributeSnapshot() as Record<string, any>;
    const delta = this.syncObjectToSnapshot(this.attribute as Record<string, any>, snapshot);
    this.valid = this.isValid();
    return delta;
  }

  protected _syncFinalAttributeFromStaticTruth(): void {
    const target = (this as any).finalAttribute;
    if (!target) {
      return;
    }
    const snapshot = this.buildStaticAttributeSnapshot() as Record<string, any>;
    this.syncObjectToSnapshot(target, snapshot);
  }

  protected submitUpdateByDelta(delta: AttributeDelta, forceUpdateTag: boolean = false): void {
    if (forceUpdateTag) {
      this.addUpdateShapeAndBoundsTag();
      this.addUpdatePositionTag();
      this.addUpdateLayoutTag();
      return;
    }

    let category = UpdateCategory.NONE;

    delta.forEach((entry, key) => {
      let nextCategory = classifyAttributeDelta(key, entry.prev, entry.next);
      if (nextCategory & UpdateCategory.PICK) {
        // Phase 2 keeps PICK invalidation on the existing bounds path instead of adding a dedicated pick tag.
        nextCategory |= UpdateCategory.BOUNDS;
      }
      if (nextCategory === UpdateCategory.PAINT && this.needUpdateTag(key)) {
        nextCategory = UpdateCategory.SHAPE | UpdateCategory.BOUNDS;
      }
      category |= nextCategory;
    });

    if (category !== UpdateCategory.NONE) {
      getStageStatePerfMonitor(this.stage)?.recordCategory(category);
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

  protected commitBaseAttributeMutation(forceUpdateTag: boolean = false, context?: ISetAttributeContext): void {
    if (this.currentStates?.length) {
      this.resolverEpoch += 1;
      this.stateEngine?.invalidateResolverCache();
      this.recomputeCurrentStatePatch();
    }
    const delta = this._syncAttribute();
    this.submitUpdateByDelta(delta, forceUpdateTag);
    this.onAttributeUpdate(context);
  }

  protected applyBaseAttributes(params: Partial<T>) {
    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      (this.baseAttributes as any)[key] = cloneAttributeValue((params as any)[key]);
    }
  }

  protected applyTransientAttributes(
    params: Partial<T>,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ) {
    const delta: AttributeDelta = new Map();
    const keys = Object.keys(params);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const previousValue = (this.attribute as Record<string, any>)[key];
      const nextValue = (params as Record<string, any>)[key];
      if (isEqual(previousValue, nextValue)) {
        continue;
      }
      delta.set(key, { prev: previousValue, next: nextValue });
      (this.attribute as Record<string, any>)[key] = cloneAttributeValue(nextValue);
    }

    this.valid = this.isValid();
    this.submitUpdateByDelta(delta, forceUpdateTag);
    this.onAttributeUpdate(context);
  }

  protected _restoreAttributeFromStaticTruth(context?: ISetAttributeContext): void {
    this._syncFinalAttributeFromStaticTruth();
    const delta = this._syncAttribute();
    this.submitUpdateByDelta(delta);
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
    this.visitTrackedAnimates(animate => {
      // 优先级最高的动画（一般是循环动画），不屏蔽
      if (animate.priority === Infinity && !ignorePriority) {
        return;
      }
      Object.keys(params).forEach(key => {
        animate.preventAttr(key);
      });
    });
    this.applyTransientAttributes(params, forceUpdateTag, context);
  }

  setAttributes(params: Partial<T>, forceUpdateTag: boolean = false, context?: ISetAttributeContext) {
    if (!params) {
      return;
    }
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
    this.applyBaseAttributes(params);
    this.commitBaseAttributeMutation(forceUpdateTag, context);
  }

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext) {
    const params =
      this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate({ [key]: value }, this.attribute, key, context);
    if (!params) {
      this.applyBaseAttributes({ [key]: value } as Partial<T>);
      this.commitBaseAttributeMutation(!!forceUpdateTag, context);
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
    this.baseAttributes = cloneAttributeValue(params) as Partial<T>;
    if (!this.attribute) {
      this.attribute = {} as T;
    }
    this.resolvedStatePatch = undefined;
    this._syncAttribute();
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
      this.applyBaseAttributes(params);
    }
    const attribute = this.baseAttributes as T;
    const postMatrix = attribute.postMatrix;
    if (!postMatrix) {
      attribute.x = (attribute.x ?? DefaultTransform.x) + x;
      attribute.y = (attribute.y ?? DefaultTransform.y) + y;
    } else {
      application.transformUtil.fromMatrix(postMatrix, postMatrix).translate(x, y);
    }

    this.commitBaseAttributeMutation(false, context);
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
      this.applyBaseAttributes(params);
      this.commitBaseAttributeMutation(false, context);
      return this;
    }
    attribute.x = x;
    attribute.y = y;
    this.commitBaseAttributeMutation(false, context);
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
      this.applyBaseAttributes(params);
    }
    const attribute = this.baseAttributes as T;
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
    this.commitBaseAttributeMutation(false, context);
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
      this.applyBaseAttributes(params);
      this.commitBaseAttributeMutation(false, context);
      return this;
    }
    attribute.scaleX = scaleX;
    attribute.scaleY = scaleY;
    this.commitBaseAttributeMutation(false, context);
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
      this.applyBaseAttributes(params);
      // return this;
    }
    const attribute = this.baseAttributes as T;
    if (!rotateCenter) {
      attribute.angle = (attribute.angle ?? DefaultTransform.angle) + angle;
    } else {
      let { postMatrix } = this.baseAttributes as T;
      if (!postMatrix) {
        postMatrix = new Matrix();
        (this.baseAttributes as T).postMatrix = postMatrix;
      }
      application.transformUtil.fromMatrix(postMatrix, postMatrix).rotate(angle, rotateCenter);
    }
    this.commitBaseAttributeMutation(false, context);
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
      this.applyBaseAttributes(params);
      this.commitBaseAttributeMutation(false, context);
      return this;
    }
    attribute.angle = angle;
    this.commitBaseAttributeMutation(false, context);
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

  protected createStateModel() {
    const { compiledDefinitions, stateProxyEligibility, stateProxyModeKey } =
      this.resolveEffectiveCompiledDefinitions();
    this.compiledStateDefinitions = compiledDefinitions;

    if (!compiledDefinitions) {
      this.stateEngine = undefined;
      this.stateEngineCompiledDefinitions = undefined;
      this.stateEngineStateProxyModeKey = undefined;
    } else if (
      !this.stateEngine ||
      this.stateEngineCompiledDefinitions !== compiledDefinitions ||
      this.stateEngineStateProxy !== this.stateProxy ||
      this.stateEngineStateSort !== this.stateSort ||
      this.stateEngineMergeMode !== this.stateMergeMode ||
      this.stateEngineStateProxyModeKey !== stateProxyModeKey
    ) {
      this.stateEngine = new StateEngine<T>({
        compiledDefinitions,
        stateSort: this.stateSort,
        stateProxy: this.stateProxy as any,
        stateProxyEligibility,
        states: this.states,
        mergeMode: this.stateMergeMode
      });
      this.stateEngineCompiledDefinitions = compiledDefinitions;
      this.stateEngineStateProxy = this.stateProxy as any;
      this.stateEngineStateSort = this.stateSort;
      this.stateEngineMergeMode = this.stateMergeMode;
      this.stateEngineStateProxyModeKey = stateProxyModeKey;
    }

    return new StateModel<T>({
      states: this.states,
      currentStates: this.currentStates,
      stateSort: this.stateSort,
      stateProxy: this.stateProxy as any,
      stateEngine: this.stateEngine
    });
  }

  protected resolveStateAnimateConfig(animateConfig?: IAnimateConfig) {
    return animateConfig ?? this.stateAnimateConfig ?? this.context?.stateAnimateConfig ?? DefaultStateAnimateConfig;
  }

  applyStateAttrs(
    attrs: Partial<T>,
    stateNames: string[],
    hasAnimation?: boolean,
    isClear?: boolean,
    animateConfig?: IAnimateConfig
  ) {
    const resolvedAnimateConfig = hasAnimation ? this.resolveStateAnimateConfig(animateConfig) : undefined;
    const transitionOptions = resolvedAnimateConfig ? { animateConfig: resolvedAnimateConfig } : undefined;

    if (isClear) {
      this.stateTransitionOrchestrator.applyClearTransition(
        this as any,
        attrs,
        hasAnimation,
        stateNames,
        transitionOptions
      );
      return;
    }

    const plan = this.stateTransitionOrchestrator.analyzeTransition({}, attrs, stateNames, hasAnimation, {
      noWorkAnimateAttr: this.getNoWorkAnimateAttr(),
      animateConfig: resolvedAnimateConfig
    });

    this.stateTransitionOrchestrator.applyTransition(this as any, plan, hasAnimation, transitionOptions);
  }

  updateNormalAttrs(stateAttrs: Partial<T>) {
    this._deprecatedNormalAttrsView = cloneAttributeValue(this.baseAttributes);
  }

  protected stopStateAnimates(type: 'start' | 'end' = 'end') {
    const stopAnimationState = (this as any).stopAnimationState;
    if (typeof stopAnimationState === 'function') {
      stopAnimationState.call(this, 'state', type);
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

  private getNormalAttribute(key: string) {
    const value = (this.attribute as any)[key];

    if (this.hasAnyTrackedAnimate()) {
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
    const previousStates = this.currentStates ? this.currentStates.slice() : [];
    const transition = this.createStateModel().clearStates();
    if (!transition.changed && previousStates.length === 0) {
      this.currentStates = [];
      this.effectiveStates = [];
      this.resolvedStatePatch = undefined;
      this.sharedStateDirty = false;
      this.clearSharedStateActiveRegistrations();
      return;
    }
    const resolvedStateAttrs = cloneAttributeValue((this.baseAttributes ?? {}) as Partial<T>) as Partial<T>;

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
    getStageStatePerfMonitor(this.stage)?.incrementCounter('stateCommits');
    getStageStatePerfMonitor(this.stage)?.recordEvent('state-commit', {
      graphicId: this._uid,
      targetStates: []
    });
    if (hasAnimation) {
      this._syncFinalAttributeFromStaticTruth();
      this.applyStateAttrs(resolvedStateAttrs, transition.states, hasAnimation, true);
    } else {
      this.stopStateAnimates();
      this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
      this._emitCustomEvent('afterStateUpdate', { type: AttributeUpdateType.STATE });
    }
  }

  removeState(stateName: string | string[], hasAnimation?: boolean) {
    const transition = this.createStateModel().removeState(stateName);
    if (transition.changed) {
      this.useStates(transition.states, hasAnimation);
    }
  }

  toggleState(stateName: string, hasAnimation?: boolean) {
    const transition = this.createStateModel().toggleState(stateName);
    if (transition.changed) {
      this.useStates(transition.states, hasAnimation);
    }
  }

  addState(stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean) {
    const transition = this.createStateModel().addState(stateName, keepCurrentStates);
    if (!transition.changed) {
      return;
    }
    this.useStates(transition.states, hasAnimation);
  }

  useStates(states: string[], hasAnimation?: boolean) {
    if (!states.length) {
      this.clearStates(hasAnimation);
      return;
    }

    const previousStates = this.currentStates ? this.currentStates.slice() : [];
    const stateResolveBaseAttrs = (this.baseAttributes ?? this.attribute) as Partial<T>;
    const stateModel = this.createStateModel();
    this.stateEngine?.setResolveContext(this, stateResolveBaseAttrs);
    const transition = stateModel.useStates(states);
    if (!transition.changed && this.sameStateNames(previousStates, transition.states)) {
      return;
    }

    const resolver = this.stateMergeMode === 'deep' ? this.deepStateStyleResolver : this.stateStyleResolver;
    const effectiveStates = transition.effectiveStates ?? transition.states;
    const resolvedStateAttrs =
      this.stateEngine && this.compiledStateDefinitions
        ? { ...(this.stateEngine.resolvedPatch as Partial<T>) }
        : resolver.resolve(
            stateResolveBaseAttrs,
            this.states as any,
            this.stateProxy as any,
            transition.states,
            this.stateSort
          );

    if (!this.beforeStateUpdate(resolvedStateAttrs, previousStates, transition.states, hasAnimation, false)) {
      return;
    }

    this.currentStates = transition.states;
    this.effectiveStates = [...effectiveStates];
    this.resolvedStatePatch = { ...resolvedStateAttrs };
    this.sharedStateDirty = false;
    this.syncSharedStateActiveRegistrations();
    getStageStatePerfMonitor(this.stage)?.incrementCounter('stateCommits');
    getStageStatePerfMonitor(this.stage)?.recordEvent('state-commit', {
      graphicId: this._uid,
      targetStates: [...transition.states]
    });
    if (hasAnimation) {
      this._syncFinalAttributeFromStaticTruth();
      this.applyStateAttrs(resolvedStateAttrs, transition.states, hasAnimation);
    } else {
      this.stopStateAnimates();
      this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
      this._emitCustomEvent('afterStateUpdate', { type: AttributeUpdateType.STATE });
    }
  }

  invalidateResolver() {
    if (!this.stateEngine || !this.currentStates?.length || !this.compiledStateDefinitions) {
      return;
    }

    const stateResolveBaseAttrs = (this.baseAttributes ?? this.attribute) as Partial<T>;
    this.stateEngine.setResolveContext(this, stateResolveBaseAttrs);
    this.resolverEpoch += 1;
    this.stateEngine.invalidateResolverCache();
    const transition = this.stateEngine.applyStates(this.currentStates);
    const resolvedStateAttrs = { ...(this.stateEngine.resolvedPatch as Partial<T>) };
    this.effectiveStates = [...transition.effectiveStates];
    this.resolvedStatePatch = { ...resolvedStateAttrs };
    this.sharedStateDirty = false;
    this.syncSharedStateActiveRegistrations();
    this.stopStateAnimates();
    this._restoreAttributeFromStaticTruth({ type: AttributeUpdateType.STATE });
    this._emitCustomEvent('afterStateUpdate', { type: AttributeUpdateType.STATE });
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
      this.syncSharedStateScopeBindingFromTree(!!this.currentStates?.length);
      this.setStageToShadowRoot(stage, layer);
      if (this.hasAnyTrackedAnimate()) {
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

    this.syncSharedStateScopeBindingFromTree(!!this.currentStates?.length);
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

  private _stopAnimates() {
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
    this.clearSharedStateActiveRegistrations();
    this.stopAnimates();
    const graphicService = this.stage?.graphicService ?? application.graphicService;
    graphicService?.onRelease?.(this);
    super.release();
  }

  protected _dispatchCustomEvent(type: string, context?: any) {
    if (this._events && type in this._events) {
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
    prevStates: string[],
    nextStates: string[],
    hasAnimation?: boolean,
    isClear?: boolean
  ) {
    return this._dispatchCustomEvent('beforeStateUpdate', {
      type: AttributeUpdateType.STATE,
      attrs: { ...attrs },
      prevStates: prevStates.slice(),
      nextStates: nextStates.slice(),
      hasAnimation: !!hasAnimation,
      isClear: !!isClear
    });
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

Graphic.mixin(EventTarget);

function backgroundNotImage(image: any) {
  if (image.fill || image.stroke) {
    return true;
  }
  return false;
}
