/**
 * @description PopTip组件
 */
import {
  createGroup,
  INode,
  matrixAllocate,
  type IGraphic,
  type IGroup,
  type IGroupGraphicAttribute,
  type IRect,
  type IRectGraphicAttribute,
  type ISymbol,
  type ISymbolGraphicAttribute,
  type IText,
  type ITextGraphicAttribute,
  type TextAlignType,
  type TextBaselineType,
  type ILineGraphicAttribute
} from '@visactor/vrender';
import {
  AABBBounds,
  Bounds,
  IAABBBounds,
  IMatrix,
  Matrix,
  getRectIntersect,
  isArray,
  isBoolean,
  isEmpty,
  isValid,
  max,
  merge,
  normalizePadding,
  pi,
  rectInsideAnotherRect
} from '@visactor/vutils';
import { AbstractComponent } from '@visactor/vrender-components';

type TransformAttributes = {
  padding: number | [number, number, number, number];
  bbox: Partial<IRectGraphicAttribute>;
  cornerRect: Partial<IRectGraphicAttribute>;
  handlerLine: Partial<ILineGraphicAttribute> & { size: number };
} & IGroupGraphicAttribute;

const defaultAttribute = {};

const _tempBounds = new AABBBounds();

export class TranformComponent extends AbstractComponent<Required<TransformAttributes>> {
  name = 'transform';
  subGraphicB: IAABBBounds;
  containerB: IAABBBounds;
  dragOffsetX: number;
  dragOffsetY: number;
  activeGraphic: IGraphic | null;
  horizontalResizble: number;
  verticalResizble: number;
  rotatable: number;
  // 是否正在执行addChildUpdateBoundTag，避免循环调用
  runningAddChildUpdateBoundTag: boolean;

  static defaultAttributes: Partial<TransformAttributes> = {
    padding: 2,
    bbox: {
      stroke: 'lightblue',
      lineWidth: 1
    },
    cornerRect: {
      fill: 'white',
      stroke: 'lightblue',
      lineWidth: 1,
      width: 10,
      height: 10
    },
    handlerLine: {
      stroke: 'lightblue',
      lineWidth: 1,
      size: 30
    }
  };

  constructor(attributes: TransformAttributes) {
    super(
      merge(
        {
          shadowRootIdx: 1
        },
        TranformComponent.defaultAttributes,
        attributes
      )
    );
    this.attachShadow();
    this.subGraphicB = new AABBBounds();
    this.containerB = new AABBBounds();

    this.initEvent();
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.activeGraphic = null;
    this.horizontalResizble = 0;
    this.verticalResizble = 0;
    this.rotatable = 0;
    this.runningAddChildUpdateBoundTag = false;
    this.add(createGroup({}));
  }

  wrap(graphic: IGraphic) {
    this._firstChild?.add(graphic);
  }

  unwrap(graphic: IGraphic) {
    this._firstChild?.removeChild(graphic);
  }

  protected initEvent() {
    // curser
    this.addEventListener('mousemove', this.handleMouseMove);
    this.addEventListener('mouseout', this.handleMouseOut);

    // drag
    this.addEventListener('mousedown', this.handleMouseDown);
    // this.addEventListener('drag', this.onDrag);
  }

  protected handleMouseMove = (e: any) => {
    if (e.pickParams) {
      const { shadowTarget } = e.pickParams;
      this.setCursor(shadowTarget.attribute.cursor);
    } else {
      this.setCursor();
    }
  };

  protected handleMouseOut = (e: any) => {
    this.setCursor();
  };

  protected setCursor(c?: string) {
    if (this.stage) {
      this.stage.setCursor(c);
    }
  }

  protected setActiveGraphic(g: IGraphic | null) {
    this.activeGraphic = g;

    // 设置resize的方向
    let reset = true;
    if (g && g.name) {
      reset = false;
      const name = g.name;
      const dirList = name.split('-');
      const type = dirList.shift();
      if (type === 'scale') {
        if (dirList.length === 2) {
          this.horizontalResizble = dirList[0] === 'left' ? -1 : 1;
          this.verticalResizble = dirList[1] === 'top' ? -1 : 1;
        } else {
          const dir = dirList[0];
          const h = dir === 'left' || dir === 'right';
          this.horizontalResizble = h ? (dirList[0] === 'left' ? -1 : 1) : 0;
          this.verticalResizble = h ? 0 : dirList[0] === 'top' ? -1 : 1;
        }
        this.rotatable = 0;
      } else if (type === 'rotate') {
        this.rotatable = 1;
        this.horizontalResizble = 0;
        this.verticalResizble = 0;
      } else {
        reset = true;
      }
    }
    if (reset) {
      this.horizontalResizble = 0;
      this.verticalResizble = 0;
      this.rotatable = 0;
    }
  }

  handleScale(dx: number, dy: number) {
    const container = this._firstChild as IGroup;
    if (!container) {
      return;
    }
    // 投影得到真实的dx和dy
    const angle = this.getAngle();
    const _dx = dx;
    const _dy = dy;
    dx = Math.cos(angle) * _dx + Math.sin(angle) * _dy;
    dy = Math.cos(angle + pi / 2) * _dx + Math.sin(angle + pi / 2) * _dy;
    const originB = this.containerB;
    const originW = originB.width();
    const originH = originB.height();
    const dScaleX = (this.horizontalResizble * dx) / originW;
    const dScaleY = (this.verticalResizble * dy) / originH;

    container.scale(1 + dScaleX, 1 + dScaleY, {
      x: this.horizontalResizble > 0 ? originB.x1 : originB.x2,
      y: this.verticalResizble > 0 ? originB.y1 : originB.y2
    });
  }

  getAngle(): number {
    const m = this.attribute.postMatrix;
    if (!m) {
      return 0;
    }
    return Math.atan2(m.b, m.a);
  }

  handleRotate(dx: number, dy: number) {
    const container = this._firstChild as IGroup;
    if (!container) {
      return;
    }
    const dir1 = [0, -1];
    const m = this.attribute.postMatrix;
    if (m) {
      dir1[0] = -m.c;
      dir1[1] = -m.d;
    }
    let len = Math.sqrt(dir1[0] * dir1[0] + dir1[1] * dir1[1]);
    dir1[0] /= len;
    dir1[1] /= len;
    const dir1v = [-dir1[1], dir1[0]];

    const dir2 = [dx, dy];
    len = Math.sqrt(dx * dx + dy * dy);
    dir2[0] /= len;
    dir2[1] /= len;
    // 点积算delta
    let deltaAngle = dir1v[0] * dir2[0] + dir1v[1] * dir2[1];

    const a = deltaAngle * 0.04;
    const originB = this.containerB;
    let cx = (originB.x1 + originB.x2) / 2;
    let cy = (originB.y1 + originB.y2) / 2;

    // 转化到m的坐标系中
    if (m) {
      const _x = cx;
      const _y = cy;
      cx = m.a * _x + m.c * _y + m.e;
      cy = m.b * _x + m.d * _y + m.f;
    }
    this.rotate(a, {
      x: cx,
      y: cy
    });
  }

  handleTranslate(dx: number, dy: number) {
    const container = this._firstChild as IGroup;
    if (!container) {
      return;
    }
    if (this.attribute.postMatrix) {
      this.translate(dx, dy);
    } else {
      container.translate(dx, dy);
    }
  }

  protected handleMouseDown = (e: any) => {
    this.dragOffsetX = e.offset.x;
    this.dragOffsetY = e.offset.y;

    const _handleMouseMove = (e: any, cb: (e: any, dx: number, dy: number) => void) => {
      const dx = e.offset.x - this.dragOffsetX;
      const dy = e.offset.y - this.dragOffsetY;

      if (dx === 0 && dy === 0) {
        return;
      }

      cb(e, dx, dy);

      this.dragOffsetX = e.offset.x;
      this.dragOffsetY = e.offset.y;
    };

    // 开启move
    if (e.pickParams && this.stage) {
      const { shadowTarget } = e.pickParams || {};
      this.setActiveGraphic(shadowTarget);
      const handleMouseMove = (e: any) => {
        _handleMouseMove(e, (e, dx, dy) => {
          if (this.rotatable) {
            this.handleRotate(dx, dy);
          } else {
            this.handleScale(dx, dy);
          }
        });
      };
      const handleMouseup = () => {
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.setActiveGraphic(null);
        this.stage && this.stage.removeEventListener('mousemove', handleMouseMove);
      };
      this.stage.addEventListener('mousemove', handleMouseMove);
      this.stage.addEventListener('mouseup', handleMouseup, { once: true });
    } else {
      if (e.target !== this._firstChild) {
        const handleMouseMove = (e: any) => {
          _handleMouseMove(e, (e, dx, dy) => {
            this.handleTranslate(dx, dy);
          });
        };
        const handleMouseup = () => {
          this.dragOffsetX = 0;
          this.dragOffsetY = 0;
          this.setActiveGraphic(null);
          this.stage && this.stage.removeEventListener('mousemove', handleMouseMove);
        };
        this.stage.addEventListener('mousemove', handleMouseMove);
        this.stage.addEventListener('mouseup', handleMouseup, { once: true });
      }
    }
  };

  protected onMouseUp = (e: any) => {};

  static cornerRect: Array<[number, number, string]> = [
    [0, 0, 'left-top'],
    [0.5, 0, 'top'],
    [1, 0, 'right-top'],
    [0, 0.5, 'left'],
    [1, 0.5, 'right'],
    [0, 1, 'left-bottom'],
    [0.5, 1, 'bottom'],
    [1, 1, 'right-bottom']
  ];
  static cursor: string[] = [
    'nw-resize',
    'n-resize',
    'ne-resize',
    'w-resize',
    'e-resize',
    'sw-resize',
    's-resize',
    'se-resize'
  ];

  protected render() {
    const { bbox, padding, cornerRect, handlerLine } = this.attribute as TransformAttributes;

    const root = this.shadowRoot;
    if (!root || this.count === 1) {
      return;
    }
    const container = this._firstChild as IGroup;
    this.containerB.copy(container.AABBBounds);
    const subGraphicB = this.subGraphicB;
    subGraphicB.clear();
    container.forEachChildren((g: any) => {
      subGraphicB.union(g.AABBBounds);
    });
    const parsedPadding = normalizePadding(padding as any);

    const minX = this.containerB.x1 - parsedPadding[3];
    const minY = this.containerB.y1 - parsedPadding[0];
    const width = this.containerB.width() + parsedPadding[1] + parsedPadding[3];
    const height = this.containerB.height() + parsedPadding[0] + parsedPadding[2];

    root.createOrUpdateChild(
      'stroke-rect',
      {
        x: minX,
        y: minY,
        width,
        height,
        ...bbox
      },
      'rect'
    );

    // 添加顶部
    root.createOrUpdateChild(
      'top-handler-line',
      {
        x: minX + width / 2,
        y: minY,
        points: [
          { x: 0, y: 0 },
          { x: 0, y: -handlerLine.size }
        ],
        ...handlerLine
      },
      'line'
    );

    root.createOrUpdateChild(
      `rotate-all`,
      {
        x: minX + width / 2 - cornerRect.width! / 2,
        y: minY - handlerLine.size - cornerRect.height! / 2,
        cursor: 'crosshair',
        ...cornerRect
      },
      'rect'
    );

    // 添加8个角
    TranformComponent.cornerRect.forEach((item, i) => {
      root.createOrUpdateChild(
        `scale-${item[2]}`,
        {
          x: minX + item[0] * width - cornerRect.width! / 2,
          y: minY + item[1] * height - cornerRect.height! / 2,
          cursor: TranformComponent.cursor[i] as any,
          ...cornerRect
        },
        'rect'
      );
    });
  }

  addChildUpdateBoundTag() {
    super.addChildUpdateBoundTag();

    // 如果wrap内的内容bounds变化，那就需要重新调用render
    if (this.runningAddChildUpdateBoundTag) {
      return;
    }
    this.runningAddChildUpdateBoundTag = true;
    const container = this._firstChild as IGroup;
    if (!container) {
      return;
    }
    _tempBounds.clear();
    container.forEachChildren((g: any) => {
      _tempBounds.union(g.AABBBounds);
    });
    if (!this.containerB.equals(container.AABBBounds)) {
      this.render();
    }
    this.runningAddChildUpdateBoundTag = false;
  }
}
