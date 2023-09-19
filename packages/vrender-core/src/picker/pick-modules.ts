import { ContainerModule } from '../common/inversify-lite';
import { PickerService, GlobalPickerService } from './constants';
import { DefaultGlobalPickerService } from './global-picker-service';
// import { DefaultCanvasPickerService } from './canvas-picker-service';
// import { DefaultMathPickerService } from './math-picker-service';
import {
  Canvas3DPickItemInterceptor,
  PickItemInterceptor,
  ShadowRootPickItemInterceptorContribution
} from './pick-interceptor';
import { bindContributionProvider } from '../common/contribution-provider';

export default new ContainerModule(bind => {
  bind(PickerService).toService(GlobalPickerService);

  bind(DefaultGlobalPickerService).toSelf().inSingletonScope();
  bind(GlobalPickerService).toService(DefaultGlobalPickerService);

  // interceptor
  bind(Canvas3DPickItemInterceptor).toSelf().inSingletonScope();
  bind(PickItemInterceptor).toService(Canvas3DPickItemInterceptor);

  bind(ShadowRootPickItemInterceptorContribution).toSelf().inSingletonScope();
  bind(PickItemInterceptor).toService(ShadowRootPickItemInterceptorContribution);
  bindContributionProvider(bind, PickItemInterceptor);
});
