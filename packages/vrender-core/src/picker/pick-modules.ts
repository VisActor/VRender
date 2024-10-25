import { ContainerModule } from '../common/inversify-lite';
import { PickerService, GlobalPickerService, PickItemInterceptor, PickServiceInterceptor } from './constants';
import { DefaultGlobalPickerService } from './global-picker-service';
// import { DefaultCanvasPickerService } from './canvas-picker-service';
// import { DefaultMathPickerService } from './math-picker-service';
import {
  Canvas3DPickItemInterceptor,
  InteractivePickItemInterceptorContribution,
  ShadowPickServiceInterceptorContribution,
  ShadowRootPickItemInterceptorContribution
} from './pick-interceptor';
import { bindContributionProvider } from '../common/contribution-provider';

export default new ContainerModule((bind, unbind, isBound) => {
  if (!isBound(PickerService)) {
    bind(GlobalPickerService).toSelf();
    bind(PickerService).toService(GlobalPickerService);
  }
  // bind(PickerService).toService(GlobalPickerService);

  // bind(DefaultGlobalPickerService).toSelf().inSingletonScope();
  // bind(GlobalPickerService).toService(DefaultGlobalPickerService);

  // interceptor
  bind(Canvas3DPickItemInterceptor).toSelf().inSingletonScope();
  bind(PickItemInterceptor).toService(Canvas3DPickItemInterceptor);

  // shadow root
  bind(ShadowRootPickItemInterceptorContribution).toSelf().inSingletonScope();
  bind(PickItemInterceptor).toService(ShadowRootPickItemInterceptorContribution);

  // interactive
  bind(InteractivePickItemInterceptorContribution).toSelf().inSingletonScope();
  bind(PickItemInterceptor).toService(InteractivePickItemInterceptorContribution);
  bindContributionProvider(bind, PickItemInterceptor);

  bind(ShadowPickServiceInterceptorContribution).toSelf().inSingletonScope();
  bind(PickServiceInterceptor).toService(ShadowPickServiceInterceptorContribution);

  bindContributionProvider(bind, PickServiceInterceptor);
});
