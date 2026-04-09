import { DrawContribution, PickItemInterceptor, PickerService, PickServiceInterceptor } from '@visactor/vrender-core';
import { createContributionProvider, resolveContainerBinding } from '../common/explicit-binding';
import { DefaultCanvasPickerService } from './canvas-picker-service';
import { bindCanvasPickerContribution } from './contributions/canvas-picker/module';
import { CanvasPickerContribution } from './contributions/constants';
import { bindArcCanvasPickerContribution } from './contributions/canvas-picker/arc-module';
import { bindArc3dCanvasPickerContribution } from './contributions/canvas-picker/arc3d-module';
import { bindAreaCanvasPickerContribution } from './contributions/canvas-picker/area-module';
import { bindCircleCanvasPickerContribution } from './contributions/canvas-picker/circle-module';
import { bindGlyphCanvasPickerContribution } from './contributions/canvas-picker/glyph-module';
import { bindImageCanvasPickerContribution } from './contributions/canvas-picker/image-module';
import { bindLineCanvasPickerContribution } from './contributions/canvas-picker/line-module';
import { bindLottieCanvasPickerContribution } from './contributions/canvas-picker/lottie-module';
import { bindPathCanvasPickerContribution } from './contributions/canvas-picker/path-module';
import { bindPolygonCanvasPickerContribution } from './contributions/canvas-picker/polygon-module';
import { bindPyramid3dCanvasPickerContribution } from './contributions/canvas-picker/pyramid3d-module';
import { bindRectCanvasPickerContribution } from './contributions/canvas-picker/rect-module';
import { bindRect3dCanvasPickerContribution } from './contributions/canvas-picker/rect3d-module';
import { bindRichtextCanvasPickerContribution } from './contributions/canvas-picker/richtext-module';
import { bindStarCanvasPickerContribution } from './contributions/canvas-picker/star-module';
import { bindSymbolCanvasPickerContribution } from './contributions/canvas-picker/symbol-module';
import { bindTextCanvasPickerContribution } from './contributions/canvas-picker/text-module';
import { bindGifImageCanvasPickerContribution } from './contributions/canvas-picker/gif-image-module';
import type { LegacyContainer } from '../common/legacy-container';

type IBindingContainer = Pick<LegacyContainer, 'bind' | 'rebind' | 'isBound' | 'getAll'>;

export function bindCanvasPicker(c: IBindingContainer) {
  if (!c.isBound(DefaultCanvasPickerService)) {
    c.bind(DefaultCanvasPickerService)
      .toDynamicValue(
        () =>
          new DefaultCanvasPickerService(
            createContributionProvider(CanvasPickerContribution, c as any),
            resolveContainerBinding(c as any, DrawContribution),
            createContributionProvider(PickItemInterceptor, c as any),
            createContributionProvider(PickServiceInterceptor, c as any)
          )
      )
      .inSingletonScope();
  }
  if (c.isBound(PickerService)) {
    c.rebind(PickerService).toService(DefaultCanvasPickerService);
  } else {
    c.bind(PickerService).toService(DefaultCanvasPickerService);
  }
}

export function loadCanvasPicker(c: LegacyContainer) {
  bindCanvasPickerContribution(c);
  bindArcCanvasPickerContribution(c);
  bindArc3dCanvasPickerContribution(c);
  bindAreaCanvasPickerContribution(c);
  bindCircleCanvasPickerContribution(c);
  bindGlyphCanvasPickerContribution(c);
  bindImageCanvasPickerContribution(c);
  bindLineCanvasPickerContribution(c);
  bindLottieCanvasPickerContribution(c);
  bindPathCanvasPickerContribution(c);
  bindPolygonCanvasPickerContribution(c);
  bindPyramid3dCanvasPickerContribution(c);
  bindRectCanvasPickerContribution(c);
  bindRect3dCanvasPickerContribution(c);
  bindRichtextCanvasPickerContribution(c);
  bindStarCanvasPickerContribution(c);
  bindSymbolCanvasPickerContribution(c);
  bindTextCanvasPickerContribution(c);
  bindGifImageCanvasPickerContribution(c);
  bindCanvasPicker(c);
}
