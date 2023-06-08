import { AABBBounds, Matrix, OBBBounds, Point, transformBounds } from '@visactor/vutils';
import { graphicService } from '../modules';
import { IStage, GraphicAttributeMap, INode, IGraphic, ITheme, IThemeSpec, ILayer, GraphicType } from '../interface';
import { IGroup, IGroupGraphicAttribute } from '../interface/graphic/group';
import { Graphic } from './graphic';
import { getTheme, Theme } from './theme';
import { parsePadding } from '../common/utils';
import { UpdateTag, IContainPointMode } from '../common/enums';
import { GROUP_NUMBER_TYPE } from './constants';

// Group更新AABBBounds的策略
export enum GroupUpdateAABBBoundsMode {
  // Group较少的情况，不会批量设置所有父层的tag，而是每次都查找
  LESS_GROUP = 0,
  // Group较多的情况，每次都会设置tag到最顶层
  MORE_GROUP = 1
}

export class Group extends Graphic<IGroupGraphicAttribute> implements IGroup {
  type: GraphicType = 'group';
  parent: any = null;
  isContainer: boolean = true;
  // 子元素的更新标记
  declare _childUpdateTag: number;

  declare theme?: ITheme;

  constructor(params: IGroupGraphicAttribute) {
    super(params);
    this.numberType = GROUP_NUMBER_TYPE;
    this._childUpdateTag = UpdateTag.UPDATE_BOUNDS;
    // this.theme = new Theme();
  }

  setMode(mode: '2d' | '3d') {
    mode === '3d' ? this.set3dMode() : this.set2dMode();
  }

  set3dMode() {
    this.in3dMode = true;
    // this.forEachChildren((c: IGraphic) => {
    //   c.setMode('3d');
    // });
  }
  set2dMode() {
    this.in3dMode = false;
    // this.forEachChildren((c: IGraphic) => {
    //   c.setMode('2d');
    // });
  }

  setTheme(t: IThemeSpec) {
    if (!this.theme) {
      this.theme = new Theme();
    }
    return this.theme.setTheme(t, this);
  }

  createTheme() {
    if (!this.theme) {
      this.theme = new Theme();
    }
  }

  hideAll() {
    this.setAttribute('visible', false);
    this.forEachChildren((item: IGraphic) => {
      if (item.isContainer && (item as any).hideAll) {
        (item as any).hideAll();
      } else {
        item.setAttribute('visible', false);
      }
    });
  }

  showAll() {
    this.setAttribute('visible', true);
    this.forEachChildren((item: IGraphic) => {
      if (item.isContainer && (item as any).showAll) {
        (item as any).showAll();
      } else {
        item.setAttribute('visible', true);
      }
    });
  }

  /**
   * 是否包含某个点（点需要是全局坐标系）
   * group containsPoint 只需要判断bounds
   * TODO: group的shape判断
   * @param x
   * @param y
   * @param mode
   * @returns
   */
  containsPoint(x: number, y: number, mode: IContainPointMode): boolean {
    if (mode === IContainPointMode.GLOBAL) {
      // 转换x，y更精准
      const point = new Point(x, y);
      if (this.parent) {
        this.parent.globalTransMatrix.transformPoint(point, point);
      }
      return this.AABBBounds.contains(point.x, point.y);
    }
    return this.AABBBounds.contains(x, y);
  }

  shouldUpdateAABBBounds(): boolean {
    // 检索自己是否需要更新
    if (super.shouldUpdateAABBBounds()) {
      return true;
    }
    // 检索叶子节点是否有更新（如果children是叶子节点的话）
    if (this._childUpdateTag & UpdateTag.UPDATE_BOUNDS) {
      return true;
    }
    return false;
    // // 检索是否子group需要更新
    // let needUpdate = false;
    // this.forEachChildren((node: IGraphic) => {
    //   // 只查找group层级
    //   if (node.isContainer && (node as Group).shouldUpdateAABBBounds()) {
    //     needUpdate = true;
    //     return true;
    //   }
    //   return false;
    // });
    // return needUpdate;
  }

  protected tryUpdateAABBBounds(): AABBBounds {
    if (!this.shouldUpdateAABBBounds()) {
      return this._AABBBounds;
    }
    graphicService.beforeUpdateAABBBounds(this, this.stage, true, this._AABBBounds);
    const selfChange = this.shouldSelfChangeUpdateAABBBounds();
    const bounds = this.doUpdateAABBBounds();
    graphicService.afterUpdateAABBBounds(this, this.stage, this._AABBBounds, this, selfChange);
    return bounds;
  }

  protected doUpdateAABBBounds(): AABBBounds {
    const attribute = this.attribute;
    const groupTheme = getTheme(this).group;
    // debugger;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const bounds = graphicService.updateGroupAABBBounds(
      attribute,
      getTheme(this).group,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = groupTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }
    // 更新bounds之后需要设置父节点，否则tag丢失
    this.parent && this.parent.addChildUpdateBoundTag();
    this.clearUpdateBoundTag();

    this._emitCustomEvent('AAABBBoundsChange');
    return bounds;
  }

  protected clearUpdateBoundTag() {
    this._updateTag &= UpdateTag.CLEAR_BOUNDS;
    this._childUpdateTag &= UpdateTag.CLEAR_BOUNDS;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  addUpdateBoundTag() {
    this._updateTag |= UpdateTag.UPDATE_BOUNDS; // for bounds
    if (this.parent) {
      this.parent.addChildUpdateBoundTag();
    }
  }

  addChildUpdateBoundTag() {
    // 如果已经设置过updateTag，那就不需要设置了
    if (this._childUpdateTag & UpdateTag.UPDATE_BOUNDS) {
      return;
    }
    // 如果没有设置过，那么继续向上设置
    this._childUpdateTag |= UpdateTag.UPDATE_BOUNDS;
    this.parent && this.parent.addChildUpdateBoundTag();
  }

  getTheme() {
    return this.theme.getTheme(this);
  }

  // getDefaultAttribute(name: string) {
  //   return DefaultGroupAttribute[name];
  // }

  /* 场景树结构 */
  incrementalAppendChild(node: INode): INode | null {
    const data = super.appendChild(node);
    if (this.stage && data) {
      (data as unknown as this).stage = this.stage;
      (data as unknown as this).layer = this.layer;
    }
    this.addUpdateBoundTag();
    graphicService.onAddIncremental(node as unknown as IGraphic, this, this.stage);
    return data;
  }
  incrementalClearChild(): void {
    super.removeAllChild();
    this.addUpdateBoundTag();
    graphicService.onClearIncremental(this, this.stage);
    return;
  }

  appendChild(node: INode, addStage: boolean = true): INode | null {
    const data = super.appendChild(node);
    if (addStage && this.stage && data) {
      (data as unknown as this).setStage(this.stage, this.layer);
    }
    this.addUpdateBoundTag();
    return data;
  }
  insertBefore(newNode: INode, referenceNode: INode): INode | null {
    const data = super.insertBefore(newNode, referenceNode);
    if (this.stage && data) {
      (data as unknown as this).setStage(this.stage, this.layer);
    }
    this.addUpdateBoundTag();
    return data;
  }
  insertAfter(newNode: INode, referenceNode: INode): INode | null {
    const data = super.insertAfter(newNode, referenceNode);
    if (this.stage && data) {
      (data as unknown as this).setStage(this.stage, this.layer);
    }
    this.addUpdateBoundTag();
    return data;
  }
  insertInto(newNode: INode, idx: number): INode | null {
    const data = super.insertInto(newNode, idx);
    if (this.stage && data) {
      (data as unknown as this).setStage(this.stage, this.layer);
    }
    this.addUpdateBoundTag();
    return data;
  }

  removeChild(child: IGraphic): IGraphic {
    const data = super.removeChild(child);
    child.stage = null;
    graphicService.onRemove(child);
    this.addUpdateBoundTag();
    return data as IGraphic;
  }

  removeAllChild(): void {
    this.forEachChildren((child: IGraphic) => {
      graphicService.onRemove(child);
    });
    super.removeAllChild();
    this.addUpdateBoundTag();
  }

  setStage(stage?: IStage, layer?: ILayer) {
    if (this.stage !== stage) {
      this.stage = stage;
      this.layer = layer;
      this.setStageToShadowRoot(stage, layer);
      this._onSetStage && this._onSetStage(this, stage, layer);
      graphicService.onSetStage(this, stage);
      this.forEachChildren(item => {
        (item as any).setStage(stage, this.layer);
      });
    }
  }
  /**
   * 更新位置tag，包括全局tag和局部tag
   */
  addUpdatePositionTag() {
    super.addUpdatePositionTag();
    // 批量设置底层group的global tag
    this.forEachChildren((g: Group) => {
      if (g.isContainer) {
        g.addUpdateGlobalPositionTag();
      }
    });
  }
  /**
   * 更新全局位置tag
   */
  addUpdateGlobalPositionTag() {
    super.addUpdateGlobalPositionTag();
    // 批量设置底层group的global tag
    this.forEachChildren((g: Group) => {
      if (g.isContainer) {
        g.addUpdateGlobalPositionTag();
      }
    });
  }
  /**
   * group更新全局的transMatrix
   * @param clearTag
   * @returns
   */
  protected tryUpdateGlobalTransMatrix(clearTag: boolean = true): Matrix {
    if (this.shouldUpdateGlobalMatrix()) {
      if (!this._globalTransMatrix) {
        this._globalTransMatrix = this.parent
          ? (this.parent as IGroup).globalTransMatrix.clone()
          : this.transMatrix.clone();
      } else if (this.parent) {
        const m = (this.parent as IGroup).globalTransMatrix;
        this._globalTransMatrix.setValue(m.a, m.b, m.c, m.d, m.e, m.f);
      }
      this.doUpdateGlobalMatrix();
      clearTag && this.clearUpdateGlobalPositionTag();
    }
    return this._globalTransMatrix;
  }
  /**
   * 查找自身更新global的tag，如果存在，就更新
   * @returns
   */
  shouldUpdateGlobalMatrix(): boolean {
    const shouldUpdate = !!(this._updateTag & UpdateTag.UPDATE_GLOBAL_MATRIX);
    return shouldUpdate;
  }

  private _getChildByName<T extends INode = INode>(name: string, deep?: boolean): T | null {
    return this.find(node => node.name === name, deep);
  }

  /**
   * if graphic exist then update attributes, otherwise create a new instance
   * @param graphicName the name of graphic
   * @param attributes the attributes of graphic
   * @param graphicType the type of graphic
   * @returns the graphic instance
   */
  createOrUpdateChild<T extends keyof GraphicAttributeMap>(
    graphicName: string,
    attributes: GraphicAttributeMap[T],
    graphicType: T
  ): INode {
    let graphic = this._getChildByName(graphicName) as IGraphic;
    if (graphic) {
      graphic.setAttributes(attributes);
    } else {
      graphic = graphicService.creator[graphicType](attributes as any);
      graphic.name = graphicName;
      this.add(graphic);
    }

    return graphic;
  }

  clone() {
    return new Group({ ...this.attribute });
  }
}
