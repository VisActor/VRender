import { isValid, merge, normalizePadding } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { EmptyTipAttributes } from './type';
import { Image, Rect, Text, graphicCreator } from '@visactor/vrender-core';
import type { ComponentOptions } from '../interface';
import { loadEmptyTipComponent } from './register';

const emptyTipSvg =
  '<svg t="1716726614852" class="icon" viewBox="0 0 1194 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2621" width="200" height="200"><path d="M1038.694079 367.237067c13.265507 23.342857-16.633865-40.004445-63.05621-40.004446H219.018794c-26.558738 0-46.46393 13.334815-63.05621 40.004446S0.006238 607.277601 0.006238 650.608819V940.647979a82.351494 82.351494 0 0 0 82.961402 83.349526H1111.702885a82.337632 82.337632 0 0 0 82.975264-83.349526V650.608819c0-43.331218-155.970208-283.371753-155.970208-283.371752zM730.066575 667.284269a136.328386 136.328386 0 0 1-132.738243 133.33429 133.417459 133.417459 0 0 1-132.738243-133.33429v-6.681269a40.6698 40.6698 0 0 0-36.497473-26.66963H73.015044l119.458874-220.02445s23.231965-40.004445 53.103614-40.004446h713.481918c26.544876 0 29.871649 10.008042 46.436207 40.004446L1128.33675 633.947231H769.904682c-26.184476 0-39.838107 7.623855-39.838107 33.337038zM338.505391 210.559919l-89.601086-86.69016a22.178487 22.178487 0 0 1 0-33.26773 21.984425 21.984425 0 0 1 33.170699 0l89.601087 86.676299a22.317102 22.317102 0 0 1 0 33.26773 24.950798 24.950798 0 0 1-33.1707 0z m252.197118-40.059891a25.532983 25.532983 0 0 1-6.639685-16.633865l-3.326773-126.694606A28.263709 28.263709 0 0 1 603.995739 0.515788c13.251646-3.326773 23.204242 10.021904 26.544877 23.342858V153.866163a28.249847 28.249847 0 0 1-23.259688 26.66963c-6.611961-3.312911-13.279369-3.312911-16.578419-10.035765z m235.646421 33.337038a22.372548 22.372548 0 0 1 0-33.337038l86.288175-90.030795a22.039871 22.039871 0 0 1 33.170699 0 22.289379 22.289379 0 0 1 0 33.364761l-82.961401 90.003072a25.962691 25.962691 0 0 1-36.483611 0z" fill="#8a8a8a" p-id="2622"></path></svg>';

loadEmptyTipComponent();
export class EmptyTip extends AbstractComponent<Required<EmptyTipAttributes>> {
  static defaultAttributes: Partial<EmptyTipAttributes> = {
    spaceBetweenTextAndIcon: 20,
    text: {
      text: 'no data',
      fontSize: 14,
      fill: '#000',
      disableFill: 'rgb(201,205,212)',
      pickable: false
    },
    icon: {
      image: emptyTipSvg,
      width: 100,
      height: 100,
      pickable: false
    }
  };
  _text: Text;
  _emptyTipIcon: Image;
  constructor(attributes: EmptyTipAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, EmptyTip.defaultAttributes, attributes));
  }

  render() {
    this.removeAllChild(true);

    this.renderIcon();
    this.renderText();
    this.layout();
  }

  renderIcon() {
    this._emptyTipIcon = new Image(merge({ image: this.attribute.icon.image }, this.attribute.icon));
    this.appendChild(this._emptyTipIcon);
  }

  renderText() {
    this._text = new Text(merge({ wrap: true }, this.attribute.text));
    this.appendChild(this._text);
  }

  layout() {
    const iconHeight = this.attribute.icon.height;
    const textHeight = this._text.AABBBounds.height();

    const iconWidth = this.attribute.icon.width;

    const { width, height, spaceBetweenTextAndIcon } = this.attribute as EmptyTipAttributes;

    this._emptyTipIcon.setAttribute('x', width / 2 - iconWidth / 2);
    // this._emptyTipIcon.setAttribute('textAlign', 'center');

    this._emptyTipIcon.setAttribute('y', height / 2 - iconHeight / 2 - textHeight / 2 - spaceBetweenTextAndIcon / 2);
    // this._emptyTipIcon.setAttribute('textBaseline', 'middle');

    this._text.setAttribute('x', width / 2);
    this._text.setAttribute('textAlign', 'center');

    this._text.setAttribute('y', height / 2 + iconHeight / 2 + spaceBetweenTextAndIcon / 2);
    this._text.setAttribute('textBaseline', 'middle');
  }
}
