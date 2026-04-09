import { PickItemInterceptor, PickerService, PickServiceInterceptor } from '@visactor/vrender-core';
import { createContributionProvider } from '../common/explicit-binding';
import { DefaultMathPickerService } from './math-picker-service';
import { bindMathPickerContribution } from './contributions/math-picker/module';
import { MathPickerContribution } from './contributions/constants';
import { bindArcMathPickerContribution } from './contributions/math-picker/arc-module';
import { bindAreaMathPickerContribution } from './contributions/math-picker/area-module';
import { bindCircleMathPickerContribution } from './contributions/math-picker/circle-module';
import { bindGlyphMathPickerContribution } from './contributions/math-picker/glyph-module';
import { bindImageMathPickerContribution } from './contributions/math-picker/image-module';
import { bindLineMathPickerContribution } from './contributions/math-picker/line-module';
import { bindPolygonMathPickerContribution } from './contributions/math-picker/polygon-module';
import { bindPathMathPickerContribution } from './contributions/math-picker/path-module';
import { bindRectMathPickerContribution } from './contributions/math-picker/rect-module';
import { bindRichTextMathPickerContribution } from './contributions/math-picker/richtext-module';
import { bindSymbolMathPickerContribution } from './contributions/math-picker/symbol-module';
import { bindTextMathPickerContribution } from './contributions/math-picker/text-module';
import type { LegacyContainer } from '../common/legacy-container';

type IBindingContainer = Pick<LegacyContainer, 'bind' | 'rebind' | 'isBound' | 'getAll'>;

export function bindMathPicker(c: IBindingContainer) {
  if (!c.isBound(DefaultMathPickerService)) {
    c.bind(DefaultMathPickerService)
      .toDynamicValue(
        () =>
          new DefaultMathPickerService(
            createContributionProvider(MathPickerContribution, c as any),
            createContributionProvider(PickItemInterceptor, c as any),
            createContributionProvider(PickServiceInterceptor, c as any)
          )
      )
      .inSingletonScope();
  }
  if (c.isBound(PickerService)) {
    c.rebind(PickerService).toService(DefaultMathPickerService);
  } else {
    c.bind(PickerService).toService(DefaultMathPickerService);
  }
}

export function loadMathPicker(c: LegacyContainer) {
  bindMathPickerContribution(c);
  bindMathPicker(c);
  bindArcMathPickerContribution(c);
  bindAreaMathPickerContribution(c);
  bindCircleMathPickerContribution(c);
  bindGlyphMathPickerContribution(c);
  bindImageMathPickerContribution(c);
  bindLineMathPickerContribution(c);
  bindPolygonMathPickerContribution(c);
  bindPathMathPickerContribution(c);
  bindRectMathPickerContribution(c);
  bindRichTextMathPickerContribution(c);
  bindSymbolMathPickerContribution(c);
  bindTextMathPickerContribution(c);
}
