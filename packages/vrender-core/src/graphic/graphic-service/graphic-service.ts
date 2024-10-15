import { inject, injectable } from '../../common/inversify-lite';
import type { IAABBBounds } from '@visactor/vutils';
import { AABBBounds, isNumber, transformBoundsWithMatrix } from '@visactor/vutils';
import { SyncHook } from '../../tapable';
import type {
  mat4,
  IGraphicAttribute,
  IGraphic,
  IGroup,
  IStage,
  IText,
  ITextGraphicAttribute,
  ITransform,
  IGraphicService,
  IGraphicCreator,
  ISyncHook
} from '../../interface';
import { textDrawOffsetX, textLayoutOffsetY } from '../../common/text';
import { boundStroke } from '../tools';
import { mat4Allocate } from '../../allocator/matrix-allocate';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { BoundsContext } from '../../common/bounds-context';
import { renderCommandList } from '../../common/render-command-list';
import { GraphicCreator } from '../constants';
import { identityMat4, multiplyMat4Mat4, rotateX, rotateY, rotateZ, scaleMat4, translate } from '../../common/matrix';
import { application } from '../../application';

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
    clearAABBBounds: ISyncHook<[IGraphic, IStage, IAABBBounds]>;
  };

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
      ]),
      clearAABBBounds: new SyncHook<[IGraphic, IStage, IAABBBounds]>(['graphic', 'stage', 'aabbBounds'])
    };
    this.tempAABBBounds1 = new AABBBounds();
    this.tempAABBBounds2 = new AABBBounds();
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
  clearAABBBounds(graphic: IGraphic, stage: IStage, b: IAABBBounds) {
    if (this.hooks.clearAABBBounds.taps.length) {
      this.hooks.clearAABBBounds.call(graphic, stage, b);
    }
  }
  // TODO delete
  updatePathProxyAABBBounds(aabbBounds: IAABBBounds, graphic?: IGraphic): boolean {
    const path = typeof graphic.pathProxy === 'function' ? graphic.pathProxy(graphic.attribute) : graphic.pathProxy;
    if (!path) {
      return false;
    }
    const boundsContext = new BoundsContext(aabbBounds);
    renderCommandList(path.commandList, boundsContext, 0, 0);
    return true;
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

  validCheck(
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

    // 是Group或者有影子节点的话，就直接认为是合法的
    if (graphic.shadowRoot || graphic.isContainer) {
      return true;
    }

    const { visible = theme.visible } = attribute;

    if (!(graphic.valid && visible)) {
      // application.graphicService.beforeUpdateAABBBounds(graphic, graphic.stage, true, aabbBounds);
      if (!aabbBounds.empty()) {
        graphic.parent && aabbBounds.transformWithMatrix((graphic.parent as IGroup).globalTransMatrix);
        application.graphicService.clearAABBBounds(graphic, graphic.stage, aabbBounds);
        aabbBounds.clear();
      }
      return false;
    }
    return true;
  }

  updateTempAABBBounds(aabbBounds: IAABBBounds) {
    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    return { tb1, tb2 };
  }
}
