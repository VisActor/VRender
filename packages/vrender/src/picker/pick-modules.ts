import { ContainerModule } from 'inversify';
import { PickerService } from './picker-service';
import { DefaultGlobalPickerService, GlobalPickerService } from './global-picker-service';
import { DefaultCanvasPickerService } from './canvas-picker-service';
import { DefaultMathPickerService } from './math-picker-service';
import { Canvas3DPickItemInterceptor, PickItemInterceptor } from './pick-interceptor';
import { bindContributionProvider } from '../common/contribution-provider';

export default new ContainerModule(bind => {
  bind(DefaultCanvasPickerService).toSelf().inSingletonScope();
  bind(DefaultMathPickerService).toSelf().inSingletonScope();

  bind(PickerService).toService(DefaultCanvasPickerService);

  bind(DefaultGlobalPickerService).toSelf().inSingletonScope();
  bind(GlobalPickerService).toService(DefaultGlobalPickerService);

  // interceptor
  bind(Canvas3DPickItemInterceptor).toSelf().inSingletonScope();
  bind(PickItemInterceptor).toService(Canvas3DPickItemInterceptor);
  bindContributionProvider(bind, PickItemInterceptor);
});
