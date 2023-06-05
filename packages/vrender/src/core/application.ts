import { MaybePromise, IStage } from '../interface';

export const ApplicationContribution = Symbol('ApplicationContribution');
export interface IApplicationContribution {
  // 调用初始化函数
  initialize?: () => void;

  configure?: (stage: IStage) => MaybePromise<void>;

  onDestroy?: (stage: IStage) => MaybePromise<void>;
}
