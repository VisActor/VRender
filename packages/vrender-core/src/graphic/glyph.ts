import type { AABBBounds, IAABBBounds } from '@visactor/vutils';
import { Graphic, NOWORK_ANIMATE_ATTR } from './graphic';
import type {
  GraphicType,
  IGraphic,
  IGlyph,
  IGlyphGraphicAttribute,
  IGraphicAttribute,
  ISetAttributeContext
} from '../interface';
import { StateDefinitionCompiler } from './state/state-definition-compiler';
import type { CompiledStateDefinition, StateDefinition, StateDefinitionsInput } from './state/state-definition';
import type { SharedStateScope } from './state/shared-state-scope';
import { getTheme } from './theme';
import { UpdateCategory } from './state/attribute-update-classifier';
import { GLYPH_NUMBER_TYPE } from './constants';

export class Glyph extends Graphic<IGlyphGraphicAttribute> implements IGlyph {
  type: GraphicType = 'glyph';
  declare _onInit: (g: IGlyph) => void;
  declare _onUpdate: (g: IGlyph) => void;
  declare glyphStates?: Record<
    string,
    {
      attributes: Partial<IGlyphGraphicAttribute>;
      subAttributes: Partial<IGraphicAttribute>[];
    }
  >;
  declare glyphStateProxy?: (
    stateName: string,
    targetStates?: string[]
  ) => {
    attributes: Partial<IGlyphGraphicAttribute>;
    subAttributes: Partial<IGraphicAttribute>[];
  };
  protected declare subGraphic: IGraphic[];
  private subGraphicEncoder?: (g: IGlyph, context?: ISetAttributeContext) => void;
  private legacyDefinitionsSource?: Glyph['glyphStates'];
  private legacyProxySource?: Glyph['glyphStateProxy'];
  private legacyDefinitions?: StateDefinitionsInput<IGlyphGraphicAttribute>;
  private legacyCompiledDefinitions?: Map<string, CompiledStateDefinition<IGlyphGraphicAttribute>>;

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  constructor(params: Partial<IGlyphGraphicAttribute>) {
    super(params);
    this.numberType = GLYPH_NUMBER_TYPE;
    this.subGraphic = [];
    this._onInit && this._onInit(this);
    this.valid = this.isValid();
  }

  setSubGraphic(subGraphic: IGraphic[]) {
    this.detachSubGraphic();
    this.subGraphic = subGraphic;
    subGraphic.forEach(g => {
      g.glyphHost = this;
      Graphic.bindGlyphAttributes(g as Graphic, this.attribute);
    });
    this.valid = this.isValid();
    this.addUpdateBoundTag();
    this.subGraphicEncoder?.(this);
  }

  protected detachSubGraphic() {
    this.subGraphic.forEach(g => {
      g.glyphHost = null;
      Graphic.bindGlyphAttributes(g as Graphic, Object.prototype);
    });
  }

  getSubGraphic() {
    return this.subGraphic;
  }

  onInit(cb: (g: this) => void): void {
    this._onInit = cb;
  }

  onUpdate(cb: (g: this) => void): void {
    this._onUpdate = cb;
  }

  isValid(): boolean {
    return true;
  }

  setSubGraphicEncoder(encoder?: (g: IGlyph, context?: ISetAttributeContext) => void): void {
    this.subGraphicEncoder = encoder;
    encoder?.(this);
  }

  commitSubGraphicAttributes(
    subGraphic: IGraphic,
    patch: Record<string, any>,
    removedKeys?: readonly string[],
    context?: ISetAttributeContext
  ): void {
    Graphic.commitDerivedAttributePatch(subGraphic as Graphic, patch, removedKeys, context);
  }

  onAttributeUpdate(context?: ISetAttributeContext): void {
    if (this.glyphHost) {
      Graphic.bindGlyphAttributes(this, this.glyphHost.attribute);
    }
    for (const child of this.subGraphic) {
      Graphic.bindGlyphAttributes(child as Graphic, this.attribute);
    }
    this.subGraphicEncoder?.(this, context);
    if (!context?.skipUpdateCallback) {
      this._onUpdate?.(this);
    }
    super.onAttributeUpdate(context);
  }

  protected submitUpdateByCategory(category: UpdateCategory, forceUpdateTag: boolean = false): void {
    super.submitUpdateByCategory(category, forceUpdateTag);
    for (const child of this.subGraphic) {
      if (forceUpdateTag || category & UpdateCategory.SHAPE) {
        child.addUpdateShapeAndBoundsTag();
      } else if (category & UpdateCategory.BOUNDS) {
        child.addUpdateBoundTag();
      }
      if (category & UpdateCategory.PAINT) {
        child.addUpdatePaintTag();
      }
      if (forceUpdateTag || category & UpdateCategory.TRANSFORM) {
        child.addUpdatePositionTag();
      }
      if (forceUpdateTag || category & UpdateCategory.LAYOUT) {
        child.addUpdateLayoutTag();
      }
    }
  }

  // Glyph forwards inherited invalidation to children, so its base fast path must
  // classify changed keys too. Ordinary Graphic setters keep their existing path.
  protected commitBaseAttributesByTouchedKeys(
    params: Partial<IGlyphGraphicAttribute>,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ): void {
    const base = this.getBaseAttributesStorage();
    let category = UpdateCategory.NONE;
    let hasKeys = false;
    for (const key in params) {
      if (!Object.prototype.hasOwnProperty.call(params, key)) {
        continue;
      }
      hasKeys = true;
      const prev = (base as any)[key];
      const next = (params as any)[key];
      if (prev !== next) {
        category = this.mergeAttributeDeltaCategory(category, key, prev, next);
      }
      (base as any)[key] = next;
    }
    if (!hasKeys) {
      return;
    }
    this.attribute = base;
    this._baseAttributes = undefined;
    this.attributeMayContainTransientAttrs = false;
    this.valid = this.isValid();
    this.submitUpdateByCategory(category, forceUpdateTag);
    this.onAttributeUpdate(context);
  }

  protected commitBaseAttributeBySingleKey(
    key: string,
    value: any,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ): void {
    this.commitBaseAttributesByTouchedKeys({ [key]: value }, forceUpdateTag, context);
  }

  getGraphicTheme(): Required<IGlyphGraphicAttribute> {
    return getTheme(this as IGraphic).glyph;
  }

  protected updateAABBBounds(
    attribute: IGlyphGraphicAttribute,
    theme: Required<IGlyphGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    // 添加子节点
    this.getSubGraphic().forEach((node: IGraphic) => {
      aabbBounds.union(node.AABBBounds);
    });

    // glyph不需要计算AABBBounds
    // this.transformAABBBounds(attribute, aabbBounds, theme, graphic);
    return aabbBounds;
  }

  protected doUpdateAABBBounds(): AABBBounds {
    this.updateAABBBoundsStamp++;
    this._AABBBounds.clear();
    const bounds = this.updateAABBBounds(this.attribute, this.getGraphicTheme(), this._AABBBounds) as AABBBounds;
    this.clearUpdateBoundTag();
    return bounds;
  }

  protected needUpdateTags(keys: string[]): boolean {
    return false;
  }
  protected needUpdateTag(key: string): boolean {
    return false;
  }

  protected hasLegacyStateDefinitions(): boolean {
    if (this.glyphStateProxy) {
      return true;
    }
    for (const name in this.glyphStates) {
      if (Object.prototype.hasOwnProperty.call(this.glyphStates, name)) {
        return true;
      }
    }
    return false;
  }

  protected syncSharedStateScopeBindingFromTree(
    markDirty: boolean = true,
    inheritedSharedStateScope?: SharedStateScope<Record<string, any>> | null
  ): boolean {
    // Legacy Glyph definitions historically own the whole state surface.
    return this.hasLegacyStateDefinitions()
      ? this.syncSharedStateScopeBinding(undefined, markDirty)
      : super.syncSharedStateScopeBindingFromTree(markDirty, inheritedSharedStateScope);
  }

  protected resolveEffectiveCompiledDefinitions(stateNames: readonly string[] = []) {
    if (!this.hasLegacyStateDefinitions()) {
      this.legacyDefinitions = undefined;
      this.legacyCompiledDefinitions = undefined;
      return super.resolveEffectiveCompiledDefinitions(stateNames);
    }
    this.syncSharedStateScopeBindingFromTree(false);
    let changed = false;
    if (
      !this.legacyDefinitions ||
      this.legacyDefinitionsSource !== this.glyphStates ||
      this.legacyProxySource !== this.glyphStateProxy
    ) {
      this.legacyDefinitionsSource = this.glyphStates;
      this.legacyProxySource = this.glyphStateProxy;
      this.legacyDefinitions = {};
      for (const name of Object.keys(this.glyphStates ?? {})) {
        this.legacyDefinitions[name] = this.createLegacyStateDefinition(name);
      }
      changed = true;
    }
    if (this.glyphStateProxy) {
      const addDefinition = (name: string) => {
        if (!Object.prototype.hasOwnProperty.call(this.legacyDefinitions, name)) {
          this.legacyDefinitions[name] = this.createLegacyStateDefinition(name);
          changed = true;
        }
      };
      this.currentStates?.forEach(addDefinition);
      stateNames.forEach(addDefinition);
    }
    if (changed) {
      this.legacyCompiledDefinitions = new StateDefinitionCompiler<IGlyphGraphicAttribute>().compile(
        this.legacyDefinitions
      );
    }
    return { compiledDefinitions: this.legacyCompiledDefinitions, stateOrder: 'input' as const };
  }

  private createLegacyStateDefinition(name: string): StateDefinition<IGlyphGraphicAttribute> {
    return this.glyphStateProxy
      ? {
          name,
          resolver: ({ graphic, activeStates }) =>
            (graphic as Glyph).glyphStateProxy(name, activeStates as string[])?.attributes
        }
      : { name, patch: this.glyphStates[name].attributes };
  }

  clone(): IGraphic<Partial<IGlyphGraphicAttribute>> {
    const glyph = new Glyph({ ...this.attribute });
    glyph.setSubGraphic(this.subGraphic.map(g => g.clone()));
    return glyph;
  }

  release(): void {
    super.release();
    this.subGraphicEncoder = undefined;
    this._onUpdate = undefined;
    this.legacyDefinitions = undefined;
    this.legacyCompiledDefinitions = undefined;
    this.legacyDefinitionsSource = undefined;
    this.legacyProxySource = undefined;
    this.detachSubGraphic();
    this.subGraphic.forEach(child => child.release());
    this.subGraphic = [];
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Glyph.NOWORK_ANIMATE_ATTR;
  }
}

export function createGlyph(attributes: IGlyphGraphicAttribute): IGlyph {
  return new Glyph(attributes);
}
