import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { RadioAttributes } from './type';
import { Arc, Text } from '@visactor/vrender-core';
import type { ComponentOptions } from '../interface';
import { loadRadioComponent } from './register';

loadRadioComponent();
export class Radio extends AbstractComponent<Required<RadioAttributes>> {
  static defaultAttributes: Partial<RadioAttributes> = {
    interactive: true,
    disabled: false,
    checked: false,
    cursor: 'pointer',
    disableCursor: 'not-allowed',
    spaceBetweenTextAndIcon: 8,
    text: {
      text: 'text',
      fontSize: 14,
      fill: '#000',
      disableFill: 'rgb(201,205,212)',
      textBaseline: 'top',
      pickable: false
    },
    circle: {
      outerRadius: 7,
      innerRadius: 3,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      lineWidth: 1,
      fill: '#fff',
      stroke: 'rgb(229,230,235)',
      disableFill: 'rgb(242,243,245)',
      checkedFill: 'rgb(22, 93, 255)',
      checkedStroke: 'rgb(22, 93, 255)',
      disableCheckedFill: 'rgb(148, 191, 255)',
      disableCheckedStroke: 'rgb(148, 191, 255)',
      pickable: false
    }
  };
  _circle: Arc;
  _text: Text;

  name: 'radio';

  constructor(attributes: RadioAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Radio.defaultAttributes, attributes));
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

    this.renderCircle();
    this.renderText();
    this.layout();
  }

  renderCircle() {
    this._circle = new Arc(merge({}, this.attribute.circle));
    const isChecked = this.attribute.checked;
    if (isChecked && this.attribute.disabled) {
      this._circle.setAttributes({
        fill: this.attribute.circle.disableCheckedFill,
        stroke: this.attribute.circle.disableCheckedStroke
      });
    } else if (isChecked) {
      this._circle.setAttributes({
        fill: this.attribute.circle.checkedFill,
        stroke: this.attribute.circle.checkedStroke
      });
    } else if (this.attribute.disabled) {
      this._circle.setAttributes({
        fill: this.attribute.circle.disableFill
        // stroke: this.attribute.circle.disableFill
      });
    }
    this.appendChild(this._circle);
  }

  renderText() {
    this._text = new Text(merge({}, this.attribute.text));
    if (this.attribute.disabled) {
      this._text.setAttribute('fill', this.attribute.text.disableFill);
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
    const circleHeight = (this.attribute.circle.outerRadius + this.attribute.circle.lineWidth) * 2;
    const textHeight = this._text.AABBBounds.height();
    const maxHeight = Math.max(circleHeight, textHeight);
    const circleY =
      maxHeight / 2 - circleHeight / 2 + this.attribute.circle.outerRadius + this.attribute.circle.lineWidth;
    const textY = maxHeight / 2 - textHeight / 2;

    const circleWidth = (this.attribute.circle.outerRadius + this.attribute.circle.lineWidth) * 2;
    const circleX = this.attribute.circle.outerRadius + this.attribute.circle.lineWidth;
    const textX = circleWidth + this.attribute.spaceBetweenTextAndIcon;

    this._circle.setAttributes({
      x: circleX,
      y: circleY
    });
    this._text.setAttributes({
      x: textX,
      y: textY
    });
  }

  private _handlePointerUp = () => {
    if (this.attribute.disabled || this.attribute.checked) {
      // checked do nothing
      return;
    }
    this.setAttribute('checked', true);

    this._dispatchEvent('radio_checked', {
      eventType: 'radio_checked',
      target: this
    });

    this.stage.renderNextFrame();
  };

  initAttributes(params: RadioAttributes, options?: ComponentOptions) {
    params = options?.skipDefault ? params : merge({}, Radio.defaultAttributes, params);
    super.initAttributes(params);
    this.renderGroup();
    this.render();
  }
}
