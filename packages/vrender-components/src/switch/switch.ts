import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { SwitchAttributes } from './type';
import type { ICircle } from '@visactor/vrender-core';
import { Circle, Rect, Text } from '@visactor/vrender-core';
import type { ComponentOptions } from '../interface';
import { loadSwitchComponent } from './register';
import { measureTextSize } from '../util';

loadSwitchComponent();
export class Switch extends AbstractComponent<Required<SwitchAttributes>> {
  static defaultAttributes: Partial<SwitchAttributes> = {
    interactive: true,
    disabled: false,
    checked: false,
    cursor: 'pointer',
    disableCursor: 'not-allowed',
    circle: {
      radius: 8,
      fill: '#FFF',
      pickable: false
    },
    box: {
      width: 40,
      height: 24,
      cornerRadius: 12,
      uncheckedFill: 'rgb(201,205,212)',
      checkedFill: '#165DFF',
      disableUncheckedFill: 'rgb(242,243,245)',
      disableCheckedFill: 'rgb(148,191,255)',
      pickable: false
    },
    text: {
      textAlign: 'left',
      textBaseline: 'top',
      pickable: false
    },
    spaceBetweenTextAndCircle: 6
  };
  _box: Rect;
  _circle: ICircle;
  _text: Text;

  name: 'switch';

  constructor(attributes: SwitchAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Switch.defaultAttributes, attributes));
    this.renderGroup();

    this.onBeforeAttributeUpdate = (val: any, attributes: any, key: null | string | string[]) => {
      if ('interactive' in val) {
        this.setAttribute('pickable', val.interactive);
      }
      if ('disabled' in val) {
        this.setAttribute('cursor', val.disable ? this.attribute.disableCursor : this.attribute.cursor);
      }
      return undefined;
    };

    this.addEventListener('pointerup', this._handlePointerUp);
  }

  render() {
    this.removeAllChild(true);

    this.renderBox();
    this.renderCircle();
    this.renderText();
    this.layout();
  }

  renderBox() {
    this._box = new Rect(merge({}, this.attribute.box));
    if (this.attribute.disabled && this.attribute.checked) {
      this._box.setAttributes({
        fill: this.attribute.box.disableCheckedFill
      });
    } else if (this.attribute.disabled && !this.attribute.checked) {
      this._box.setAttributes({
        fill: this.attribute.box.disableUncheckedFill
      });
    } else if (this.attribute.checked) {
      this._box.setAttributes({
        fill: this.attribute.box.checkedFill
      });
    } else {
      this._box.setAttributes({
        fill: this.attribute.box.uncheckedFill
      });
    }
    this.appendChild(this._box);
  }

  renderCircle() {
    this._circle = new Circle(merge({}, this.attribute.circle));
    this.appendChild(this._circle);
  }

  renderText() {
    this._text = new Text(merge({}, this.attribute.text ?? {}));
    if (this.attribute.checked && this.attribute.text?.checkedText) {
      this._text.setAttributes({
        text: this.attribute.text.checkedText
      });
    } else if (this.attribute.text?.uncheckedText) {
      this._text.setAttributes({
        text: this.attribute.text.uncheckedText
      });
    }
    this.appendChild(this._text);
  }

  renderGroup() {
    if (!this.attribute.interactive) {
      this.setAttribute('pickable', false);
    }
    if (this.attribute.disabled) {
      this.setAttribute('cursor', this.attribute.disableCursor);
    }
  }

  layout() {
    const space = this.attribute.spaceBetweenTextAndCircle;
    const radius = this.attribute.circle.radius;

    const boxHeight = this.attribute.box.height;
    const circleHeight = radius * 2;
    const textHeight = this._text.AABBBounds.height();
    const maxHeight = Math.max(boxHeight, circleHeight, textHeight);
    const circleY = maxHeight / 2 - circleHeight / 2 + radius;
    const textY = maxHeight / 2 - textHeight / 2;

    const boxWidth = this.attribute.box.width;
    const circleWidth = radius * 2;
    // const textWidth = this._text.AABBBounds.width();
    const textWidth = measureTextSize(
      (this.attribute.text?.checkedText?.length ?? 0) > (this.attribute.text?.uncheckedText?.length ?? 0)
        ? this.attribute.text?.checkedText ?? ''
        : this.attribute.text?.uncheckedText ?? '',
      this._text.attribute
    ).width;
    const maxWidth = Math.max(boxWidth, circleWidth + textWidth + space * 3); // [circle[space]text[space][space]]
    const circleX = boxHeight / 2 - circleWidth / 2 + radius;
    const textX = circleX + radius + space;

    this._box.setAttributes({
      width: maxWidth,
      height: maxHeight
    });

    // set circle position
    this._circle.setAttributes({
      y: circleY,
      x: this.attribute.checked ? circleX : maxWidth - circleX
    });

    // set text position
    this._text.setAttributes({
      x: this.attribute.checked ? textX : maxWidth - textX - textWidth,
      y: textY
    });
  }

  private _handlePointerUp = () => {
    if (this.attribute.disabled) {
      return;
    } else if (this.attribute.checked) {
      this.setAttribute('checked', false);
    } else {
      this.setAttribute('checked', true);
    }

    this._dispatchEvent('switch_state_change', {
      eventType: 'switch_state_change',
      checked: this.attribute.checked
    });

    this.stage.renderNextFrame();
  };

  initAttributes(params: SwitchAttributes, options?: ComponentOptions) {
    params = options?.skipDefault ? params : merge({}, Switch.defaultAttributes, params);
    super.initAttributes(params);
    this.renderGroup();
    this.render();
  }
}
