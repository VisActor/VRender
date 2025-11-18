import type { DataZoomAttributes } from './type';
import type { IBoundsLike, IPointLike } from '@visactor/vutils';
import { flatten_simplify } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import type { IArea, IGroup, ILine, IRect, ISymbol, INode } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { Bounds, isFunction, merge } from '@visactor/vutils';
import { Tag, type TagAttributes } from '../tag';
import { DEFAULT_HANDLER_ATTR_MAP } from './config';
import { isTextOverflow } from './utils';
export interface DataZoomRendererAttrs {
  attribute: Partial<Required<DataZoomAttributes>>;
  getLayoutAttrFromConfig: any;
  getState: () => { start: number; end: number };
  setState: (state: { start: number; end: number }) => void;
  getContainer: () => IGroup;
}
export class DataZoomRenderer {
  /** 上层透传 */
  attribute: Partial<Required<DataZoomAttributes>>;
  private _getLayoutAttrFromConfig: any;
  private _getState: () => { start: number; end: number };
  private _getContainer: () => IGroup;

  /** 中间变量 */
  private _isHorizontal: boolean;

  /** 手柄 */
  private _startHandlerMask!: IRect;
  get startHandlerMask() {
    return this._startHandlerMask;
  }
  private _startHandler!: ISymbol;
  private _middleHandlerSymbol!: ISymbol;
  get middleHandlerSymbol() {
    return this._middleHandlerSymbol;
  }
  private _middleHandlerRect!: IRect;
  get middleHandlerRect() {
    return this._middleHandlerRect;
  }
  private _endHandlerMask!: IRect;
  get endHandlerMask() {
    return this._endHandlerMask;
  }
  private _endHandler!: ISymbol;
  private _selectedBackground!: IRect;
  get selectedBackground() {
    return this._selectedBackground;
  }
  private _dragMask!: IRect;
  get dragMask() {
    return this._dragMask;
  }
  private _startText!: Tag;
  get startText() {
    return this._startText;
  }
  private _endText!: Tag;
  get endText() {
    return this._endText;
  }
  private _startValue!: string | number;
  get startValue() {
    return this._startValue;
  }
  private _endValue!: string | number;
  get endValue() {
    return this._endValue;
  }
  private _showText!: boolean;
  set showText(showText: boolean) {
    this._showText = showText;
  }

  /** 背景图表 */
  private _background!: IRect;
  get background() {
    return this._background;
  }
  private _previewData: any[] = [];
  set previewData(previewData: any[]) {
    this._previewData = previewData;
  }
  private _previewGroup!: IGroup;
  get previewGroup() {
    return this._previewGroup;
  }
  private _previewLine!: ILine;
  private _previewArea!: IArea;
  private _selectedPreviewGroupClip!: IGroup;
  private _selectedPreviewGroup!: IGroup;
  get selectedPreviewGroup() {
    return this._selectedPreviewGroup;
  }
  private _selectedPreviewLine!: ILine;
  private _selectedPreviewArea!: IArea;

  /** 回调函数 */
  private _previewPointsX!: (datum: any) => number;
  set previewPointsX(previewPointsX: (datum: any) => number) {
    this._previewPointsX = previewPointsX;
  }
  private _previewPointsY!: (datum: any) => number;
  set previewPointsY(previewPointsY: (datum: any) => number) {
    this._previewPointsY = previewPointsY;
  }
  private _previewPointsX1!: (datum: any) => number;
  set previewPointsX1(previewPointsX1: (datum: any) => number) {
    this._previewPointsX1 = previewPointsX1;
  }
  private _previewPointsY1!: (datum: any) => number;
  set previewPointsY1(previewPointsY1: (datum: any) => number) {
    this._previewPointsY1 = previewPointsY1;
  }
  private _statePointToData: (state: number) => any = state => state;
  set statePointToData(statePointToData: (state: number) => any) {
    this._statePointToData = statePointToData;
  }

  private _initAttrs(props: DataZoomRendererAttrs) {
    this.attribute = props.attribute;
    this._isHorizontal = this.attribute.orient === 'top' || this.attribute.orient === 'bottom';
    const { previewData, previewPointsX, previewPointsY, previewPointsX1, previewPointsY1 } = this
      .attribute as DataZoomAttributes;

    previewData && (this._previewData = previewData);
    isFunction(previewPointsX) && (this._previewPointsX = previewPointsX);
    isFunction(previewPointsY) && (this._previewPointsY = previewPointsY);
    isFunction(previewPointsX1) && (this._previewPointsX1 = previewPointsX1);
    isFunction(previewPointsY1) && (this._previewPointsY1 = previewPointsY1);
    this._getState = props.getState;
    this._getLayoutAttrFromConfig = props.getLayoutAttrFromConfig;
    this._getContainer = props.getContainer;
  }

  constructor(props: DataZoomRendererAttrs) {
    const { showDetail } = props.attribute as DataZoomAttributes;
    this._showText = showDetail === 'auto' ? false : showDetail;
    this._initAttrs(props);
  }

  setAttributes(props: DataZoomRendererAttrs): void {
    this._initAttrs(props);
  }

  renderDataZoom(onlyStateChange: boolean = false) {
    const {
      backgroundChartStyle = {},
      selectedBackgroundChartStyle = {},
      brushSelect
    } = this.attribute as DataZoomAttributes;

    this._renderBackground();

    /** 背景图表 */
    backgroundChartStyle.line?.visible && !onlyStateChange && this._setPreviewAttributes('line', this._getContainer());
    backgroundChartStyle.area?.visible && !onlyStateChange && this._setPreviewAttributes('area', this._getContainer());

    /** 背景选框 */
    brushSelect && this.renderDragMask();

    /** 选中背景 */
    this._renderSelectedBackground();

    /** 选中的背景图表 */
    selectedBackgroundChartStyle.line?.visible && this._setSelectedPreviewClipAttributes('line', this._getContainer());
    selectedBackgroundChartStyle.line?.visible && !onlyStateChange && this._setSelectedPreviewAttributes('line');

    selectedBackgroundChartStyle.line?.visible && this._setSelectedPreviewClipAttributes('area', this._getContainer());
    selectedBackgroundChartStyle.area?.visible && !onlyStateChange && this._setSelectedPreviewAttributes('area');

    /** 左右 和 中间手柄 */
    this._renderHandler();

    /** 左右文字 */
    if (this._showText) {
      this.renderText();
    }
  }

  /**
   * @description 渲染拖拽mask
   */
  renderDragMask() {
    const { dragMaskStyle } = this.attribute as DataZoomAttributes;
    const { position, width, height } = this._getLayoutAttrFromConfig();
    const { start, end } = this._getState();
    if (this._isHorizontal) {
      this._dragMask = this._getContainer().createOrUpdateChild(
        'dragMask',
        {
          x: position.x + start * width,
          y: position.y,
          width: (end - start) * width,
          height: height,
          ...dragMaskStyle
        },
        'rect'
      ) as IRect;
    } else {
      this._dragMask = this._getContainer().createOrUpdateChild(
        'dragMask',
        {
          x: position.x,
          y: position.y + start * height,
          width,
          height: (end - start) * height,
          ...dragMaskStyle
        },
        'rect'
      ) as IRect;
    }
    return { start, end };
  }

  /**
   * @description 渲染背景
   */
  private _renderBackground() {
    const { backgroundStyle, brushSelect, zoomLock } = this.attribute as DataZoomAttributes;
    const { position, width, height } = this._getLayoutAttrFromConfig();
    const group = this._getContainer();
    this._background = group.createOrUpdateChild(
      'background',
      {
        x: position.x,
        y: position.y,
        width,
        height,
        cursor: brushSelect ? 'crosshair' : 'auto',
        ...backgroundStyle,
        pickable: zoomLock ? false : backgroundStyle.pickable ?? true
      },
      'rect'
    ) as IRect;
  }
  /**
   * @description 渲染手柄
   */
  private _renderHandler() {
    const {
      orient,
      middleHandlerStyle = {},
      startHandlerStyle = {},
      endHandlerStyle = {},
      zoomLock
    } = this.attribute as DataZoomAttributes;
    const { start, end } = this._getState();

    const { position, width, height } = this._getLayoutAttrFromConfig();
    const startHandlerMinSize = startHandlerStyle.triggerMinSize ?? 40;
    const endHandlerMinSize = endHandlerStyle.triggerMinSize ?? 40;

    const group = this._getContainer();
    if (this._isHorizontal) {
      if (middleHandlerStyle.visible) {
        const middleHandlerBackgroundSize = middleHandlerStyle.background?.size || 10;
        this._middleHandlerRect = group.createOrUpdateChild(
          'middleHandlerRect',
          {
            x: position.x + start * width,
            y: position.y - middleHandlerBackgroundSize,
            width: (end - start) * width,
            height: middleHandlerBackgroundSize,
            ...middleHandlerStyle.background?.style,
            pickable: zoomLock ? false : middleHandlerStyle.background?.style?.pickable ?? true
          },
          'rect'
        ) as IRect;
        this._middleHandlerSymbol = group.createOrUpdateChild(
          'middleHandlerSymbol',
          {
            x: position.x + ((start + end) / 2) * width,
            y: position.y - middleHandlerBackgroundSize / 2,
            strokeBoundsBuffer: 0,
            angle: 0,
            symbolType: middleHandlerStyle.icon?.symbolType ?? 'square',
            ...middleHandlerStyle.icon,
            pickable: zoomLock ? false : middleHandlerStyle.icon.pickable ?? true
          },
          'symbol'
        ) as ISymbol;
      }
      this._startHandler = group.createOrUpdateChild(
        'startHandler',
        {
          x: position.x + start * width,
          y: position.y + height / 2,
          size: height,
          symbolType: startHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          ...startHandlerStyle,
          pickable: zoomLock ? false : startHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;
      this._endHandler = group.createOrUpdateChild(
        'endHandler',
        {
          x: position.x + end * width,
          y: position.y + height / 2,
          size: height,
          symbolType: endHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          ...endHandlerStyle,
          pickable: zoomLock ? false : endHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;

      // 透明mask构造热区, 热区大小配置来自handler bounds
      const startHandlerWidth = Math.max(this._startHandler.AABBBounds.width(), startHandlerMinSize);
      const startHandlerHeight = Math.max(this._startHandler.AABBBounds.height(), startHandlerMinSize);
      const endHandlerWidth = Math.max(this._endHandler.AABBBounds.width(), endHandlerMinSize);
      const endHandlerHeight = Math.max(this._endHandler.AABBBounds.height(), endHandlerMinSize);

      this._startHandlerMask = group.createOrUpdateChild(
        'startHandlerMask',
        {
          x: position.x + start * width - startHandlerWidth / 2,
          y: position.y + height / 2 - startHandlerHeight / 2,
          width: startHandlerWidth,
          height: startHandlerHeight,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
      this._endHandlerMask = group.createOrUpdateChild(
        'endHandlerMask',
        {
          x: position.x + end * width - endHandlerWidth / 2,
          y: position.y + height / 2 - endHandlerHeight / 2,
          width: endHandlerWidth,
          height: endHandlerHeight,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
    } else {
      if (middleHandlerStyle.visible) {
        const middleHandlerBackgroundSize = middleHandlerStyle.background?.size || 10;

        this._middleHandlerRect = group.createOrUpdateChild(
          'middleHandlerRect',
          {
            x: orient === 'left' ? position.x - middleHandlerBackgroundSize : position.x + width,
            y: position.y + start * height,
            width: middleHandlerBackgroundSize,
            height: (end - start) * height,
            ...middleHandlerStyle.background?.style,
            pickable: zoomLock ? false : middleHandlerStyle.background?.style?.pickable ?? true
          },
          'rect'
        ) as IRect;
        this._middleHandlerSymbol = group.createOrUpdateChild(
          'middleHandlerSymbol',
          {
            x:
              orient === 'left'
                ? position.x - middleHandlerBackgroundSize / 2
                : position.x + width + middleHandlerBackgroundSize / 2,
            y: position.y + ((start + end) / 2) * height,
            // size: height,
            angle: 90 * (Math.PI / 180),
            symbolType: middleHandlerStyle.icon?.symbolType ?? 'square',
            strokeBoundsBuffer: 0,
            ...middleHandlerStyle.icon,
            pickable: zoomLock ? false : middleHandlerStyle.icon?.pickable ?? true
          },
          'symbol'
        ) as ISymbol;
      }
      this._startHandler = group.createOrUpdateChild(
        'startHandler',
        {
          x: position.x + width / 2,
          y: position.y + start * height,
          size: width,
          symbolType: startHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          ...startHandlerStyle,
          pickable: zoomLock ? false : startHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;

      this._endHandler = group.createOrUpdateChild(
        'endHandler',
        {
          x: position.x + width / 2,
          y: position.y + end * height,
          size: width,
          symbolType: endHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          ...endHandlerStyle,
          pickable: zoomLock ? false : endHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;

      // 透明mask构造热区, 热区大小配置来自handler bounds
      const startHandlerWidth = Math.max(this._startHandler.AABBBounds.width(), startHandlerMinSize);
      const startHandlerHeight = Math.max(this._startHandler.AABBBounds.height(), startHandlerMinSize);
      const endHandlerWidth = Math.max(this._endHandler.AABBBounds.width(), endHandlerMinSize);
      const endHandlerHeight = Math.max(this._endHandler.AABBBounds.height(), endHandlerMinSize);

      this._startHandlerMask = group.createOrUpdateChild(
        'startHandlerMask',
        {
          x: position.x + width / 2 + startHandlerWidth / 2,
          y: position.y + start * height - startHandlerHeight / 2,
          width: endHandlerHeight,
          height: endHandlerWidth,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
      this._endHandlerMask = group.createOrUpdateChild(
        'endHandlerMask',
        {
          x: position.x + width / 2 + endHandlerWidth / 2,
          y: position.y + end * height - endHandlerHeight / 2,
          width: endHandlerHeight,
          height: endHandlerWidth,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
    }
  }

  /**
   * @description 渲染选中背景
   */
  private _renderSelectedBackground() {
    const {
      selectedBackgroundStyle = {},
      selectedBackgroundChartStyle = {},
      brushSelect,
      zoomLock
    } = this.attribute as DataZoomAttributes;
    const { start, end } = this._getState();

    const { position, width, height } = this._getLayoutAttrFromConfig();

    const group = this._getContainer();
    if (this._isHorizontal) {
      // 选中部分
      this._selectedBackground = group.createOrUpdateChild(
        'selectedBackground',
        {
          x: position.x + start * width,
          y: position.y,
          width: (end - start) * width,
          height: height,
          cursor: brushSelect ? 'crosshair' : 'move',
          ...selectedBackgroundStyle,
          pickable: zoomLock ? false : (selectedBackgroundChartStyle as any).pickable ?? true
        },
        'rect'
      ) as IRect;
    } else {
      // 选中部分
      this._selectedBackground = group.createOrUpdateChild(
        'selectedBackground',
        {
          x: position.x,
          y: position.y + start * height,
          width,
          height: (end - start) * height,
          cursor: brushSelect ? 'crosshair' : 'move',
          ...selectedBackgroundStyle,
          pickable: zoomLock ? false : selectedBackgroundStyle.pickable ?? true
        },
        'rect'
      ) as IRect;
    }
  }

  // 使用callback绘制背景图表 (数据和数据映射从外部传进来)
  private _setPreviewAttributes(type: 'line' | 'area', group: IGroup) {
    if (!this._previewGroup) {
      this._previewGroup = group.createOrUpdateChild('previewGroup', { pickable: false }, 'group') as IGroup;
    }
    if (type === 'line') {
      this._previewLine = this._previewGroup.createOrUpdateChild('previewLine', {}, 'line') as ILine;
    } else {
      this._previewArea = this._previewGroup.createOrUpdateChild(
        'previewArea',
        { curveType: 'basis' },
        'area'
      ) as IArea;
    }

    const { backgroundChartStyle = {} } = this.attribute as DataZoomAttributes;

    type === 'line' &&
      this._previewLine.setAttributes({
        points: this._getPreviewLinePoints(),
        curveType: 'basis',
        pickable: false,
        ...backgroundChartStyle.line
      });
    type === 'area' &&
      this._previewArea.setAttributes({
        points: this._getPreviewAreaPoints(),
        curveType: 'basis',
        pickable: false,
        ...backgroundChartStyle.area
      });
  }

  // 使用callback绘制选中的背景图表 (数据和数据映射从外部传进来)
  private _setSelectedPreviewClipAttributes(type: 'area' | 'line', group: IGroup) {
    if (!this._selectedPreviewGroupClip) {
      this._selectedPreviewGroupClip = group.createOrUpdateChild(
        'selectedPreviewGroupClip',
        { pickable: false },
        'group'
      ) as IGroup;
      this._selectedPreviewGroup = this._selectedPreviewGroupClip.createOrUpdateChild(
        'selectedPreviewGroup',
        {},
        'group'
      ) as IGroup;
    }

    const { start, end } = this._getState();
    const { position, width, height } = this._getLayoutAttrFromConfig();
    this._selectedPreviewGroupClip.setAttributes({
      x: this._isHorizontal ? position.x + start * width : position.x,
      y: this._isHorizontal ? position.y : position.y + start * height,
      width: this._isHorizontal ? (end - start) * width : width,
      height: this._isHorizontal ? height : (end - start) * height,
      clip: true,
      pickable: false
    } as any);
    this._selectedPreviewGroup.setAttributes({
      x: -(this._isHorizontal ? position.x + start * width : position.x),
      y: -(this._isHorizontal ? position.y : position.y + start * height),
      width: this._isHorizontal ? (end - start) * width : width,
      height: this._isHorizontal ? height : (end - start) * height,
      pickable: false
    } as any);
  }

  private _setSelectedPreviewAttributes(type: 'line' | 'area') {
    const { selectedBackgroundChartStyle = {} } = this.attribute as DataZoomAttributes;
    if (type === 'line') {
      this._selectedPreviewLine = this._selectedPreviewGroup.createOrUpdateChild(
        'selectedPreviewLine',
        {},
        'line'
      ) as ILine;
    } else {
      this._selectedPreviewArea = this._selectedPreviewGroup.createOrUpdateChild(
        'selectedPreviewArea',
        { curveType: 'basis' },
        'area'
      ) as IArea;
    }
    type === 'line' &&
      this._selectedPreviewLine.setAttributes({
        points: this._getPreviewLinePoints(),
        curveType: 'basis',
        pickable: false,
        ...selectedBackgroundChartStyle.line
      });
    type === 'area' &&
      this._selectedPreviewArea.setAttributes({
        points: this._getPreviewAreaPoints(),
        curveType: 'basis',
        pickable: false,
        ...selectedBackgroundChartStyle.area
      });
  }

  private _computeBasePoints(points: IPointLike[]) {
    const { orient } = this.attribute as DataZoomAttributes;
    const key = orient === 'bottom' || orient === 'top' ? 'x' : 'y';
    let lastPointSide = Math.sign(points[points.length - 1][key] - points[0][key]);
    if (lastPointSide === 0) {
      lastPointSide = 1;
    }
    const { position, width, height } = this._getLayoutAttrFromConfig();
    let basePointStart: any;
    let basePointEnd: any;
    if (this._isHorizontal) {
      basePointStart = [
        {
          x: position.x,
          y: position.y + height
        }
      ];
      basePointEnd = [
        {
          x: position.x + width,
          y: position.y + height
        }
      ];
    } else if (orient === 'left') {
      basePointStart = [
        {
          x: position.x + width,
          y: position.y
        }
      ];
      basePointEnd = [
        {
          x: position.x + width,
          y: position.y + height
        }
      ];
    } else {
      basePointStart = [
        {
          x: position.x,
          y: position.y + height
        }
      ];
      basePointEnd = [
        {
          x: position.x,
          y: position.y
        }
      ];
    }

    if (Math.sign(basePointEnd[0][key] - basePointStart[0][key]) !== lastPointSide) {
      return {
        basePointStart: basePointEnd,
        basePointEnd: basePointStart
      };
    }

    return {
      basePointStart,
      basePointEnd
    };
  }

  private _simplifyPoints(points: IPointLike[]) {
    // 采样压缩率策略: 如果没做任何配置, 那么限制在niceCount内, 如果做了配置, 则按照配置计算
    const niceCount = 10000; // 经验值
    if (points.length > niceCount) {
      const tolerance = this.attribute.tolerance ?? this._previewData.length / niceCount;
      return flatten_simplify(points, tolerance, false);
    }
    return points;
  }

  private _getPreviewLinePoints() {
    let previewPoints = this._previewData.map(d => {
      return {
        x: this._previewPointsX && this._previewPointsX(d),
        y: this._previewPointsY && this._previewPointsY(d)
      };
    });
    // 仅在有数据的时候增加base point, 以弥补背景图表两端的不连续缺口。不然的话没有数据时，会因为base point而仍然绘制图形
    if (previewPoints.length === 0) {
      return previewPoints;
    }

    // 采样
    previewPoints = this._simplifyPoints(previewPoints);

    const { basePointStart, basePointEnd } = this._computeBasePoints(previewPoints);
    return basePointStart.concat(previewPoints).concat(basePointEnd);
  }

  private _getPreviewAreaPoints() {
    let previewPoints: IPointLike[] = this._previewData.map(d => {
      return {
        x: this._previewPointsX && this._previewPointsX(d),
        y: this._previewPointsY && this._previewPointsY(d),
        x1: this._previewPointsX1 && this._previewPointsX1(d),
        y1: this._previewPointsY1 && this._previewPointsY1(d)
      };
    });
    // 仅在有数据的时候增加base point, 以弥补背景图表两端的不连续缺口。不然的话没有数据时，会因为base point而仍然绘制图形
    if (previewPoints.length === 0) {
      return previewPoints;
    }

    // 采样
    previewPoints = this._simplifyPoints(previewPoints);

    const { basePointStart, basePointEnd } = this._computeBasePoints(previewPoints);
    return basePointStart.concat(previewPoints).concat(basePointEnd);
  }

  /**
   * @description 渲染文本
   */
  renderText() {
    let startTextBounds: IBoundsLike | null = null;
    let endTextBounds: IBoundsLike | null = null;

    // 第一次绘制
    this._setTextAttr(startTextBounds, endTextBounds);
    if (this._showText) {
      // 得到bounds
      startTextBounds = this._startText.AABBBounds;
      endTextBounds = this._endText.AABBBounds;

      // 第二次绘制: 将text限制在组件bounds内
      this._setTextAttr(startTextBounds, endTextBounds);
      // 得到bounds
      startTextBounds = this._startText.AABBBounds;
      endTextBounds = this._endText.AABBBounds;
      const { x1, x2, y1, y2 } = startTextBounds;
      const { dx: startTextDx = 0, dy: startTextDy = 0 } = this.attribute.startTextStyle;

      // 第三次绘制: 避免startText和endText重叠, 如果重叠了, 对startText做位置调整(考虑到调整的最小化，只单独调整startText而不调整endText)
      if (new Bounds().set(x1, y1, x2, y2).intersects(endTextBounds)) {
        const direction = this.attribute.orient === 'bottom' || this.attribute.orient === 'right' ? -1 : 1;
        if (this._isHorizontal) {
          this._startText.setAttribute('dy', startTextDy + direction * Math.abs(endTextBounds.y1 - endTextBounds.y2));
        } else {
          this._startText.setAttribute('dx', startTextDx + direction * Math.abs(endTextBounds.x1 - endTextBounds.x2));
        }
      } else {
        if (this._isHorizontal) {
          this._startText.setAttribute('dy', startTextDy);
        } else {
          this._startText.setAttribute('dx', startTextDx);
        }
      }
    }
  }
  private _setTextAttr(startTextBounds: IBoundsLike, endTextBounds: IBoundsLike) {
    const { startTextStyle, endTextStyle } = this.attribute as DataZoomAttributes;
    const { formatMethod: startTextFormat, ...restStartTextStyle } = startTextStyle;
    const { formatMethod: endTextFormat, ...restEndTextStyle } = endTextStyle;
    const { start, end } = this._getState();
    this._startValue = this._statePointToData(start);
    this._endValue = this._statePointToData(end);
    const { position, width, height } = this._getLayoutAttrFromConfig();

    const startTextValue = startTextFormat ? startTextFormat(this._startValue) : this._startValue;
    const endTextValue = endTextFormat ? endTextFormat(this._endValue) : this._endValue;
    const componentBoundsLike = {
      x1: position.x,
      y1: position.y,
      x2: position.x + width,
      y2: position.y + height
    };
    let startTextPosition: IPointLike;
    let endTextPosition: IPointLike;
    let startTextAlignStyle: any;
    let endTextAlignStyle: any;
    if (this._isHorizontal) {
      startTextPosition = {
        x: position.x + start * width,
        y: position.y + height / 2
      };
      endTextPosition = {
        x: position.x + end * width,
        y: position.y + height / 2
      };
      startTextAlignStyle = {
        textAlign: isTextOverflow(componentBoundsLike, startTextBounds, 'start', this._isHorizontal) ? 'left' : 'right',
        textBaseline: restStartTextStyle?.textStyle?.textBaseline ?? 'middle'
      };
      endTextAlignStyle = {
        textAlign: isTextOverflow(componentBoundsLike, endTextBounds, 'end', this._isHorizontal) ? 'right' : 'left',
        textBaseline: restEndTextStyle?.textStyle?.textBaseline ?? 'middle'
      };
    } else {
      startTextPosition = {
        x: position.x + width / 2,
        y: position.y + start * height
      };
      endTextPosition = {
        x: position.x + width / 2,
        y: position.y + end * height
      };
      startTextAlignStyle = {
        textAlign: restStartTextStyle?.textStyle?.textAlign ?? 'center',
        textBaseline: isTextOverflow(componentBoundsLike, startTextBounds, 'start', this._isHorizontal)
          ? 'top'
          : 'bottom'
      };
      endTextAlignStyle = {
        textAlign: restEndTextStyle?.textStyle?.textAlign ?? 'center',
        textBaseline: isTextOverflow(componentBoundsLike, endTextBounds, 'end', this._isHorizontal) ? 'bottom' : 'top'
      };
    }

    this._startText = this._maybeAddLabel(
      this._getContainer(),
      merge({}, restStartTextStyle, {
        text: startTextValue,
        x: startTextPosition.x,
        y: startTextPosition.y,
        visible: this._showText,
        pickable: false,
        childrenPickable: false,
        textStyle: startTextAlignStyle
      }),
      `data-zoom-start-text`
    );
    this._endText = this._maybeAddLabel(
      this._getContainer(),
      merge({}, restEndTextStyle, {
        text: endTextValue,
        x: endTextPosition.x,
        y: endTextPosition.y,
        visible: this._showText,
        pickable: false,
        childrenPickable: false,
        textStyle: endTextAlignStyle
      }),
      `data-zoom-end-text`
    );
  }
  private _maybeAddLabel(container: IGroup, attributes: TagAttributes, name: string): Tag {
    let labelShape = container.find(node => node.name === name, true) as unknown as Tag;
    if (labelShape) {
      labelShape.setAttributes(attributes);
    } else {
      labelShape = new Tag(attributes);
      labelShape.name = name;
      container.add(labelShape as unknown as INode);
    }

    return labelShape;
  }
}
