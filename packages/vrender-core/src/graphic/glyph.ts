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
import { getTheme } from './theme';
import { application } from '../application';
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

  useStates(states: string[], hasAnimation?: boolean): void {
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

    this.stopStateAnimates();

    const stateAttrs = {};
    const subAttrs = this.subGraphic.map(() => ({}));
    states.forEach(stateName => {
      const attrs = this.glyphStateProxy ? this.glyphStateProxy(stateName, states) : this.glyphStates[stateName];

      if (attrs) {
        Object.assign(stateAttrs, attrs.attributes);

        if (attrs.subAttributes?.length) {
          subAttrs.forEach((subAttrs, index) => {
            Object.assign(subAttrs, attrs.subAttributes[index]);
          });
        }
      }
    });

    this.subGraphic.forEach((graphic, index) => {
      graphic.updateNormalAttrs(subAttrs[index]);
      graphic.applyStateAttrs(subAttrs[index], states, hasAnimation);
    });

    this.updateNormalAttrs(stateAttrs);
    this.currentStates = states;
    this.applyStateAttrs(stateAttrs, states, hasAnimation);
  }

  clearStates(hasAnimation?: boolean) {
    this.stopStateAnimates();
    if (this.hasState() && this.normalAttrs) {
      this.currentStates = [];
      this.subGraphic.forEach(graphic => {
        graphic.applyStateAttrs(graphic.normalAttrs, this.currentStates, hasAnimation, true);
        graphic.normalAttrs = null;
      });
      this.applyStateAttrs(this.normalAttrs, this.currentStates, hasAnimation, true);
    } else {
      this.currentStates = [];
    }
    this.normalAttrs = null;
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
