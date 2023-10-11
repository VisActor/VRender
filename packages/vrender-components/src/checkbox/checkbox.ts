import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { CheckboxAttributes } from './type';
import { CustomEvent, Image, Rect, WrapText } from '@visactor/vrender-core';

const svg =
  '<svg width="200" height="200" viewBox="0 0 1024 1024" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M877.44815445 206.10060629a64.72691371 64.72691371 0 0 0-95.14856334 4.01306852L380.73381888 685.46812814 235.22771741 533.48933518a64.72691371 64.72691371 0 0 0-92.43003222-1.03563036l-45.82665557 45.82665443a64.72691371 64.72691371 0 0 0-0.90617629 90.61767965l239.61903446 250.10479331a64.72691371 64.72691371 0 0 0 71.19960405 15.14609778 64.33855261 64.33855261 0 0 0 35.08198741-21.23042702l36.24707186-42.71976334 40.5190474-40.77795556-3.36579926-3.49525333 411.40426297-486.74638962a64.72691371 64.72691371 0 0 0-3.88361443-87.64024149l-45.3088404-45.43829334z"></path></svg>';

export class CheckBox extends AbstractComponent<Required<CheckboxAttributes>> {
  static defaultAttributes: Partial<CheckboxAttributes> = {
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
    icon: {
      image: svg,
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
  _icon: Image;
  _text: WrapText;

  constructor(attributes: CheckboxAttributes) {
    super(merge({}, CheckBox.defaultAttributes, attributes));
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

    this.addEventListener('click', this.handleClick);
  }

  render() {
    this.removeAllChild();

    this.renderBox();
    this.renderIcon();
    this.renderText();
    this.layout();
  }

  renderBox() {
    this._box = new Rect(merge({}, this.attribute.box));
    if (this.attribute.checked && this.attribute.disabled) {
      this._box.setAttributes({
        fill: this.attribute.box.disableCheckedFill,
        stroke: this.attribute.box.disableCheckedStroke
      });
    } else if (this.attribute.checked) {
      this._box.setAttributes({
        fill: this.attribute.box.checkedFill,
        stroke: this.attribute.box.checkedStroke
      });
    }
    this.appendChild(this._box);
  }

  renderIcon() {
    this._icon = new Image(merge({}, this.attribute.icon));
    if (!this.attribute.checked) {
      this._icon.setAttribute('visible', false);
    }
    this.appendChild(this._icon);
  }

  renderText() {
    this._text = new WrapText(merge({}, this.attribute.text));
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
    this._icon.setAttributes({
      x: iconX,
      y: iconY
    });
    this._text.setAttributes({
      x: textX,
      y: textY
    });
  }

  handleClick() {
    if (this.attribute.disabled) {
      return;
    } else if (this.attribute.checked) {
      this.setAttribute('checked', false);
    } else {
      this.setAttribute('checked', true);
    }
    const changeEvent = new CustomEvent('checkbox_state_change', {
      eventType: 'checkbox_state_change',
      checked: this.attribute.checked
    } as unknown) as any;
    changeEvent.manager = (this.stage as any)?.eventSystem.manager;
    this.dispatchEvent(changeEvent);
  }
}
