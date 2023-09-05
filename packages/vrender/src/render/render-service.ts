import { injectable, inject } from 'inversify';
import type { IAABBBounds, IBounds } from '@visactor/vutils';
import type { IGroup, IGraphic, IRenderService, IRenderServiceDrawParams, IDrawContribution } from '../interface';
import { DrawContribution } from './contributions/render';

export const RenderService = Symbol.for('RenderService');
export const BeforeRenderConstribution = Symbol.for('BeforeRenderConstribution');

/**
 * 渲染用的service，通常和stage一一绑定，
 * 并不是单例模式，所以会绑定此次渲染的一些数据
 */
@injectable()
export class DefaultRenderService implements IRenderService {
  // 每次render都会变的数据
  dirtyBounds: IBounds;
  renderTreeRoots: IGraphic[]; // 此次render的数组
  renderLists: IGraphic[];
  drawParams: IRenderServiceDrawParams;

  constructor(
    @inject(DrawContribution)
    private readonly drawContribution: IDrawContribution
  ) {}

  // 渲染前准备工作，计算bounds等逻辑
  prepare(updateBounds: boolean): void {
    this.renderTreeRoots.forEach(g => {
      this._prepare(g, updateBounds);
    });
    return;
  }
  protected _prepare(g: IGraphic, updateBounds: boolean) {
    g.forEachChildren(g => {
      this._prepare(g as IGraphic, updateBounds);
    });
    g.update({ bounds: updateBounds, trans: true });
  }
  // 获取要渲染的list，可能存在一些不用渲染的内容，以及外描边
  prepareRenderList(): void {
    return;
  }
  // 渲染前流程
  beforeDraw(params: IRenderServiceDrawParams): void {
    return;
  }
  // 具体渲染
  draw(params: IRenderServiceDrawParams): void {
    this.drawContribution.draw(this, { ...this.drawParams });
  }
  // 渲染后流程
  afterDraw(params: IRenderServiceDrawParams): void {
    this.drawContribution.afterDraw && this.drawContribution.afterDraw(this, { ...this.drawParams });
    return;
  }
  // 对外暴露的绘制方法
  render(groups: IGroup[], params: IRenderServiceDrawParams): void {
    this.renderTreeRoots = groups;
    this.drawParams = params;
    const updateBounds = params.updateBounds;
    this.prepare(updateBounds);
    this.prepareRenderList();
    this.beforeDraw(params);
    this.draw(params);
    this.afterDraw(params);
  }
}
