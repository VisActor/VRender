import type { IEventElement, Releaseable } from './common';

export interface INode extends Releaseable, IEventElement {
  _prev?: INode;
  _next?: INode;
  /**
   * 内部图形的唯一标识
   */
  _uid: number;

  /**
   * 用户配置的图形唯一标识
   */
  id?: number | string;
  /** 图形名称标识 */
  name?: string;
  /**
   * 图形类型
   */
  type?: string;
  parent: INode | null;
  // dirty: boolean; // 脏位，标记当前节点和子节点是否有修改
  count: number;
  childrenCount: number;
  firstChild: INode | null;
  lastChild: INode | null;
  /**
   * 获取子节点数组
   */
  getChildren: () => INode[];
  /**
   * 获取某个idx的节点
   */
  getChildAt: (idx: number) => INode | null;
  at: (idx: number) => INode | null;

  insertBefore: (newNode: INode, referenceNode: INode) => INode | null;
  insertAfter: (newNode: INode, referenceNode: INode) => INode | null;

  /**
   * 向某个位置插入
   */
  insertInto: (ele: INode, idx: number) => INode | null;

  insertIntoKeepIdx: (ele: INode, idx: number) => INode | null;
  /**
   * 遍历子节点
   * @param cb 返回true则停止遍历
   */
  forEachChildren: (cb: (n: INode, i: number) => void | boolean, reverse?: boolean) => void;
  forEachChildrenAsync: (
    cb: (n: INode, i: number) => Promise<void | boolean> | void | boolean,
    reverse?: boolean
  ) => Promise<void>;
  /**
   * 添加子节点
   * @param node
   * @param highPerformance 是否高性能模式（不检查是否合法）
   */
  appendChild: (node: INode, highPerformance?: boolean) => INode | null;
  /**
   * 添加子节点
   * @param node
   * @param highPerformance 是否高性能模式（不检查是否合法）
   */
  add: (node: INode, highPerformance?: boolean) => INode | null;
  /**
   * 从当前节点的父节点删除当前节点
   */
  delete: () => void;
  /**
   * 删除节点
   * @param node
   * @param highPerformance 是否高性能模式（不检查是否合法）
   */
  removeChild: (node: INode, highPerformance?: boolean) => INode | null;
  /**
   * 移除所有节点
   */
  removeAllChild: (deep?: boolean) => void;
  /**
   * 判断该节点是否是node的子节点
   * @param node
   */
  isChildOf: (node: INode) => boolean;
  /**
   * 判断该节点是否是node的父节点
   * @param node
   */
  isParentOf: (node: INode) => boolean;
  /**
   * 判断节点是否是node的后代节点
   * @param node
   */
  isDescendantsOf: (node: INode) => boolean;
  /**
   * 判断节点是否是node的祖先节点
   * @param node
   */
  isAncestorsOf: (node: INode) => boolean;

  // 事件相关的别名
  /**
   * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
   * */
  dispatchEvent: (event: Event) => boolean;

  /**
   * 返回的是一个布尔值，来表示传入的节点是否为该节点的后代节点。
   * @param node 判断是否包含的节点
   */
  containNode: (node: INode) => boolean;

  /**
   * 设置该节点的所有后代节点某个属性
   * @param propsName 属性名
   * @param propsValue 属性值
   */
  setAllDescendantsProps: (propsName: string, propsValue: any) => any;

  // 查找相关的接口
  /**
   * 根据自定义逻辑查找元素，返回单一图形元素
   * @param callback 自定义查找过滤器
   * @param deep 是否进行深度查找，默认为 false
   * @returns 返回匹配的图形元素
   */
  find: (callback: (node: INode, index: number) => boolean, deep: boolean) => INode | null;
  /**
   * 根据自定义逻辑查找元素，返回匹配的元素集合
   * @param callback 自定义查找过滤器
   * @param deep 是否进行深度查找，默认为 false
   * @returns 返回匹配的图形元素集合
   */
  findAll: (callback: (node: INode, index: number) => boolean, deep: boolean) => INode[];
  /**
   * 通过用户设置的 id 查找对应的图形元素
   * @param id 子节点的 id
   */
  getElementById: (id: string | number) => INode | null;
  /**
   * @alias getElementById
   * 通过用户设置的 id 查找对应的图形元素
   * @param id 子节点的 id
   */
  findChildById: (id: string | number) => INode | null;
  /**
   * 通过内部生成的节点 id：_uid 查找对应的图形元素
   * @param id 子节点的key
   */
  findChildByUid: (uid: number) => INode | null;
  /**
   * 根据用户传入的 name 查找元素，返回匹配的元素集合
   * @param name 用户设置的图形名称
   * @returns 匹配 name 的元素集合
   */
  getElementsByName: (name: string) => INode[];
  /**
   * @alias getElementsByName
   * 根据用户传入的 name 查找元素，返回匹配的元素集合
   * @param name 用户设置的图形名称
   * @returns 匹配 name 的元素集合
   */
  findChildrenByName: (name: string) => INode[];
  /**
   * 根据用户传入的 name 查找元素，返回匹配的元素集合
   * @param name 用户设置的图形名称
   * @returns 匹配 name 的元素集合
   */
  getElementsByType: (type: string) => INode[];
  // 其他不常用
}
