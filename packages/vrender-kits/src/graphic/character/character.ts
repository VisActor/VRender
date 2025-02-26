import {
  Circle,
  Generator,
  getTheme,
  Graphic,
  GRAPHIC_UPDATE_TAG_KEY,
  NOWORK_ANIMATE_ATTR,
  Rect,
  Symbol,
  createGroup
} from '@visactor/vrender-core';
import type {
  IGraphic,
  IGraphicAttribute,
  IRectGraphicAttribute,
  ITextGraphicAttribute,
  IPathGraphicAttribute,
  IImageGraphicAttribute,
  ISymbolGraphicAttribute,
  IGroupGraphicAttribute,
  IGroup,
  ICircleGraphicAttribute
} from '@visactor/vrender-core';
import type {
  CharacterDefinition,
  CharacterPart,
  ICharacterGraphic,
  ICharacterGraphicAttribute,
  ISkeletonJoint,
  PartDefinition,
  PoseState,
  SkeletonDefinition
} from './interface';
import { SkeletonJoint } from './skeleton-joint';
import { min, type IAABBBounds } from '@visactor/vutils';
import { AnimationManager } from './animation-manager';
import { SkeletonAnimation } from './animations/skeleton-animation';
import { MorphAnimation } from './animations/morph-animation';
import { MotionAnimation } from './animations/motion-animation';
import type { EasingType } from '@visactor/vrender-core';

const CHARACTER_UPDATE_TAG_KEY = ['x', 'y', 'scaleX', 'scaleY', 'rotation', ...GRAPHIC_UPDATE_TAG_KEY];

export const CHARACTER_NUMBER_TYPE = Generator.GenAutoIncrementId();

export class Character extends Graphic<ICharacterGraphicAttribute> implements ICharacterGraphic {
  type: 'character' = 'character';
  protected _skeletonRoot: ISkeletonJoint;
  protected _parts: Map<string, CharacterPart> = new Map();
  protected _currentPose: PoseState;
  protected _definition?: CharacterDefinition;
  protected _poses: Record<string, PoseState> = {};
  protected _animationManager: AnimationManager;

  declare attribute: ICharacterGraphicAttribute;

  static NOWORK_ANIMATE_ATTR = {
    skeletonData: 1,
    defaultPose: 1,
    characterDefinition: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  get skeletonRoot(): ISkeletonJoint {
    return this._skeletonRoot;
  }

  get currentPose(): PoseState {
    return this._currentPose;
  }
  set currentPose(pose: PoseState) {
    this._currentPose = pose;
    this.applyPose(pose);
  }

  getPartsMap(): Map<string, CharacterPart> {
    return this._parts;
  }

  constructor(params: ICharacterGraphicAttribute) {
    super(params);
    this.numberType = CHARACTER_NUMBER_TYPE;

    if (params.characterDefinition) {
      this.loadFromDefinition(params.characterDefinition);
    } else {
      // 初始化骨骼系统
      this._initSkeleton(params.skeletonData);
      this._currentPose = params.defaultPose ?? params.skeletonData?.bindPose;
      this.applyPose(this._currentPose);
    }

    // 初始化动画管理器
    this._animationManager = new AnimationManager(this, params.characterDefinition?.animations);
    this.valid = this.isValid();
  }

  getGraphicTheme(): Required<ICharacterGraphicAttribute> {
    return getTheme(this).rect as any;
  }

  getCurrentPose(): PoseState {
    return this._currentPose;
  }

  // region 骨骼初始化
  protected _initSkeleton(skeletonDef?: SkeletonDefinition) {
    if (!skeletonDef) {
      return;
    }

    // 创建关节映射表
    const jointMap = new Map<string, SkeletonJoint>();

    // 第一遍创建所有关节
    skeletonDef.joints.forEach(jointDef => {
      const joint = new SkeletonJoint(
        jointDef.name,
        jointDef.position ?? [0, 0],
        jointDef.rotation ?? 0,
        jointDef.scale ?? [1, 1],
        jointDef.pivot ?? [0, 0],
        jointDef.width ?? 0,
        jointDef.height ?? 0
      );
      if (jointDef.pivot) {
        joint.setPivot(jointDef.pivot[0], jointDef.pivot[1]);
      }
      jointMap.set(jointDef.name, joint);

      // 找到root节点并设置为骨骼根节点
      if (jointDef.name === 'root') {
        this._skeletonRoot = joint;
      }
    });
    // 第二遍建立父子关系
    skeletonDef.joints.forEach(jointDef => {
      const current = jointMap.get(jointDef.name);
      if (current) {
        if (jointDef.parent) {
          const parent = jointMap.get(jointDef.parent);
          if (parent) {
            parent.addChild(current);
          } else {
            console.warn(`Parent joint ${jointDef.parent} not found`);
          }
        }
      } else {
        console.warn(`Joint ${jointDef.name} not found`);
      }
    });

    // 如果没有找到root节点，创建一个默认的
    if (!this._skeletonRoot) {
      this._skeletonRoot = new SkeletonJoint('root', [0, 0], 0, [1, 1]);
      console.warn('No root joint found in skeleton definition, created a default one');
    }

    // 更新所有关节的世界变换
    this._skeletonRoot.updateTransforms();

    this._initSkeletonGraphic(this._skeletonRoot);
  }

  protected _initSkeletonGraphic(skeletonJoint: ISkeletonJoint, parentGraphic?: IGroup) {
    const { position = [0, 0], rotation = 0, scale = [1, 1] } = skeletonJoint;
    const graphic = createGroup({
      x: position[0],
      y: position[1],
      angle: rotation,
      scaleX: scale[0],
      scaleY: scale[1],
      width: 0.003,
      height: 0.003,
      fill: 'red'
    });
    graphic.name = skeletonJoint.name;
    skeletonJoint.setGraphic(graphic);
    parentGraphic?.add(graphic);
    skeletonJoint.getChildren().forEach(child => {
      this._initSkeletonGraphic(child, graphic);
    });
  }

  // region 姿势管理
  applyPose(pose?: PoseState) {
    if (!pose) {
      return;
    }

    Object.entries(pose).forEach(([jointName, state]) => {
      const joint = this.getJoint(jointName);
      if (!joint) {
        console.warn(`Joint ${jointName} not found when applying pose`);
        return;
      }

      // 增量更新关节参数
      if (state.position) {
        joint.setPosition(...state.position);
      }
      if (state.rotation !== undefined) {
        joint.setRotation(state.rotation);
      }
      if (state.scale) {
        joint.setScale(...state.scale);
      }

      joint.applyUpdate(false);
    });
  }

  /**
   * 添加可替换部件（从部件定义）
   */
  addPart(name: string, partDef: PartDefinition) {
    const joint = this.skeletonRoot.findJoint(partDef.jointName);
    if (!joint) {
      throw new Error(`Joint ${partDef.jointName} not found`);
    }

    // 创建图形实例
    let graphic: Graphic;
    switch (partDef.graphic.type) {
      case 'rect':
        graphic = new Rect({
          width: joint.width,
          height: joint.height,
          ...partDef.graphic.attributes
        } as IRectGraphicAttribute);
        break;
      case 'circle':
        graphic = new Circle({
          radius: min(joint.width, joint.height) / 2,
          ...(partDef.graphic.attributes as ICircleGraphicAttribute)
        });
        break;
      case 'symbol':
        graphic = new Symbol({
          size: [joint.width, joint.height],
          ...(partDef.graphic.attributes as ISymbolGraphicAttribute)
        });
        break;
      default:
        console.warn(`Unsupported graphic type: ${partDef.graphic.type}`);
        return;
    }
    // 获取当前joint的graphic，将part添加上去
    const group = joint.getGraphic();
    group.add(graphic);

    // 初始化图形位置
    this._applyJointTransform(graphic, joint, partDef.offset);

    this._parts.set(name, { name, graphic, joint, offset: partDef.offset });
  }

  /**
   * 应用骨骼变换到具体图形
   */
  protected _applyJointTransform(
    graphic: Graphic,
    joint: ISkeletonJoint,
    offset?: {
      position?: [number, number];
      rotation?: number;
      scale?: [number, number];
    }
  ) {
    // 进行局部偏移
    if (offset) {
      const { position = [0, 0], rotation = 0, scale = [1, 1] } = offset;
      graphic.setAttributes({
        x: position[0],
        y: position[1],
        angle: rotation,
        scaleX: scale[0],
        scaleY: scale[1]
      });
    }
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Character.NOWORK_ANIMATE_ATTR;
  }

  protected updateAABBBounds(
    attribute: ICharacterGraphicAttribute,
    theme: Required<ICharacterGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean
  ): IAABBBounds {
    aabbBounds.clear();
    // this._parts.forEach(part => {
    //   aabbBounds.union(part.graphic.AABBBounds);
    // });
    const { x, y, width, height } = this.attribute;
    aabbBounds.setValue(x, y, x + width, y + height);
    return aabbBounds;
  }

  // region 骨骼操作
  getJoint(name: string): ISkeletonJoint | null {
    return this._skeletonRoot.findJoint(name);
  }

  setJointPosition(name: string, x: number, y: number) {
    const joint = this.getJoint(name);
    if (joint) {
      joint.setPosition(x, y);
    }
  }
  getPart(name: string): CharacterPart | null {
    return this._parts.get(name) ?? null;
  }

  removePart(name: string) {
    const part = this._parts.get(name);
    if (part) {
      this._parts.delete(name);
      part.joint.release();
    }
  }

  /**
   * 播放姿势动画
   */
  playPoseAnimation(targetPose: PoseState, duration: number = 1000, easing: EasingType = 'linear') {
    const animation = new SkeletonAnimation(this, targetPose, duration, easing);
    return this.animate().play(animation);
  }

  /**
   * 播放形变动画
   */
  playMorphAnimation(partName: string, targetState: string, duration: number) {
    const part = this.getPart(partName);
    if (!part) {
      console.warn(`Part not found: ${partName}`);
      return;
    }
    const config = this._definition?.animations?.morphs?.[partName];
    if (!config) {
      console.warn(`No morph animation config found for part: ${partName}`);
      return;
    }
    const animation = new MorphAnimation(this, partName, config);
    part.graphic.animate().play(animation);
  }

  /**
   * 播放运动动画
   */
  playMotionAnimation(partName: string) {
    const part = this.getPart(partName);
    if (!part) {
      console.warn(`Part not found: ${partName}`);
      return;
    }
    const config = this._definition?.animations?.motions?.[partName];
    if (!config) {
      console.warn(`No motion animation config found for part: ${partName}`);
      return;
    }
    const animation = new MotionAnimation(this, partName, config);
    part.graphic.animate().play(animation);
  }

  /**
   * 创建动画组合
   */
  createAnimationGroup(config: {
    pose?: { targetPose: PoseState; duration: number };
    morphs?: Array<{ part: string; state: string; duration: number }>;
    motions?: string[];
  }) {
    // 播放骨骼动画
    if (config.pose) {
      this.playPoseAnimation(config.pose.targetPose, config.pose.duration);
    }

    // 播放形变动画
    if (config.morphs) {
      config.morphs.forEach(({ part, state, duration }) => {
        this.playMorphAnimation(part, state, duration);
      });
    }

    // 播放运动动画
    if (config.motions) {
      config.motions.forEach(part => {
        this.playMotionAnimation(part);
      });
    }
  }

  /**
   * 停止指定部件的动画
   */
  stopAnimation(partName: string) {
    const part = this.getPart(partName);
    if (part) {
      part.graphic.animate().stop();
    }
  }

  /**
   * 停止所有动画
   */
  stopAllAnimations() {
    this.animate().stop();
    this._parts.forEach(part => {
      part.graphic.animate().stop();
    });
  }
  // endregion

  // region 属性更新
  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, CHARACTER_UPDATE_TAG_KEY);
  }

  setAttribute(key: string, value: any, force?: boolean) {
    super.setAttribute(key, value, force);

    // 全局属性变化时更新子部件
    if (['fill', 'stroke', 'opacity'].includes(key)) {
      this._parts.forEach(part => {
        if (!(part.graphic.attribute as any)[key]) {
          part.graphic.setAttribute(key, value);
        }
      });
    }
  }
  // endregion

  // region 渲染相关
  isValid(): boolean {
    // 至少包含一个有效部件
    let valid = false;
    if (!(this._parts && this._parts.size)) {
      return false;
    }
    this._parts.forEach(part => {
      if (part.graphic.isValid()) {
        valid = true;
      }
    });
    return valid && super.isValid();
  }
  // endregion

  release() {
    // 销毁所有子部件
    this._parts.forEach(part => {
      part.graphic.release();
    });
    this._parts.clear();

    // 停止动画
    this._animationManager.release();

    super.release();
  }

  clone(): Character {
    return this;
  }

  /**
   * 从配置加载角色
   */
  loadFromDefinition(definition: CharacterDefinition) {
    this._definition = definition;

    // 初始化骨骼系统
    this._initSkeleton(definition.skeleton);

    // 加载预定义姿势
    if (definition.poses) {
      this._poses = definition.poses;
    }

    // 设置并应用默认姿势
    this._currentPose = definition.defaultPose;
    this.applyPose(this._currentPose);

    // 创建并添加部件
    definition.parts.forEach(partDef => {
      this.addPart(partDef.name, partDef);
    });
  }

  /**
   * 切换到预定义姿势
   */
  switchToPose(poseName: string, duration: number = 1000) {
    const pose = this._poses[poseName];
    if (!pose) {
      console.warn(`Pose not found: ${poseName}`);
      return;
    }

    this.playPoseAnimation(pose, duration);
  }

  /**
   * 循环切换到预定义姿势
   * @param poseName 预定义姿势名称
   * @param duration 动画持续时间
   * @param options 动画选项
   */
  switchToPoseWithLoop(
    poseName: string,
    duration: number = 1000,
    options: {
      loops?: number; // 循环次数
      alternate?: boolean; // 是否交替反向播放
      easing?: EasingType; // 缓动函数
      onComplete?: () => void; // 完成回调
    } = {}
  ) {
    const pose = this._poses[poseName];
    if (!pose) {
      console.warn(`Pose not found: ${poseName}`);
      return;
    }

    return this._animationManager.playLoopPoseAnimation(pose, duration, options);
  }

  /**
   * 导出角色定义
   */
  toDefinition(): CharacterDefinition {
    const parts: PartDefinition[] = [];

    this._parts.forEach((part, name) => {
      parts.push({
        name,
        jointName: part.joint.name,
        graphic: {
          type: part.graphic.type,
          attributes: { ...part.graphic.attribute }
        },
        offset: part.offset
      });
    });

    return {
      name: this.name || 'unnamed_character',
      skeleton: this.attribute.skeletonData,
      defaultPose: this._currentPose,
      parts,
      poses: this._poses
    };
  }
}

export function createCharacter(attributes: ICharacterGraphicAttribute): Character {
  return new Character(attributes);
}
