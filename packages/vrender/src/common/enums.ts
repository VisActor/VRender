export enum UpdateTag {
  NONE = 0b00000000,
  UPDATE_BOUNDS = 0b00000001, // bounds有更新
  UPDATE_SHAPE = 0b00000010, // shape有更新
  CLEAR_SHAPE = 0b11111101,
  UPDATE_SHAPE_AND_BOUNDS = 0b00000011, // shape&bounds有更新
  INIT = 0b00110011,
  CLEAR_BOUNDS = 0b11111110, // 清除bounds更新位
  UPDATE_GLOBAL_MATRIX = 0b00100000, // 更新全局matrix
  CLEAR_GLOBAL_MATRIX = 0b11011111, // 清除全局matrix
  UPDATE_LOCAL_MATRIX = 0b00010000, // 更新局部matrix
  CLEAR_LOCAL_MATRIX = 0b11101111, // 清除局部matrix
  UPDATE_GLOBAL_LOCAL_MATRIX = 0b00110000 // 更新全局和局部matrix
}

export enum IContainPointMode {
  GLOBAL = 0b00000001, // 传入的点是全局坐标
  LOCAL = 0b00010000, // 传入的点是局部坐标
  GLOBAL_ACCURATE = 0b00000011, // 使用精确的全局匹配
  LOCAL_ACCURATE = 0b00110000 // 使用精确的局部匹配
}

export enum AttributeUpdateType {
  INIT = 0,
  DEFAULT = 1,
  STATE = 2,

  ANIMATE_BIND = 10,
  ANIMATE_PLAY = 11,
  ANIMATE_START = 12,
  ANIMATE_UPDATE = 13,
  ANIMATE_END = 14,

  TRANSLATE = 20,
  TRANSLATE_TO = 21,
  SCALE = 22,
  SCALE_TO = 23,
  ROTATE = 24,
  ROTATE_TO = 25
}

export enum AnimateStatus {
  INITIAL = 0,
  RUNNING = 1,
  PAUSED = 2,
  END = 3
}

export enum AnimateMode {
  NORMAL = 0b0000,
  SET_ATTR_IMMEDIATELY = 0b0001
}

export enum AnimateStepType {
  'wait' = 'wait',
  'from' = 'from',
  'to' = 'to',
  'customAnimate' = 'customAnimate'
}

export enum Direction {
  ROW = 1,
  COLUMN = 2
}

export enum CurveTypeEnum {
  CubicBezierCurve = 0,
  QuadraticBezierCurve = 1,
  ArcCurve = 2,
  LineCurve = 3,
  EllipseCurve = 4,
  MoveCurve = 5
}
