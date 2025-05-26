export enum AnimateStepType {
  wait = 'wait',
  from = 'from',
  to = 'to',
  customAnimate = 'customAnimate'
}

export enum AnimateStatus {
  INITIAL = 0,
  RUNNING = 1,
  PAUSED = 2,
  END = 3
}

export type IAnimateStepType = keyof typeof AnimateStepType;
