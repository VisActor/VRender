import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { CheckboxAttributes } from './type';
import { Image, Rect, Text } from '@visactor/vrender-core';
import type { ComponentOptions } from '../interface';
import { loadCheckBoxComponent } from './register';

const checkSvg =
  '<svg width="200" height="200" viewBox="0 0 1024 1024" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M877.44815445 206.10060629a64.72691371 64.72691371 0 0 0-95.14856334 4.01306852L380.73381888 685.46812814 235.22771741 533.48933518a64.72691371 64.72691371 0 0 0-92.43003222-1.03563036l-45.82665557 45.82665443a64.72691371 64.72691371 0 0 0-0.90617629 90.61767965l239.61903446 250.10479331a64.72691371 64.72691371 0 0 0 71.19960405 15.14609778 64.33855261 64.33855261 0 0 0 35.08198741-21.23042702l36.24707186-42.71976334 40.5190474-40.77795556-3.36579926-3.49525333 411.40426297-486.74638962a64.72691371 64.72691371 0 0 0-3.88361443-87.64024149l-45.3088404-45.43829334z"></path></svg>';

const indeterminateSvg =
  '<svg width="200" height="200" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M5 12h14"/></svg>';

loadCheckBoxComponent();
export class CheckBox extends AbstractComponent<Required<CheckboxAttributes>> {
  static defaultAttributes: Partial<CheckboxAttributes> = {
    interactive: true,
    disabled: false,
    checked: false,
    indeterminate: false,
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
    icon: {
      checkIconImage: checkSvg,
      indeterminateIconImage: indeterminateSvg,
      width: 10,
      height: 10,
      pickable: false
    },
    box: {
      width: 14,
      height: 14,
      cornerRadius: 2,
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
  _box: Rect;
  _checkIcon: Image;
  _indeterminateIcon: Image;
  _text: Text;

  name: 'checkbox';

  constructor(attributes: CheckboxAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, CheckBox.defaultAttributes, attributes));
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
    this.renderIcon();
    this.renderText();
    this.layout();
  }

  renderBox() {
    this._box = new Rect(merge({}, this.attribute.box));
    const isCheckedOrIndeterminate = this.attribute.checked || this.attribute.indeterminate;
    if (isCheckedOrIndeterminate && this.attribute.disabled) {
      this._box.setAttributes({
        fill: this.attribute.box.disableCheckedFill,
        stroke: this.attribute.box.disableCheckedStroke
      });
    } else if (isCheckedOrIndeterminate) {
      this._box.setAttributes({
        fill: this.attribute.box.checkedFill,
        stroke: this.attribute.box.checkedStroke
      });
    } else if (this.attribute.disabled) {
      this._box.setAttributes({
        fill: this.attribute.box.disableFill
        // stroke: this.attribute.box.disableFill
      });
    }
    this.appendChild(this._box);
  }

  renderIcon() {
    this._checkIcon = new Image(merge({ image: this.attribute.icon.checkIconImage }, this.attribute.icon));
    this.appendChild(this._checkIcon);
    this._indeterminateIcon = new Image(
      merge(
        {
          image: this.attribute.icon.indeterminateIconImage
        },
        this.attribute.icon
      )
    );
    this.appendChild(this._indeterminateIcon);

    if (this.attribute.checked) {
      this._checkIcon.setAttribute('visible', true);
      this._indeterminateIcon.setAttribute('visible', false);
    } else if (this.attribute.indeterminate) {
      this._checkIcon.setAttribute('visible', false);
      this._indeterminateIcon.setAttribute('visible', true);
    } else {
      this._checkIcon.setAttribute('visible', false);
      this._indeterminateIcon.setAttribute('visible', false);
    }
  }

  renderText() {
    this._text = new Text(merge({ wrap: true }, this.attribute.text));
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
    const boxHeight = this.attribute.box.height;
    const iconHeight = this.attribute.icon.height;
    const textHeight = this._text.AABBBounds.height();
    const maxHeight = Math.max(boxHeight, iconHeight, textHeight);
    const boxY = maxHeight / 2 - boxHeight / 2;
    const iconY = maxHeight / 2 - iconHeight / 2;
    const textY = maxHeight / 2 - textHeight / 2;

    const boxWidth = this.attribute.box.width;
    const iconWidth = this.attribute.icon.width;
    const maxWidth = Math.max(boxWidth, iconWidth);
    const boxX = maxWidth / 2 - boxWidth / 2;
    const iconX = maxWidth / 2 - iconWidth / 2;
    const textX = maxWidth + this.attribute.spaceBetweenTextAndIcon;

    this._box.setAttributes({
      x: boxX,
      y: boxY
    });
    this._checkIcon.setAttributes({
      x: iconX,
      y: iconY
    });
    this._indeterminateIcon.setAttributes({
      x: iconX,
      y: iconY
    });
    this._text.setAttributes({
      x: textX,
      y: textY
    });
  }

  private _handlePointerUp = () => {
    if (this.attribute.disabled) {
      return;
    } else if (this.attribute.checked) {
      this.setAttribute('checked', false);
      this.setAttribute('indeterminate', false);
    } else {
      this.setAttribute('checked', true);
      this.setAttribute('indeterminate', false);
    }

    this._dispatchEvent('checkbox_state_change', {
      eventType: 'checkbox_state_change',
      checked: this.attribute.checked
    });

    this.stage.renderNextFrame();
  };

  initAttributes(params: CheckboxAttributes, options?: ComponentOptions) {
    params = options?.skipDefault ? params : merge({}, CheckBox.defaultAttributes, params);
    super.initAttributes(params);
    this.renderGroup();
    this.render();
  }
}
