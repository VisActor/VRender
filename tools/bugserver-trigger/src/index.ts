import * as VRender from '@visactor/vrender';
import * as VRenderKits from '@visactor/vrender-kits';
import * as VRenderCore from '@visactor/vrender-core';
import * as VRenderComponents from '@visactor/vrender-components';
import * as VRenderAnimate from '@visactor/vrender-animate';

import {
  registerArcDataLabel,
  registerLineDataLabel,
  registerRectDataLabel,
  registerSymbolDataLabel
} from '@visactor/vrender-components';

// @ts-ignore
window.VRender = VRender;
// @ts-ignore
window.VRenderComponents = VRenderComponents;
// @ts-ignore
window.VRenderCore = VRenderCore;
// @ts-ignore
window.VRenderKits = VRenderKits;
// @ts-ignore
window.VRenderAnimate = VRenderAnimate;

registerSymbolDataLabel();
registerRectDataLabel();
registerLineDataLabel();
registerArcDataLabel();

export default {
  VRender,
  VRenderComponents,
  VRenderKits,
  VRenderCore,
  VRenderAnimate
};

// export const a = 'a';
// export const b = 'b';

// global.a = a;
// global.b = b;
