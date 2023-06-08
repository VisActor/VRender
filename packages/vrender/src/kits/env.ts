import { container } from '../container';
import { DefaultMathPickerService, PickerService } from '../picker';

// 兼容环境
export function loadFeishuContributions() {
  container.rebind(PickerService).toService(DefaultMathPickerService);
}

export function loadTaroContributions() {
  container.rebind(PickerService).toService(DefaultMathPickerService);
}
