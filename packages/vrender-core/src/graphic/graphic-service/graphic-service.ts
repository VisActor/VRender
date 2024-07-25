import { inject, injectable } from '../../common/inversify-lite';
import type { IAABBBounds, IBounds } from '@visactor/vutils';
import { AABBBounds, epsilon, isArray, isNumber, pi2, transformBoundsWithMatrix } from '@visactor/vutils';
import { SyncHook } from '../../tapable';
import type {
  mat4,
  IArc,
  IArcGraphicAttribute,
  IArea,
  IAreaGraphicAttribute,
  IGraphicAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IGraphic,
  IGroup,
  IGroupGraphicAttribute,
  ILine,
  ILineGraphicAttribute,
  IPath,
  IPathGraphicAttribute,
  IPolygon,
  IPolygonGraphicAttribute,
  IRectGraphicAttribute,
  IStage,
  ISymbol,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  IGlyph,
  IGlyphGraphicAttribute,
  IRichTextGraphicAttribute,
  IRichText,
  IPyramid3dGraphicAttribute,
  IPyramid3d,
  IArc3dGraphicAttribute,
  IArc3d,
  IImageGraphicAttribute,
  ITransform,
  IGraphicService,
  IGraphicCreator,
  ISyncHook,
  IRectBoundsContribution,
  ISymbolBoundsContribution,
  ICircleBoundsContribution,
  IArcBoundsContribution,
  IPathBoundsContribution,
  IImageBoundsContribution
} from '../../interface';
import { textDrawOffsetX, textLayoutOffsetY } from '../../common/text';
import { DefaultSymbolOuterBorderBoundsContribution } from './symbol-contribution';
import { boundStroke } from '../tools';
import { mat4Allocate } from '../../allocator/matrix-allocate';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { BoundsContext } from '../../common/bounds-context';
import { renderCommandList } from '../../common/render-command-list';
import { circleBounds } from '../../common/utils';
import { GraphicCreator } from '../constants';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';
import { identityMat4, multiplyMat4Mat4, rotateX, rotateY, rotateZ, scaleMat4, translate } from '../../common/matrix';

export function getExtraModelMatrix(dx: number, dy: number, graphic: IGraphic): mat4 | null {
  const { alpha, beta } = graphic.attribute;
  if (!alpha && !beta) {
    return null;
  }
  const { anchor3d = graphic.attribute.anchor } = graphic.attribute;

  const _anchor: [number, number] = [0, 0];
  if (anchor3d) {
    if (typeof anchor3d[0] === 'string') {
      const ratio = parseFloat(anchor3d[0]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[0] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[0] = anchor3d[0];
    }
    if (typeof anchor3d[1] === 'string') {
      const ratio = parseFloat(anchor3d[1]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[1] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[1] = anchor3d[1];
    }
  }

  if (graphic.type === 'text') {
    const { textAlign } = graphic.attribute as ITextGraphicAttribute;
    // 计算偏移
    _anchor[0] += textDrawOffsetX(textAlign, (graphic as IText).clipedWidth);
  }

  // 应用偏移，计算全局的偏移
  _anchor[0] += dx;
  _anchor[1] += dy;
  // matrix.scale(dpr, dpr);

  const modelMatrix = mat4Allocate.allocate();
  translate(modelMatrix, modelMatrix, [_anchor[0], _anchor[1], 0]);
  if (beta) {
    rotateX(modelMatrix, modelMatrix, beta);
  }
  if (alpha) {
    rotateY(modelMatrix, modelMatrix, alpha);
  }
  translate(modelMatrix, modelMatrix, [-_anchor[0], -_anchor[1], 0]);

  return modelMatrix;
}

// 计算3d下的模型矩阵
export function getModelMatrix(out: mat4, graphic: IGraphic, theme: ITransform) {
  const {
    x = theme.x,
    y = theme.y,
    z = theme.z,
    dx = theme.dx,
    dy = theme.dy,
    dz = theme.dz,
    scaleX = theme.scaleX,
    scaleY = theme.scaleY,
    scaleZ = theme.scaleZ,
    alpha = theme.alpha,
    beta = theme.beta,
    angle = theme.angle,
    anchor3d = graphic.attribute.anchor,
    anchor
  } = graphic.attribute;

  const _anchor: [number, number, number] = [0, 0, 0];
  if (anchor3d) {
    if (typeof anchor3d[0] === 'string') {
      const ratio = parseFloat(anchor3d[0]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[0] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[0] = anchor3d[0];
    }
    if (typeof anchor3d[1] === 'string') {
      const ratio = parseFloat(anchor3d[1]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[1] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[1] = anchor3d[1];
    }
    _anchor[2] = anchor3d[2] ?? 0;
  }

  // if (graphic.type === 'text') {
  //   const { textAlign } = graphic.attribute as ITextGraphicAttribute;
  //   // 计算偏移
  //   _anchor[0] += textDrawOffsetX(textAlign, (graphic as IText).clipedWidth);
  // }

  identityMat4(out);
  // 平移
  translate(out, out, [x + dx, y + dy, z + dz]);
  translate(out, out, [_anchor[0], _anchor[1], _anchor[2]]);
  rotateX(out, out, beta);
  rotateY(out, out, alpha);
  // 基于z轴的偏移基于anchor计算
  // rotateZ(out, out, angle);
  translate(out, out, [-_anchor[0], -_anchor[1], _anchor[2]]);
  scaleMat4(out, out, [scaleX, scaleY, scaleZ]);

  // 计算基于z轴的偏移
  if (angle) {
    const m = mat4Allocate.allocate();
    const _anchor: [number, number] = [0, 0];
    if (anchor) {
      if (typeof anchor3d[0] === 'string') {
        const ratio = parseFloat(anchor3d[0]) / 100;
        const bounds = graphic.AABBBounds;
        _anchor[0] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
      } else {
        _anchor[0] = anchor3d[0];
      }
      if (typeof anchor3d[1] === 'string') {
        const ratio = parseFloat(anchor3d[1]) / 100;
        const bounds = graphic.AABBBounds;
        _anchor[1] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
      } else {
        _anchor[1] = anchor3d[1];
      }
    }

    translate(m, m, [_anchor[0], _anchor[1], 0]);
    // 基于z轴的偏移基于anchor计算
    rotateZ(m, m, angle);
    translate(m, m, [-_anchor[0], -_anchor[1], 0]);

    multiplyMat4Mat4(out, out, m);
  }
}

export function shouldUseMat4(graphic: IGraphic) {
  const { alpha, beta } = graphic.attribute;
  return alpha || beta;
}

// 管理graphic
@injectable()
export class DefaultGraphicService implements IGraphicService {
  declare hooks: {
    onAttributeUpdate: ISyncHook<[IGraphic]>;
    onSetStage: ISyncHook<[IGraphic, IStage]>;
    onRemove: ISyncHook<[IGraphic]>;
    onRelease: ISyncHook<[IGraphic]>;
    onAddIncremental: ISyncHook<[IGraphic, IGroup, IStage]>;
    onClearIncremental: ISyncHook<[IGroup, IStage]>;
    beforeUpdateAABBBounds: ISyncHook<[IGraphic, IStage, boolean, IAABBBounds]>;
    afterUpdateAABBBounds: ISyncHook<[IGraphic, IStage, IAABBBounds, { globalAABBBounds: IAABBBounds }, boolean]>;
  };

  protected _rectBoundsContribitions: IRectBoundsContribution[];
  protected _symbolBoundsContribitions: ISymbolBoundsContribution[];
  protected _imageBoundsContribitions: IImageBoundsContribution[];
  protected _circleBoundsContribitions: ICircleBoundsContribution[];
  protected _arcBoundsContribitions: IArcBoundsContribution[];
  protected _pathBoundsContribitions: IPathBoundsContribution[];
  // 临时bounds，用作缓存
  protected tempAABBBounds1: AABBBounds;
  protected tempAABBBounds2: AABBBounds;
  constructor(@inject(GraphicCreator) public readonly creator: IGraphicCreator) {
    this.hooks = {
      onAttributeUpdate: new SyncHook<[IGraphic]>(['graphic']),
      onSetStage: new SyncHook<[IGraphic, IStage]>(['graphic', 'stage']),
      onRemove: new SyncHook<[IGraphic]>(['graphic']),
      onRelease: new SyncHook<[IGraphic]>(['graphic']),
      onAddIncremental: new SyncHook<[IGraphic, IGroup, IStage]>(['graphic', 'group', 'stage']),
      onClearIncremental: new SyncHook<[IGroup, IStage]>(['graphic', 'group', 'stage']),
      beforeUpdateAABBBounds: new SyncHook<[IGraphic, IStage, boolean, IAABBBounds]>([
        'graphic',
        'stage',
        'willUpdate',
        'aabbBounds'
      ]),
      afterUpdateAABBBounds: new SyncHook<[IGraphic, IStage, IAABBBounds, { globalAABBBounds: IAABBBounds }, boolean]>([
        'graphic',
        'stage',
        'aabbBounds',
        'globalAABBBounds',
        'selfChange'
      ])
    };
    this.tempAABBBounds1 = new AABBBounds();
    this.tempAABBBounds2 = new AABBBounds();
    this._rectBoundsContribitions = [new DefaultOuterBorderBoundsContribution()];
    this._symbolBoundsContribitions = [new DefaultSymbolOuterBorderBoundsContribution()];
    this._imageBoundsContribitions = [new DefaultOuterBorderBoundsContribution()];
    this._circleBoundsContribitions = [new DefaultOuterBorderBoundsContribution()];
    this._arcBoundsContribitions = [new DefaultOuterBorderBoundsContribution()];
    this._pathBoundsContribitions = [new DefaultOuterBorderBoundsContribution()];
  }
  onAttributeUpdate(graphic: IGraphic) {
    if (this.hooks.onAttributeUpdate.taps.length) {
      this.hooks.onAttributeUpdate.call(graphic);
    }
  }
  onSetStage(graphic: IGraphic, stage: IStage): void {
    if (this.hooks.onSetStage.taps.length) {
      this.hooks.onSetStage.call(graphic, stage);
    }
  }
  onRemove(graphic: IGraphic<Partial<IGraphicAttribute>>): void {
    if (this.hooks.onRemove.taps.length) {
      this.hooks.onRemove.call(graphic);
    }
  }
  onRelease(graphic: IGraphic<Partial<IGraphicAttribute>>): void {
    if (this.hooks.onRelease.taps.length) {
      this.hooks.onRelease.call(graphic);
    }
  }
  onAddIncremental(graphic: IGraphic, group: IGroup, stage: IStage): void {
    if (this.hooks.onAddIncremental.taps.length) {
      this.hooks.onAddIncremental.call(graphic, group, stage);
    }
  }
  onClearIncremental(group: IGroup, stage: IStage): void {
    if (this.hooks.onClearIncremental.taps.length) {
      this.hooks.onClearIncremental.call(group, stage);
    }
  }
  beforeUpdateAABBBounds(graphic: IGraphic, stage: IStage, willUpdate: boolean, bounds: IAABBBounds) {
    if (this.hooks.beforeUpdateAABBBounds.taps.length) {
      this.hooks.beforeUpdateAABBBounds.call(graphic, stage, willUpdate, bounds);
    }
  }
  afterUpdateAABBBounds(
    graphic: IGraphic,
    stage: IStage,
    bounds: IAABBBounds,
    params: { globalAABBBounds: IAABBBounds },
    selfChange: boolean
  ) {
    if (this.hooks.afterUpdateAABBBounds.taps.length) {
      this.hooks.afterUpdateAABBBounds.call(graphic, stage, bounds, params, selfChange);
    }
  }

  updatePathProxyAABBBounds(aabbBounds: IAABBBounds, graphic?: IGraphic): boolean {
    const path = typeof graphic.pathProxy === 'function' ? graphic.pathProxy(graphic.attribute) : graphic.pathProxy;
    if (!path) {
      return false;
    }
    const boundsContext = new BoundsContext(aabbBounds);
    renderCommandList(path.commandList, boundsContext, 0, 0);
    return true;
  }

  updateRectAABBBounds(
    attribute: IRectGraphicAttribute,
    rectTheme: Required<IRectGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) {
    if (!this._validCheck(attribute, rectTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      let { width, height } = attribute;
      const { x1, y1, x, y } = attribute;
      width = width ?? x1 - x;
      height = height ?? y1 - y;
      if (isFinite(width) || isFinite(height) || isFinite(x) || isFinite(y)) {
        aabbBounds.set(0, 0, width || 0, height || 0);
      }
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this._rectBoundsContribitions.length &&
      this._rectBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, rectTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    this.transformAABBBounds(attribute, aabbBounds, rectTheme, false, graphic);
    return aabbBounds;
  }

  updateGroupAABBBounds(
    attribute: IGroupGraphicAttribute,
    groupTheme: Required<IGroupGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGroup
  ) {
    const originalAABBBounds = aabbBounds; // fix aabbbounds update error in flex layout
    aabbBounds = aabbBounds.clone();

    const { width, height, path, clip = groupTheme.clip, display } = attribute;
    // 添加自身的fill或者clip
    if (path && path.length) {
      path.forEach(g => {
        aabbBounds.union(g.AABBBounds);
      });
    } else if (width != null && height != null) {
      aabbBounds.set(0, 0, Math.max(0, width), Math.max(0, height)); // fix bounds set when auto size in vtable
    }
    if (!clip) {
      // 添加子节点
      graphic.forEachChildren((node: IGraphic) => {
        aabbBounds.union(node.AABBBounds);
      });
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this.transformAABBBounds(attribute, aabbBounds, groupTheme, false, graphic);

    originalAABBBounds.copy(aabbBounds);
    return originalAABBBounds;
  }

  updateGlyphAABBBounds(
    attribute: IGlyphGraphicAttribute,
    theme: Required<IGlyphGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGlyph
  ) {
    if (!this._validCheck(attribute, theme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    // 添加子节点
    graphic.getSubGraphic().forEach((node: IGraphic) => {
      aabbBounds.union(node.AABBBounds);
    });

    // glyph不需要计算AABBBounds
    // this.transformAABBBounds(attribute, aabbBounds, theme, graphic);
    return aabbBounds;
  }

  updateHTMLTextAABBBounds(
    attribute: ITextGraphicAttribute,
    textTheme: Required<ITextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IText
  ) {
    const { textAlign, textBaseline } = attribute;
    if (attribute.forceBoundsHeight != null) {
      const h = isNumber(attribute.forceBoundsHeight) ? attribute.forceBoundsHeight : attribute.forceBoundsHeight();
      const dy = textLayoutOffsetY(textBaseline, h, h);
      aabbBounds.set(aabbBounds.x1, dy, aabbBounds.x2, dy + h);
    }
    if (attribute.forceBoundsWidth != null) {
      const w = isNumber(attribute.forceBoundsWidth) ? attribute.forceBoundsWidth : attribute.forceBoundsWidth();
      const dx = textDrawOffsetX(textAlign, w);
      aabbBounds.set(dx, aabbBounds.y1, dx + w, aabbBounds.y2);
    }
  }

  updateRichTextAABBBounds(
    attribute: IRichTextGraphicAttribute,
    richtextTheme: Required<IRichTextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IRichText
  ) {
    if (!this._validCheck(attribute, richtextTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!graphic) {
      return aabbBounds;
    }

    const {
      width = richtextTheme.width,
      height = richtextTheme.height,
      maxWidth = richtextTheme.maxWidth,
      maxHeight = richtextTheme.maxHeight,
      textAlign = richtextTheme.textAlign,
      textBaseline = richtextTheme.textBaseline
    } = attribute;

    if (width > 0 && height > 0) {
      // 外部设置宽高
      aabbBounds.set(0, 0, width, height);
    } else {
      // 获取内容宽高
      const frameCache = graphic.getFrameCache();
      const { width: actualWidth, height: actualHeight } = frameCache.getActualSize();
      let contentWidth = width || actualWidth || 0;
      let contentHeight = height || actualHeight || 0;

      contentHeight = typeof maxHeight === 'number' && contentHeight > maxHeight ? maxHeight : contentHeight || 0;
      contentWidth = typeof maxWidth === 'number' && contentWidth > maxWidth ? maxWidth : contentWidth || 0;

      aabbBounds.set(0, 0, contentWidth, contentHeight);
    }

    // 调整对齐方式
    let deltaY = 0;
    switch (textBaseline) {
      case 'top':
        deltaY = 0;
        break;
      case 'middle':
        deltaY = -aabbBounds.height() / 2;
        break;
      case 'bottom':
        deltaY = -aabbBounds.height();
        break;
      default:
        break;
    }
    let deltaX = 0;
    switch (textAlign) {
      case 'left':
        deltaX = 0;
        break;
      case 'center':
        deltaX = -aabbBounds.width() / 2;
        break;
      case 'right':
        deltaX = -aabbBounds.width();
        break;
      default:
        break;
    }
    aabbBounds.translate(deltaX, deltaY);

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    if (attribute.forceBoundsHeight != null || attribute.forceBoundsWidth != null) {
      this.updateHTMLTextAABBBounds(attribute, richtextTheme, aabbBounds);
    }
    this.transformAABBBounds(attribute, aabbBounds, richtextTheme, false, graphic);
    return aabbBounds;
  }

  updateTextAABBBounds(
    attribute: ITextGraphicAttribute,
    textTheme: Required<ITextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IText
  ) {
    if (!this._validCheck(attribute, textTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!graphic) {
      return aabbBounds;
    }
    const { text = textTheme.text } = graphic.attribute;
    if (Array.isArray(text)) {
      graphic.updateMultilineAABBBounds(text as (number | string)[]);
    } else {
      graphic.updateSingallineAABBBounds(text as number | string);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    const {
      scaleX = textTheme.scaleX,
      scaleY = textTheme.scaleY,
      shadowBlur = textTheme.shadowBlur,
      strokeBoundsBuffer = textTheme.strokeBoundsBuffer
    } = attribute;
    if (shadowBlur) {
      const shadowBlurHalfWidth = shadowBlur / Math.abs(scaleX + scaleY);
      boundStroke(tb1, shadowBlurHalfWidth, true, strokeBoundsBuffer);
      aabbBounds.union(tb1);
    }
    // 合并shadowRoot的bounds
    this.combindShadowAABBBounds(aabbBounds, graphic);

    if (attribute.forceBoundsHeight != null || attribute.forceBoundsWidth != null) {
      this.updateHTMLTextAABBBounds(attribute, textTheme, aabbBounds);
    }

    transformBoundsWithMatrix(aabbBounds, aabbBounds, graphic.transMatrix);
    return aabbBounds;
  }

  updatePathAABBBounds(
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPath
  ) {
    if (!this._validCheck(attribute, pathTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      this.updatePathAABBBoundsImprecise(attribute, pathTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this._pathBoundsContribitions.length &&
      this._pathBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, pathTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });
    const { lineJoin = pathTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, pathTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updatePathAABBBoundsImprecise(
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPath
  ): IAABBBounds {
    if (!graphic) {
      return aabbBounds;
    }
    const pathShape = graphic.getParsedPathShape();
    aabbBounds.union(pathShape.getBounds());

    return aabbBounds;
  }

  updatePyramid3dAABBBounds(
    attribute: IPyramid3dGraphicAttribute,
    polygonTheme: Required<IPyramid3dGraphicAttribute>,
    aabbBounds: IBounds,
    graphic?: IPyramid3d
  ) {
    if (!graphic) {
      return aabbBounds;
    }

    const stage = graphic.stage;
    if (!stage || !stage.camera) {
      return aabbBounds;
    }

    const faces = graphic.findFace();
    // const outP = [0, 0, 0];
    faces.vertices.forEach(v => {
      const x = v[0];
      const y = v[1];
      aabbBounds.add(x, y);
    });

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    this.transformAABBBounds(attribute, aabbBounds, polygonTheme, false, graphic);
    return aabbBounds;
  }

  updateArc3dAABBBounds(
    attribute: IArc3dGraphicAttribute,
    arcTheme: Required<IArc3dGraphicAttribute>,
    aabbBounds: IBounds,
    graphic?: IArc3d
  ) {
    if (!graphic) {
      return aabbBounds;
    }

    const stage = graphic.stage;
    if (!stage || !stage.camera) {
      return aabbBounds;
    }

    // 当做一个立方体计算
    const { outerRadius = arcTheme.outerRadius, height = 0 } = attribute;
    const r = outerRadius + height;
    aabbBounds.setValue(-r, -r, r, r);
    // const matrix = getExtraModelMatrix(graphic.globalTransMatrix, 1, graphic);
    // const { outerRadius=arcTheme.outerRadius, height=0 } = attribute;
    // const points = [
    //   {x: -outerRadius, y: -outerRadius, z: 0 },
    //   {x: outerRadius, y: -outerRadius, z: 0 },
    //   {x: outerRadius, y: outerRadius, z: 0 },
    //   {x: -outerRadius, y: outerRadius, z: 0 },
    //   {x: -outerRadius, y: -outerRadius, z: height },
    //   {x: outerRadius, y: -outerRadius, z: height },
    //   {x: outerRadius, y: outerRadius, z: height },
    //   {x: -outerRadius, y: outerRadius, z: height },
    // ]
    // const outP: vec3 = [0, 0, 0];
    // points.forEach(item => {
    //   let x = item.x;
    //   let y = item.y;
    //   if (stage.camera) {
    //     transformMat4(outP, [item.x, item.y, item.z], matrix);
    //     const data = stage.camera.vp(outP[0], outP[1], outP[2]);
    //     x = data.x;
    //     y = data.y;
    //   }
    //   aabbBounds.add(x, y);
    // });

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    this.transformAABBBounds(attribute, aabbBounds, arcTheme, false, graphic);
    return aabbBounds;
  }

  updatePolygonAABBBounds(
    attribute: IPolygonGraphicAttribute,
    polygonTheme: Required<IPolygonGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPolygon
  ) {
    if (!this._validCheck(attribute, polygonTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      this.updatePolygonAABBBoundsImprecise(attribute, polygonTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // if (!this._pathBoundsContribitions) {
    //   this._pathBoundsContribitions = this.pathBoundsContribitions.getContributions() || [];
    // }
    // this._pathBoundsContribitions.length &&
    //   this._pathBoundsContribitions.forEach(c => {
    //     c.updateBounds(attribute, polygonTheme, tb1, graphic);
    //     aabbBounds.union(tb1);
    //     tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    //   });

    const { lineJoin = polygonTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, polygonTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updatePolygonAABBBoundsImprecise(
    attribute: IPolygonGraphicAttribute,
    polygonTheme: Required<IPolygonGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPolygon
  ): IAABBBounds {
    const { points = polygonTheme.points } = attribute;
    points.forEach(p => {
      aabbBounds.add(p.x, p.y);
    });

    return aabbBounds;
  }

  updateLineAABBBounds(
    attribute: ILineGraphicAttribute,
    lineTheme: Required<ILineGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ILine
  ) {
    if (!this._validCheck(attribute, lineTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      attribute.segments
        ? this.updateLineAABBBoundsBySegments(attribute, lineTheme, aabbBounds, graphic)
        : this.updateLineAABBBoundsByPoints(attribute, lineTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // if (!this._rectBoundsContribitions) {
    //   this._rectBoundsContribitions = this.rectBoundsContribitions.getContributions() || [];
    // }
    // this._rectBoundsContribitions.length &&
    //   this._rectBoundsContribitions.forEach(c => {
    //     c.updateBounds(attribute, areaTheme, tb1, graphic);
    //     aabbBounds.union(tb1);
    //     tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    //   });

    const { lineJoin = lineTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, lineTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updateLineAABBBoundsByPoints(
    attribute: ILineGraphicAttribute,
    lineTheme: Required<ILineGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ILine
  ): IAABBBounds {
    const { points = lineTheme.points, connectedType } = attribute;
    const b = aabbBounds;
    points.forEach(p => {
      if (p.defined !== false || connectedType === 'zero') {
        b.add(p.x, p.y);
      }
    });
    return b;
  }
  protected updateLineAABBBoundsBySegments(
    attribute: ILineGraphicAttribute,
    lineTheme: Required<ILineGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ILine
  ): IAABBBounds {
    const { segments = lineTheme.segments, connectedType } = attribute;
    const b = aabbBounds;
    segments.forEach(s => {
      s.points.forEach(p => {
        if (p.defined !== false || connectedType === 'zero') {
          b.add(p.x, p.y);
        }
      });
    });
    return b;
  }

  updateAreaAABBBounds(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ) {
    if (!this._validCheck(attribute, areaTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      attribute.segments
        ? this.updateAreaAABBBoundsBySegments(attribute, areaTheme, aabbBounds, graphic)
        : this.updateAreaAABBBoundsByPoints(attribute, areaTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // if (!this._rectBoundsContribitions) {
    //   this._rectBoundsContribitions = this.rectBoundsContribitions.getContributions() || [];
    // }
    // this._rectBoundsContribitions.length &&
    //   this._rectBoundsContribitions.forEach(c => {
    //     c.updateBounds(attribute, areaTheme, tb1, graphic);
    //     aabbBounds.union(tb1);
    //     tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    //   });

    const { lineJoin = areaTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, areaTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updateAreaAABBBoundsByPoints(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ): IAABBBounds {
    const { points = areaTheme.points } = attribute;
    const b = aabbBounds;
    points.forEach(p => {
      b.add(p.x, p.y);
      b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
    });
    return b;
  }
  protected updateAreaAABBBoundsBySegments(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ): IAABBBounds {
    const { segments = areaTheme.segments } = attribute;
    const b = aabbBounds;
    segments.forEach(s => {
      s.points.forEach(p => {
        b.add(p.x, p.y);
        b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
      });
    });
    return b;
  }

  updateCircleAABBBounds(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: ICircle
  ) {
    if (!this._validCheck(attribute, circleTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      full
        ? this.updateCircleAABBBoundsImprecise(attribute, circleTheme, aabbBounds, graphic)
        : this.updateCircleAABBBoundsAccurate(attribute, circleTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this._circleBoundsContribitions.length &&
      this._circleBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, circleTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    this.transformAABBBounds(attribute, aabbBounds, circleTheme, false, graphic);

    return aabbBounds;
  }

  protected updateCircleAABBBoundsImprecise(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    const { radius = circleTheme.radius } = attribute;
    aabbBounds.set(-radius, -radius, radius, radius);

    return aabbBounds;
  }
  protected updateCircleAABBBoundsAccurate(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    const {
      startAngle = circleTheme.startAngle,
      endAngle = circleTheme.endAngle,
      radius = circleTheme.radius
    } = attribute;

    if (endAngle - startAngle > pi2 - epsilon) {
      aabbBounds.set(-radius, -radius, radius, radius);
    } else {
      circleBounds(startAngle, endAngle, radius, aabbBounds);
    }

    return aabbBounds;
  }

  updateArcAABBBounds(
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: IArc
  ) {
    if (!this._validCheck(attribute, arcTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      full
        ? this.updateArcAABBBoundsImprecise(attribute, arcTheme, aabbBounds, graphic)
        : this.updateArcAABBBoundsAccurate(attribute, arcTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this._arcBoundsContribitions.length &&
      this._arcBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, arcTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    const { lineJoin = arcTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, arcTheme, lineJoin === 'miter', graphic);

    return aabbBounds;
  }

  protected updateArcAABBBoundsImprecise(
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    let { outerRadius = arcTheme.outerRadius, innerRadius = arcTheme.innerRadius } = attribute;
    const { outerPadding = arcTheme.outerPadding, innerPadding = arcTheme.innerPadding } = attribute;
    outerRadius += outerPadding;
    innerRadius -= innerPadding;
    if (outerRadius < innerRadius) {
      outerRadius = innerRadius;
    }

    aabbBounds.set(-outerRadius, -outerRadius, outerRadius, outerRadius);

    return aabbBounds;
  }
  protected updateArcAABBBoundsAccurate(
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    let { outerRadius = arcTheme.outerRadius, innerRadius = arcTheme.innerRadius } = attribute;
    const { outerPadding = arcTheme.outerPadding, innerPadding = arcTheme.innerPadding } = attribute;
    outerRadius += outerPadding;
    innerRadius -= innerPadding;
    if (outerRadius < innerRadius) {
      // 不用解构，避免性能问题
      const temp = outerRadius;
      outerRadius = innerRadius;
      innerRadius = temp;
    }
    let { endAngle = arcTheme.endAngle, startAngle = arcTheme.startAngle } = attribute;

    if (startAngle > endAngle) {
      const temp = startAngle;
      startAngle = endAngle;
      endAngle = temp;
    }

    if (outerRadius <= epsilon) {
      aabbBounds.set(0, 0, 0, 0);
    } else if (Math.abs(endAngle - startAngle) > pi2 - epsilon) {
      aabbBounds.set(-outerRadius, -outerRadius, outerRadius, outerRadius);
    } else {
      // 直接内外两个radius叠加即可，不需要更精确
      circleBounds(startAngle, endAngle, outerRadius, aabbBounds);
      circleBounds(startAngle, endAngle, innerRadius, aabbBounds);
    }

    return aabbBounds;
  }

  updateSymbolAABBBounds(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: ISymbol
  ) {
    if (!this._validCheck(attribute, symbolTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      full
        ? this.updateSymbolAABBBoundsImprecise(attribute, symbolTheme, aabbBounds, graphic)
        : this.updateSymbolAABBBoundsAccurate(attribute, symbolTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this._symbolBoundsContribitions.length &&
      this._symbolBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, symbolTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    const { lineJoin = symbolTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, symbolTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updateSymbolAABBBoundsImprecise(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    // 当做正方形计算
    const { size = symbolTheme.size } = attribute;

    if (isArray(size)) {
      aabbBounds.set(-size[0] / 2, -size[1] / 2, size[0] / 2, size[1] / 2);
    } else {
      const halfWH = size / 2;

      aabbBounds.set(-halfWH, -halfWH, halfWH, halfWH);
    }

    return aabbBounds;
  }

  protected updateSymbolAABBBoundsAccurate(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ISymbol
  ): IAABBBounds {
    if (!graphic) {
      return aabbBounds;
    }
    const { size = symbolTheme.size } = attribute;

    const symbolClass = graphic.getParsedPath();
    symbolClass.bounds(size, aabbBounds);

    return aabbBounds;
  }

  updateImageAABBBounds(
    attribute: IImageGraphicAttribute,
    imageTheme: Required<IImageGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) {
    if (!this._validCheck(attribute, imageTheme, aabbBounds, graphic)) {
      return aabbBounds;
    }
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      const { width = imageTheme.width, height = imageTheme.height } = attribute;
      aabbBounds.set(0, 0, width, height);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this._imageBoundsContribitions.length &&
      this._imageBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, imageTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    this.transformAABBBounds(attribute, aabbBounds, imageTheme, false, graphic);
    return aabbBounds;
  }

  combindShadowAABBBounds(bounds: IAABBBounds, graphic?: IGraphic) {
    // 合并shadowRoot的Bounds
    if (graphic && graphic.shadowRoot) {
      const b = graphic.shadowRoot.AABBBounds;
      bounds.union(b);
    }
  }

  transformAABBBounds(
    attribute: Partial<IGraphicAttribute>,
    aabbBounds: IAABBBounds,
    theme: Required<IGraphicAttribute>,
    miter: boolean,
    graphic?: IGraphic
  ) {
    if (!aabbBounds.empty()) {
      const {
        scaleX = theme.scaleX,
        scaleY = theme.scaleY,
        stroke = theme.stroke,
        shadowBlur = theme.shadowBlur,
        lineWidth = theme.lineWidth,
        pickStrokeBuffer = theme.pickStrokeBuffer,
        strokeBoundsBuffer = theme.strokeBoundsBuffer
      } = attribute;
      const tb1 = this.tempAABBBounds1;
      const tb2 = this.tempAABBBounds2;
      if (stroke && lineWidth) {
        const scaledHalfLineWidth = (lineWidth + pickStrokeBuffer) / Math.abs(scaleX + scaleY);
        boundStroke(tb1, scaledHalfLineWidth, miter, strokeBoundsBuffer);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      }
      if (shadowBlur) {
        const { shadowOffsetX = theme.shadowOffsetX, shadowOffsetY = theme.shadowOffsetY } = attribute;
        const shadowBlurWidth = (shadowBlur / Math.abs(scaleX + scaleY)) * 2;
        boundStroke(tb1, shadowBlurWidth, false, strokeBoundsBuffer + 1);
        tb1.translate(shadowOffsetX, shadowOffsetY);
        aabbBounds.union(tb1);
        // tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      }
    }

    // 合并shadowRoot的bounds
    this.combindShadowAABBBounds(aabbBounds, graphic);
    if (aabbBounds.empty()) {
      return;
    }

    // 性能优化逻辑，group类型变换较少，不需要矩阵变换
    let updateMatrix = true;
    const m = graphic.transMatrix;
    if (graphic && graphic.isContainer) {
      updateMatrix = !(m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0);
    }
    updateMatrix && transformBoundsWithMatrix(aabbBounds, aabbBounds, m);

    // TODO 加上锚点
    // transformBounds(aabbBounds, x, y, scaleX, scaleY, angle);
    // if (graphic.attribute.postMatrix) {
    //   console.log('aaa');
    //   transformBoundsWithMatrix(aabbBounds, graphic.attribute.postMatrix);
    // }
    // aabbBounds.translate(dx, dy);
  }

  protected _validCheck(
    attribute: Partial<IGraphicAttribute>,
    theme: Required<IGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): boolean {
    if (!graphic) {
      return true;
    }
    // 设置了强制wh，那就直接认为是合法的
    if (attribute.forceBoundsHeight != null || attribute.forceBoundsWidth != null) {
      return true;
    }
    if (!graphic.valid) {
      aabbBounds.clear();
      return false;
    }
    const { visible = theme.visible } = attribute;
    if (!visible) {
      aabbBounds.clear();
      return false;
    }
    return true;
  }
}
