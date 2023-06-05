export interface IContribution<T> {
  configure: (service: T, ...data: any) => void;
}
