import type { Graphic, IGraphic, IGraphicAttribute, IGroup } from '@visactor/vrender-core';
import type { IMatrix } from '@visactor/vutils';
import type { AnimationManager } from './animation-manager';

// 骨骼关节定义
export type SkeletonJointDefinition = {
  name: string;
  parent?: string; // 父关节名，空表示根关节
  position?: [number, number]; // 局部坐标系中的位置
  rotation?: number; // 初始旋转弧度
  scale?: [number, number]; // 局部缩放
  pivot?: [number, number]; // 旋转枢轴点
  width?: number; // 关节宽度
  height?: number; // 关节高度
};

// 骨骼系统定义
export type SkeletonDefinition = {
  joints: SkeletonJointDefinition[];
  bindPose?: PoseState; // 可选绑定姿势
};

// 姿势状态（按关节名组织）
export type PoseState = Record<
  string,
  {
    position?: [number, number];
    rotation?: number;
    scale?: [number, number];
  }
>;

export interface ICharacterGraphicAttribute extends IGraphicAttribute {
  skeletonData?: SkeletonDefinition; // 骨骼定义
  defaultPose?: PoseState; // 默认姿势
  characterDefinition?: CharacterDefinition;
  width: number;
  height: number;
}

/**
 * 骨骼关节的位置：定义关节在骨骼层级中的初始位置，是骨骼系统的基础结构。
 * PoseState：用于动画或手动调整关节的位置、旋转和缩放，是动态的状态变化。
 * parts的offset：针对特定部件相对于关节的局部调整，解决图形与骨骼的对齐问题。
 */

export interface ICharacterGraphic extends Graphic<ICharacterGraphicAttribute> {
  skeletonRoot: ISkeletonJoint;
  currentPose: PoseState;
  skeletonRootGraphic: IGroup;
  getPartsMap: () => Map<string, CharacterPart>;
  addPart: (name: string, partDef: PartDefinition) => void;
  getPart: (name: string) => CharacterPart | null;
  removePart: (name: string) => void;
  getJoint: (name: string) => ISkeletonJoint | null;
  setJointPosition: (name: string, x: number, y: number) => void;
  playPoseAnimation: (targetPose: PoseState, duration?: number, easing?: string) => void;
  playMorphAnimation: (partName: string, targetState: string, duration: number) => void;
  playMotionAnimation: (partName: string) => void;
  createAnimationGroup: (config: {
    pose?: { targetPose: PoseState; duration: number };
    morphs?: Array<{ part: string; state: string; duration: number }>;
    motions?: string[];
  }) => void;
  stopAnimation: (partName: string) => void;
  stopAllAnimations: () => void;
  loadFromDefinition: (definition: CharacterDefinition) => void;
  toDefinition: () => CharacterDefinition;
}

export interface ISkeletonJoint {
  name: string;
  position: [number, number];
  rotation: number;
  scale: [number, number];
  width: number;
  height: number;
  updateWorldTransforms: (parentMatrix?: IMatrix) => void;
  getWorldTransform: () => IMatrix;
  getLocalTransform: () => IMatrix;
  setPosition: (x: number, y: number) => void;
  setRotation: (rotation: number) => void;
  setScale: (x: number, y: number) => void;
  addChild: (joint: ISkeletonJoint) => void;
  parent: ISkeletonJoint | null;
  findJoint: (name: string, recursive?: boolean) => ISkeletonJoint | null;
  setPivot: (x: number, y: number) => void;
  release: () => void;
}

// 类型补充
export type CharacterPart = {
  name: string;
  graphic: Graphic;
  joint: ISkeletonJoint;
  offset?: {
    position?: [number, number];
    rotation?: number;
    scale?: [number, number];
  };
};

export interface CharacterPartConfig {
  /**
   * 绑定的骨骼关节名称
   */
  joint: string;

  /**
   * 图形类型
   */
  graphicType: 'rect' | 'circle' | 'path' | 'symbol';

  /**
   * 相对于关节的本地变换
   */
  localTransform?: {
    /** 偏移量（相对于关节原点） */
    translate?: [number, number];
    /** 附加旋转（弧度） */
    rotate?: number;
    /** 缩放因子 */
    scale?: [number, number];
  };

  /**
   * 图形样式属性
   */
  style: Record<string, any>;
}

/**
 * 角色配置定义
 */
export interface CharacterDefinition {
  // 角色基本信息
  name: string;
  description?: string;

  // 骨骼系统定义
  skeleton: SkeletonDefinition;

  // 默认姿势
  defaultPose: PoseState;

  // 部件定义
  parts: PartDefinition[];

  // 预定义的姿势集合
  poses?: Record<string, PoseState>;

  // 高级动画配置
  animations?: AdvancedAnimationConfig;
}

/**
 * 部件定义
 */
export interface PartDefinition {
  // 部件名称
  name: string;

  // 绑定的关节名称
  jointName: string;

  // 图形定义
  graphic: {
    // 图形类型 (rect, circle, path 等)
    type: string;
    // 图形属性
    attributes: Record<string, any>;
  };

  // 相对于关节的局部偏移
  offset?: {
    position?: [number, number];
    rotation?: number;
    scale?: [number, number];
  };

  // 形变配置
  morph?: {
    states: { [key: string]: string }; // 状态名到路径数据的映射
    defaultState: string; // 默认状态
  };
}

/**
 * 形变配置
 */
export interface MorphConfig {
  states: Record<string, string>; // 状态名到路径数据的映射
  defaultState: string;
}

/**
 * 运动配置
 */
export interface MotionConfig {
  path: string;
  duration: number;
  loop?: boolean;
  followPath?: boolean; // 是否跟随路径方向
}

/**
 * 高级动画配置
 */
export interface AdvancedAnimationConfig {
  // 形变动画配置
  morphs?: Record<string, MorphConfig>;
  // 运动动画配置
  motions?: Record<string, MotionConfig>;
}

/**
 * 动画状态基类
 */
export interface AnimationState {
  isPlaying: boolean;
  progress: number;
  duration: number;
}

/**
 * 形变动画状态
 */
export interface MorphState extends AnimationState {
  targetPath: string;
  weight: number;
}

/**
 * 运动动画状态
 */
export interface MotionState extends AnimationState {
  path: string;
  position: [number, number];
  rotation?: number;
  followPath: boolean;
}

/**
 * 骨骼动画状态
 */
export interface SkeletonState extends AnimationState {
  fromPose: PoseState;
  toPose: PoseState;
  currentPose: PoseState;
}

export interface HumanPartDefinition {
  jointName: string;
  graphic: {
    type: string;
    attributes: {
      radius?: number;
      width?: number;
      height?: number;
      fill: string;
      cornerRadius?: number;
      stroke?: string;
      lineWidth?: number;
    };
  };
  offset?: {
    position: [number, number];
  };
}
