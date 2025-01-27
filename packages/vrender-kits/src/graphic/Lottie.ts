import { min } from '@visactor/vutils';
import { LOTTIE_NUMBER_TYPE } from './constants';
import type { IRectGraphicAttribute } from '@visactor/vrender-core';
import { getTheme, GraphicType, IContext2d, NOWORK_ANIMATE_ATTR, Rect, vglobal } from '@visactor/vrender-core';
import type { ILottie, ILottieGraphicAttribute } from './interface/lottie';
import type { AnimationItem } from 'lottie-web';
import bodymovin from 'lottie-web';

export class Lottie extends Rect implements ILottie {
  type: any = 'lottie';
  declare attribute: ILottieGraphicAttribute;
  declare lottieInstance?: AnimationItem;
  declare canvas?: any;

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  constructor(params: ILottieGraphicAttribute) {
    super(params);
    this.numberType = LOTTIE_NUMBER_TYPE;
    this.initLottieWeb(this.attribute.data);
  }

  setAttributes(params: Partial<ILottieGraphicAttribute>, forceUpdateTag?: boolean, context?: any): void {
    if (params.data) {
      this.initLottieWeb(params.data);
    }
    return super.setAttributes(params, forceUpdateTag, context);
  }

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: any): void {
    if (key === 'data') {
      this.initLottieWeb(value);
    }
    return super.setAttribute(key, value, forceUpdateTag, context);
  }

  getGraphicTheme(): Required<IRectGraphicAttribute> {
    return getTheme(this).rect;
  }

  initLottieWeb(data: string) {
    // 必须是浏览器环境才行
    if (vglobal.env !== 'browser') {
      return;
    }
    if (this.lottieInstance) {
      this.releaseLottieInstance();
    }
    const theme = this.getGraphicTheme();
    const { width = theme.width, height = theme.height } = this.attribute;
    const canvas = vglobal.createCanvas({ width, height, dpr: vglobal.devicePixelRatio });
    const params: any = {
      // wrapper: svgContainer,
      rendererSettings: {
        context: canvas.getContext('2d')
      },
      animType: 'canvas',
      loop: true
    };
    if (typeof data === 'string') {
      params.path = data;
    } else {
      params.animationData = data;
    }
    this.lottieInstance = bodymovin.loadAnimation(params);
    this.canvas = canvas;
    this.lottieInstance.addEventListener('drawnFrame', this.renderNextFrame);
  }

  renderNextFrame = () => {
    this.stage.renderNextFrame();
  };

  release(): void {
    super.release();
    this.releaseLottieInstance();
  }

  releaseLottieInstance() {
    this.lottieInstance.removeEventListener('drawnFrame', this.renderNextFrame);
    this.lottieInstance.destroy();
    this.lottieInstance = null;
  }
}

export function createLottie(attributes: ILottieGraphicAttribute): ILottie {
  return new Lottie(attributes);
}
