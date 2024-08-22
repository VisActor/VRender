import * as VRender from '@visactor/vrender';
import * as VRenderKits from '@visactor/vrender-kits';
import * as VRenderCore from '@visactor/vrender-core';
import * as VRenderComponents from '@visactor/vrender-components';

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

registerSymbolDataLabel();
registerRectDataLabel();
registerLineDataLabel();
registerArcDataLabel();

export default {
  VRender,
  VRenderComponents,
  VRenderKits,
  VRenderCore
};

// export const a = 'a';
// export const b = 'b';

// global.a = a;
// global.b = b;
