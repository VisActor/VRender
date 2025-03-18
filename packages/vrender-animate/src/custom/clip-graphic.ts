import type { IArcGraphicAttribute, IGraphic, IGroup, IRectGraphicAttribute } from '@visactor/vrender-core';
import { application, AttributeUpdateType } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import type { EasingType } from '../intreface/easing';

export class ClipGraphicAnimate extends ACustomAnimate<any> {
  private _group?: IGroup;
  private _clipGraphic?: IGraphic;
  protected clipFromAttribute?: any;
  protected clipToAttribute?: any;

  private _lastClip?: boolean;
  private _lastPath?: IGraphic[];

  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: { group: IGroup; clipGraphic: IGraphic }
  ) {
    super(null, null, duration, easing, params);
    this.clipFromAttribute = from;
    this.clipToAttribute = to;
    this._group = params?.group;
    this._clipGraphic = params?.clipGraphic;
  }

  onBind() {
    if (this._group && this._clipGraphic) {
      this._lastClip = this._group.attribute.clip;
      this._lastPath = this._group.attribute.path;
      this._group.setAttributes(
        {
          clip: true,
          path: [this._clipGraphic]
        },
        false,
        { type: AttributeUpdateType.ANIMATE_BIND }
      );
    }
  }

  onEnd() {
    if (this._group) {
      this._group.setAttributes(
        {
          clip: this._lastClip,
          path: this._lastPath
        },
        false,
        { type: AttributeUpdateType.ANIMATE_END }
      );
    }
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this._clipGraphic) {
      return;
    }
    const res: any = {};
    Object.keys(this.clipFromAttribute).forEach(k => {
      res[k] = this.clipFromAttribute[k] + (this.clipToAttribute[k] - this.clipFromAttribute[k]) * ratio;
    });
    this._clipGraphic.setAttributes(res, false, {
      type: AttributeUpdateType.ANIMATE_UPDATE,
      animationState: { ratio, end }
    });
  }
}

export class ClipAngleAnimate extends ClipGraphicAnimate {
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: {
      group: IGroup;
      center?: { x: number; y: number };
      startAngle?: number;
      radius?: number;
      orient?: 'clockwise' | 'anticlockwise';
      animationType?: 'in' | 'out';
    }
  ) {
    const groupAttribute = params?.group?.attribute ?? {};
    const width = groupAttribute.width ?? 0;
    const height = groupAttribute.height ?? 0;

    const animationType = params?.animationType ?? 'in';
    const startAngle = params?.startAngle ?? 0;
    const orient = params?.orient ?? 'clockwise';

    let arcStartAngle = 0;
    let arcEndAngle = 0;
    if (orient === 'anticlockwise') {
      arcEndAngle = animationType === 'in' ? startAngle + Math.PI * 2 : startAngle;
      arcEndAngle = startAngle + Math.PI * 2;
    } else {
      arcStartAngle = startAngle;
      arcEndAngle = animationType === 'out' ? startAngle + Math.PI * 2 : startAngle;
    }
    const arc = application.graphicService.creator.arc({
      x: params?.center?.x ?? width / 2,
      y: params?.center?.y ?? height / 2,
      outerRadius: params?.radius ?? (width + height) / 2,
      innerRadius: 0,
      startAngle: arcStartAngle,
      endAngle: arcEndAngle,
      fill: true
    });
    let fromAttributes: Partial<IArcGraphicAttribute>;
    let toAttributes: Partial<IArcGraphicAttribute>;
    if (orient === 'anticlockwise') {
      fromAttributes = { startAngle: startAngle + Math.PI * 2 };
      toAttributes = { startAngle: startAngle };
    } else {
      fromAttributes = { endAngle: startAngle };
      toAttributes = { endAngle: startAngle + Math.PI * 2 };
    }
    super(
      animationType === 'in' ? fromAttributes : toAttributes,
      animationType === 'in' ? toAttributes : fromAttributes,
      duration,
      easing,
      { group: params?.group, clipGraphic: arc }
    );
  }
}

export class ClipRadiusAnimate extends ClipGraphicAnimate {
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: {
      group: IGroup;
      center?: { x: number; y: number };
      startRadius?: number;
      endRadius?: number;
      animationType?: 'in' | 'out';
    }
  ) {
    const groupAttribute = params?.group?.attribute ?? {};
    const width = groupAttribute.width ?? 0;
    const height = groupAttribute.height ?? 0;

    const animationType = params?.animationType ?? 'in';
    const startRadius = params?.startRadius ?? 0;
    const endRadius = params?.endRadius ?? Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

    const arc = application.graphicService.creator.arc({
      x: params?.center?.x ?? width / 2,
      y: params?.center?.y ?? height / 2,
      outerRadius: animationType === 'out' ? endRadius : startRadius,
      innerRadius: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      fill: true
    });
    const fromAttributes: Partial<IArcGraphicAttribute> = { outerRadius: startRadius };
    const toAttributes: Partial<IArcGraphicAttribute> = { outerRadius: endRadius };
    super(
      animationType === 'in' ? fromAttributes : toAttributes,
      animationType === 'in' ? toAttributes : fromAttributes,
      duration,
      easing,
      { group: params?.group, clipGraphic: arc }
    );
  }
}

export class ClipDirectionAnimate extends ClipGraphicAnimate {
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: {
      group: IGroup;
      direction?: 'x' | 'y';
      orient?: 'positive' | 'negative';
      width?: number;
      height?: number;
      animationType?: 'in' | 'out';
    }
  ) {
    const groupAttribute = params?.group?.attribute ?? {};
    const width = params?.width ?? groupAttribute.width ?? 0;
    const height = params?.height ?? groupAttribute.height ?? 0;

    const animationType = params?.animationType ?? 'in';
    const direction = params?.direction ?? 'x';
    const orient = params?.orient ?? 'positive';

    const rect = application.graphicService.creator.rect({
      x: 0,
      y: 0,
      width: animationType === 'in' && direction === 'x' ? 0 : width,
      height: animationType === 'in' && direction === 'y' ? 0 : height,
      fill: true
    });
    let fromAttributes: Partial<IRectGraphicAttribute> = {};
    let toAttributes: Partial<IRectGraphicAttribute> = {};
    if (direction === 'y') {
      if (orient === 'negative') {
        fromAttributes = { y: height, height: 0 };
        toAttributes = { y: 0, height: height };
      } else {
        fromAttributes = { height: 0 };
        toAttributes = { height: height };
      }
    } else {
      if (orient === 'negative') {
        fromAttributes = { x: width, width: 0 };
        toAttributes = { x: 0, width: width };
      } else {
        fromAttributes = { width: 0 };
        toAttributes = { width: width };
      }
    }
    super(
      animationType === 'in' ? fromAttributes : toAttributes,
      animationType === 'in' ? toAttributes : fromAttributes,
      duration,
      easing,
      { group: params?.group, clipGraphic: rect }
    );
  }
}
