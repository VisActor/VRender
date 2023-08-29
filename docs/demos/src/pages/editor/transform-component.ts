/**
 * @description PopTip组件
 */
import {
  createGroup,
  INode,
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
          this.verticalResizble = h ? 0 : dirList[1] === 'top' ? -1 : 1;
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

  protected handleMouseDown = (e: any) => {
    this.dragOffsetX = e.offset.x;
    this.dragOffsetY = e.offset.y;

    // 开启move
    if (e.pickParams && this.stage) {
      const { shadowTarget } = e.pickParams || {};
      this.setActiveGraphic(shadowTarget);
      const handleMouseMove = (e: any) => {
        const container = this._firstChild as IGroup;
        if (!container) {
          return;
        }
        const dx = e.offset.x - this.dragOffsetX;
        const dy = e.offset.y - this.dragOffsetY;

        // 计算总共需要scale的大小
        // const totalB = this.AABBBounds;
        // const totalW = totalB.width();
        // const totalH = totalB.height();
        const originB = this.subGraphicB;
        const originW = originB.width();
        const originH = originB.height();
        const dScaleX = (this.horizontalResizble * dx) / originW;
        const dScaleY = (this.verticalResizble * dy) / originH;
        const angle = container.attribute.angle ?? (Math.PI / 2) * 3;
        const dir1 = [Math.cos(angle), Math.sin(angle), 0];
        const dir2 = [dx, dy, 0];
        const len = Math.sqrt(dx * dx + dy * dy);
        dir2[0] /= len;
        dir2[1] /= len;
        // 点积算delta
        let deltaAngle = Math.abs(dir1[0] * dir2[0] + dir1[1] * dir2[1]);
        // 叉积算方向
        let dir = dir1[0] * dir2[1] - dir1[1] * dir2[0] > 0 ? 1 : -1;
        container.setAttributes({
          scaleX: (container.attribute.scaleX ?? 1) + dScaleX,
          scaleY: (container.attribute.scaleY ?? 1) + dScaleY,
          angle: (container.attribute.angle ?? 0) + this.rotatable * dir * deltaAngle * 0.01
        });
        // console.log(container.attribute.scaleX, dScaleX);
        // const targetW = totalW + dx;
        // const targetH = totalH + dy;
        // const scaleX = targetW / originW;
        // const scaleY = targetH / originH;
        // console.log(scaleX, scaleY);
        // this.scaleTo(scaleX, scaleY);

        this.dragOffsetX = e.offset.x;
        this.dragOffsetY = e.offset.y;
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
