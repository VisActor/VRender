import type { AABBBounds, IAABBBounds, IPointLike } from '@visactor/vutils';
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
      Object.setPrototypeOf(g.attribute, this.attribute);
    });
    this.valid = this.isValid();
    this.addUpdateBoundTag();
  }

  protected detachSubGraphic() {
    this.subGraphic.forEach(g => {
      g.glyphHost = null;
      Object.setPrototypeOf(g.attribute, {});
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

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext) {
    super.setAttribute(key, value, forceUpdateTag, context);
    this.subGraphic.forEach(g => {
      g.addUpdateShapeAndBoundsTag();
      g.addUpdatePositionTag();
    });
  }

  setAttributes(
    params: Partial<IGlyphGraphicAttribute>,
    forceUpdateTag: boolean = false,
    context?: ISetAttributeContext
  ) {
    super.setAttributes(params, forceUpdateTag, context);
    this.subGraphic.forEach(g => {
      g.addUpdateShapeAndBoundsTag();
      g.addUpdatePositionTag();
    });
  }

  translate(x: number, y: number) {
    super.translate(x, y);

    this.subGraphic.forEach(g => {
      g.addUpdatePositionTag();
      g.addUpdateBoundTag();
    });
    return this;
  }

  translateTo(x: number, y: number) {
    super.translateTo(x, y);

    this.subGraphic.forEach(g => {
      g.addUpdatePositionTag();
      g.addUpdateBoundTag();
    });
    return this;
  }

  scale(scaleX: number, scaleY: number, scaleCenter?: IPointLike) {
    super.scale(scaleX, scaleY, scaleCenter);

    this.subGraphic.forEach(g => {
      g.addUpdatePositionTag();
      g.addUpdateBoundTag();
    });
    return this;
  }

  scaleTo(scaleX: number, scaleY: number) {
    super.scaleTo(scaleX, scaleY);

    this.subGraphic.forEach(g => {
      g.addUpdatePositionTag();
      g.addUpdateBoundTag();
    });
    return this;
  }

  rotate(angle: number) {
    super.rotate(angle);

    this.subGraphic.forEach(g => {
      g.addUpdatePositionTag();
      g.addUpdateBoundTag();
    });
    return this;
  }

  rotateTo(angle: number) {
    super.rotate(angle);

    this.subGraphic.forEach(g => {
      g.addUpdatePositionTag();
      g.addUpdateBoundTag();
    });
    return this;
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

  getNoWorkAnimateAttr(): Record<string, number> {
    return Glyph.NOWORK_ANIMATE_ATTR;
  }
}

export function createGlyph(attributes: IGlyphGraphicAttribute): IGlyph {
  return new Glyph(attributes);
}
