/**
 * @description 组件基类
 */
import type { IGroupGraphicAttribute, ISetAttributeContext } from '@visactor/vrender-core';
import { Group, CustomEvent } from '@visactor/vrender-core';
import type { Dict } from '@visactor/vutils';
import { merge, isFunction, isPlainObject, isNil } from '@visactor/vutils';
import type { ComponentOptions } from '../interface';

const GROUP_ATTRIBUTES = [
  'x',
  'y',
  'dx',
  'dy',
  'scaleX',
  'scaleY',
  'angle',
  'anchor',
  'postMatrix',
  'visible',
  'clip',
  'pickable',
  'childrenPickable',
  'zIndex',
  'cursor'
];

export abstract class AbstractComponent<T extends IGroupGraphicAttribute = IGroupGraphicAttribute> extends Group {
  declare attribute: Partial<T>;

  protected mode?: '2d' | '3d';

  protected skipDefault?: boolean;

  constructor(attributes: T, options?: ComponentOptions) {
    super(attributes);

    if (options?.mode) {
      this.mode = options.mode;

      this.setMode(options.mode);
    }

    if (options?.skipDefault) {
      this.skipDefault = true;
    }
    // 组件需要精准 bounds，所以将这个 strokeBoundsBuffer 设置为 0，否则会影响包围盒的获取
    this.setTheme({
      common: {
        strokeBoundsBuffer: 0
      }
    });
    this.attribute = attributes;
    // 这里调用渲染和事件绑定逻辑
    this.onSetStage(() => {
      this.render();
      this.bindEvents();
    });
  }

  /**
   * @override
   * 更新单个属性值
   * @param key
   * @param value
   * @param forceUpdateTag
   */
  setAttribute(key: string, value: any, forceUpdateTag?: boolean | undefined, context?: ISetAttributeContext): void {
    const params =
      this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate({ [key]: value }, this.attribute, key, context);
    if (params) {
      return this._setAttributes(params as Partial<T>, forceUpdateTag);
    }

    // overwrite when previous or next attribute is function
    if (
      isPlainObject(this.attribute[key]) &&
      isPlainObject(value) &&
      !isFunction(this.attribute[key]) &&
      !isFunction(value)
    ) {
      merge(this.attribute[key], value);
    } else {
      this.attribute[key] = value;
    }

    // HACK: 待优化
    if (!GROUP_ATTRIBUTES.includes(key as string)) {
      this.render();
    }

    this.valid = this.isValid();
    if (!this.updateShapeAndBoundsTagSetted() && (forceUpdateTag || this.needUpdateTag(key as string))) {
      this.addUpdateShapeAndBoundsTag();
    } else {
      this.addUpdateBoundTag();
    }
    this.addUpdatePositionTag();
    this.onAttributeUpdate();
  }

  setAttributes(params: Partial<T>, forceUpdateTag?: boolean | undefined, context?: ISetAttributeContext): void {
    params =
      (this.onBeforeAttributeUpdate &&
        (this.onBeforeAttributeUpdate(params, this.attribute, null, context) as Partial<T>)) ||
      params;
    return this._setAttributes(params, forceUpdateTag);
  }

  // @ts-ignore
  _setAttributes(params: Partial<T>, forceUpdateTag?: boolean | undefined): void {
    const keys = Object.keys(params) as (keyof T)[];
    this._mergeAttributes(params, keys);

    // HACK: 待优化
    if (!keys.every(key => GROUP_ATTRIBUTES.includes(key as string))) {
      this.render();
    }

    this.valid = this.isValid();
    // 没有设置shape&bounds的tag
    if (!this.updateShapeAndBoundsTagSetted() && (forceUpdateTag || this.needUpdateTags(keys as string[]))) {
      this.addUpdateShapeAndBoundsTag();
    } else {
      this.addUpdateBoundTag();
    }
    this.addUpdatePositionTag();
    this.onAttributeUpdate();
  }

  protected _mergeAttributes(params: Partial<T>, keys?: (keyof T)[]) {
    if (isNil(keys)) {
      keys = Object.keys(params) as (keyof T)[];
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof Partial<T>;
      // overwrite when previous or next attribute is function
      if (isPlainObject(this.attribute[key]) && !isFunction(this.attribute[key]) && !isFunction(params[key])) {
        merge(this.attribute[key], params[key]);
      } else {
        this.attribute[key] = params[key];
      }
    }
  }

  protected bindEvents() {
    // please override
  }

  protected abstract render(): void;

  // 图形元素 id
  protected _getNodeId(id: string) {
    return `${this.id ?? this._uid}-${this.name}-${id}`;
  }

  // 用于 emit 组件自己的事件
  protected _dispatchEvent(eventName: string, details?: Dict<any>) {
    // 封装事件
    const changeEvent = new CustomEvent(eventName, details);
    // FIXME: 需要在 vrender 的事件系统支持
    // @ts-ignore
    changeEvent.manager = this.stage?.eventSystem.manager;

    this.dispatchEvent(changeEvent);
  }
}
