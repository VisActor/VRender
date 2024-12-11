import type { Dict, LooseFunction } from '@visactor/vutils';
import { EventEmitter, Logger, isBoolean, isFunction, isObject } from '@visactor/vutils';
import { Generator } from '../common/generator';
import type { INode, IGroup } from '../interface';

export class Node extends EventEmitter<any, any> implements INode {
  parent: any;
  declare name: string;
  declare id: string | number;

  declare _uid: number;
  _prev?: INode;
  _next?: INode;
  protected _firstChild: INode | null;
  protected _lastChild: INode | null;
  protected _idMap?: Map<number, INode>;
  protected _count: number;
  // protected _dirty?: boolean; // dirty表示属性是否有修改
  protected _structEdit?: boolean; // 树的结构是否发生修改
  protected _nodeList?: INode[]; // 用于有顺序的插入（正常情况用不到）

  declare _ignoreWarn?: boolean;

  get previousSibling(): INode | null {
    return this._prev;
  }

  get nextSibling(): INode | null {
    return this._next;
  }

  get children(): INode[] {
    return this.getChildren();
  }
  get firstChild(): INode | null {
    return this._firstChild;
  }
  get lastChild(): INode | null {
    return this._lastChild;
  }
  get count(): number {
    return this._count;
  }
  get childrenCount(): number {
    if (!this._idMap) {
      return 0;
    }
    return this._idMap.size;
  }
  // get dirty(): boolean {
  //   return !!this._dirty;
  // }

  constructor() {
    super();
    this._uid = Generator.GenAutoIncrementId();
    this._firstChild = null;
    this._lastChild = null;
    this.parent = null;
    this._count = 1;
  }

  forEachChildren<T extends INode = INode>(cb: (item: T, index: number) => void | boolean, reverse: boolean = false) {
    if (reverse) {
      let child = this._lastChild;
      let i = 0;
      while (child) {
        const breakTag = cb(child as T, i++);
        if (breakTag) {
          return;
        }
        child = child._prev;
      }
    } else {
      let child = this._firstChild;
      let i = 0;
      while (child) {
        const breakTag = cb(child as T, i++);
        if (breakTag) {
          return;
        }
        child = child._next;
      }
    }
  }

  async forEachChildrenAsync<T extends INode = INode>(
    cb: (item: T, index: number) => Promise<void | boolean> | void | boolean,
    reverse: boolean = false
  ) {
    if (reverse) {
      let child = this._lastChild;
      let i = 0;
      while (child) {
        let breakTag = cb(child as T, i++);
        if ((breakTag as any).then) {
          breakTag = await breakTag;
        }
        if (breakTag) {
          return;
        }
        child = child._prev;
      }
    } else {
      let child = this._firstChild;
      let i = 0;
      while (child) {
        let breakTag = cb(child as T, i++);
        if ((breakTag as any).then) {
          breakTag = await breakTag;
        }
        if (breakTag) {
          return;
        }
        child = child._next;
      }
    }
  }

  forEach<T extends INode = INode>(cb: (item: T, index: number) => void): void {
    return this.forEachChildren<T>(cb);
  }

  /**
   * 方法将一个节点附加到指定父节点的子节点列表的末尾处。
   * 如果将被插入的节点已经存在于当前文档的文档树中，那么 appendChild() 只会将它从原先的位置移动到新的位置（不需要事先移除要移动的节点）。
   * 不能append父级元素
   * @param node 要插入的节点
   */
  appendChild(node: INode, highPerformance: boolean = true): INode | null {
    if (this._uid === node._uid) {
      return null;
    }
    if (!highPerformance && node.isAncestorsOf(this)) {
      throw new Error('【Node::appendChild】不能将父辈元素append为子元素');
    }

    // 清理该节点的上次关系
    node.parent && node.parent.removeChild(node);
    node.parent = this as unknown as Node;

    if (!this._lastChild) {
      this._firstChild = this._lastChild = node;
      node._prev = node._next = null;
    } else {
      this._lastChild._next = node;
      node._prev = this._lastChild;
      this._lastChild = node;
    }
    if (!this._idMap) {
      this._idMap = new Map();
    }
    this._idMap.set(node._uid, node);

    this.setCount(node.count);

    this._structEdit = true;
    return node;
  }

  /**
   * 方法将一个节点数组附加到指定父节点的子节点列表的末尾处。
   * 不会判断元素是否是自身以及是否是父元素或者是否是其他节点的子元素
   * @param nodes 要插入的节点数组
   */
  appendChildArrHighPerformance(nodes: INode[], replace: boolean = false): INode[] | null {
    console.error('暂不支持该函数');

    return nodes;
  }

  /**
   * 方法在参考节点之前插入一个拥有指定父节点的子节点。
   * 如果给定的子节点是对文档中现有节点的引用，
   * insertBefore() 会将其从当前位置移动到新位置（在将节点附加到其他节点之前，不需要从其父节点删除该节点）。
   * 不能insert父级元素
   * @param newNode 要插入的节点
   * @param referenceNode 插入到referenceNode之前
   */
  insertBefore(newNode: INode, referenceNode: INode | undefined): INode | null {
    if (!referenceNode) {
      return this.appendChild(newNode);
    }
    if (this === newNode || newNode === referenceNode) {
      return null;
    }
    if (newNode.isAncestorsOf(this)) {
      throw new Error('【Node::insertBefore】不能将父辈元素insert为子元素');
    }
    if (referenceNode.parent !== (this as unknown as Node)) {
      return null;
    }

    newNode.parent && newNode.parent.removeChild(newNode);
    newNode.parent = this as unknown as Node;

    newNode._prev = referenceNode._prev;
    if (!referenceNode._prev) {
      this._firstChild = newNode;
    } else {
      referenceNode._prev._next = newNode;
    }
    referenceNode._prev = newNode;
    newNode._next = referenceNode;
    if (!this._idMap) {
      this._idMap = new Map();
    }
    this._idMap.set(newNode._uid, newNode);

    this._structEdit = true;
    this.setCount(newNode.count);

    return newNode;
  }

  /**
   * 方法在参考节点之后插入一个拥有指定父节点的子节点。
   * 如果给定的子节点是对文档中现有节点的引用，
   * insertAfter() 会将其从当前位置移动到新位置（在将节点附加到其他节点之前，不需要从其父节点删除该节点）。
   * 不能insert父级元素
   * @param newNode 要插入的节点
   * @param referenceNode 插入到referenceNode之后
   */
  insertAfter(newNode: INode, referenceNode: INode | undefined): INode | null {
    if (!referenceNode) {
      return this.appendChild(newNode);
    }
    if (this === newNode || newNode === referenceNode) {
      return null;
    }
    if (newNode.isAncestorsOf(this)) {
      throw new Error('【Node::insertAfter】不能将父辈元素insert为子元素');
    }
    if (referenceNode.parent !== (this as unknown as Node)) {
      return null;
    }

    newNode.parent && newNode.parent.removeChild(newNode);
    newNode.parent = this as unknown as Node;

    if (!referenceNode._next) {
      this._lastChild = newNode;
    } else {
      referenceNode._next._prev = newNode;
      newNode._next = referenceNode._next;
    }
    referenceNode._next = newNode;
    newNode._prev = referenceNode;
    if (!this._idMap) {
      this._idMap = new Map();
    }
    this._idMap.set(newNode._uid, newNode);

    this._structEdit = true;
    this.setCount(newNode.count);

    return newNode;
  }

  /**
   * 方法在参考节点之前插入一个拥有指定父节点的子节点。
   * 如果给定的子节点是对文档中现有节点的引用，
   * insertBefore() 会将其从当前位置移动到新位置（在将节点附加到其他节点之前，不需要从其父节点删除该节点）。
   * 不能insert父级元素
   * @param newNode 要插入的节点
   * @param referenceNode 插入到referenceNode之前
   */
  insertInto(newNode: INode, idx: number): INode | null {
    if (!this._ignoreWarn && this._nodeList) {
      Logger.getInstance().warn('insertIntoKeepIdx和insertInto混用可能会存在错误');
    }
    if (idx >= this.childrenCount) {
      return this.appendChild(newNode);
    }
    if (this === newNode) {
      return null;
    }
    if (newNode.isAncestorsOf(this)) {
      throw new Error('【Node::insertBefore】不能将父辈元素insert为子元素');
    }

    newNode.parent && newNode.parent.removeChild(newNode);
    newNode.parent = this as unknown as Node;

    if (idx === 0) {
      newNode._next = this._firstChild;
      this._firstChild && (this._firstChild._prev = newNode);
      newNode._prev = null;
      this._firstChild = newNode;
    } else {
      let child = this._firstChild;
      for (let i = 0; i < idx; i++) {
        if (!child) {
          return null;
        }
        if (i > 0) {
          child = child._next;
        }
      }
      if (!child) {
        return null;
      }
      newNode._next = child._next;
      newNode._prev = child;
      child._next = newNode;
      if (newNode._next) {
        newNode._next._prev = newNode;
      }
    }
    if (!this._idMap) {
      this._idMap = new Map();
    }
    this._idMap.set(newNode._uid, newNode);

    // // 预期不会执行
    // if (idx === this.childrenCount) {
    //   this._lastChild = newNode;
    // }
    this._structEdit = true;
    this.setCount(newNode.count);

    return newNode;
  }

  /**
   * 相比于insertInto，会保持idx顺序，举例：
   * 先插入idx：6的元素，再插入idx：2的元素，此时idx：2的元素会放置在idx为6的元素之前
   */
  insertIntoKeepIdx(newNode: INode, idx: number): INode | null {
    if (!this._nodeList) {
      this._nodeList = this.children;
    }
    // 如果这个位置有了，那就将这个位置之前的元素向后移动
    if (this._nodeList[idx]) {
      const node = this._nodeList[idx];
      this._nodeList.splice(idx, 0, newNode);
      return this.insertBefore(newNode, node);
    }
    // 查找idx之前的元素，插入到其后面
    this._nodeList[idx] = newNode;
    let node: INode | undefined;
    for (let i = idx - 1; i >= 0; i--) {
      node = this._nodeList[i];
      if (node) {
        break;
      }
    }
    if (node) {
      return node._next ? this.insertBefore(newNode, node._next) : this.appendChild(newNode);
    }
    this._ignoreWarn = true;
    const data = this.insertInto(newNode, 0);
    this._ignoreWarn = false;
    return data;
  }

  /**
   * 方法从DOM中删除一个子节点。返回删除的节点。
   * @param child 要删除的子节点
   */
  removeChild(child: INode): INode | null {
    if (!this._idMap) {
      return null;
    }
    if (!this._idMap.has(child._uid)) {
      return null;
    }
    this._idMap.delete(child._uid);
    if (this._nodeList) {
      // 找到idx
      const idx = this._nodeList.findIndex(n => n === child);
      if (idx >= 0) {
        this._nodeList.splice(idx, 1);
      }
    }

    if (!child._prev) {
      this._firstChild = child._next;
    } else {
      child._prev._next = child._next;
    }
    if (child._next) {
      child._next._prev = child._prev;
    } else {
      this._lastChild = child._prev;
    }

    // 重置属性
    child.parent = null;
    child._prev = null;
    child._next = null;

    this._structEdit = true;
    this.setCount(-child.count);

    return child;
  }

  /**
   * 从当前节点的父节点删除当前节点
   */
  delete() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  /**
   * 删除所有的孩子节点
   */
  removeAllChild(deep?: boolean) {
    if (!this._idMap) {
      return;
    }
    if (this._nodeList) {
      this._nodeList.length = 0;
    }
    let child = this._firstChild;
    while (child) {
      const next = child._next;
      child.parent = null;
      //   child._rootNode = child;
      child._prev = null;
      child._next = null;
      child = child._next;
      child = next;
    }

    this._firstChild = null;
    this._lastChild = null;
    this._idMap.clear();

    this._structEdit = true;
    this.setCount(-this._count + 1);
  }

  /**
   * 方法用指定的节点替换当前节点的一个子节点，并返回被替换掉的节点。
   * 如果该节点已经存在于DOM树中，则它首先会被从原始位置删除。
   * 不能replace父级元素
   * @param newChild 新节点
   * @param oldChild 旧节点
   */
  replaceChild(newChild: INode, oldChild: INode): INode | null {
    throw new Error('暂不支持');
  }

  /**
   * 根据自定义逻辑查找元素，返回单一图形元素
   * @param callback 自定义查找过滤器
   * @param deep 是否进行深度查找，默认为 false
   * @returns 返回匹配的图形元素
   */
  find<T extends INode = INode>(callback: (node: T, index: number) => boolean, deep: boolean = false): T | null {
    let target: T | null = null;
    this.forEachChildren((node: T, index: number) => {
      if (node !== (this as unknown as INode) && callback(node, index)) {
        target = node;
        return true; // 提前退出循环
      }
      return false;
    });

    if (deep) {
      this.forEachChildren(child => {
        if ((child as IGroup).isContainer) {
          const node = (child as IGroup).find(callback, true) as T;
          if (node) {
            target = node;
            return true; // 提前退出循环
          }
        }
        return false;
      });
    }

    return target;
  }

  /**
   * 根据自定义逻辑查找元素，返回匹配的元素集合
   * @param callback 自定义查找过滤器
   * @param deep 是否进行深度查找，默认为 false
   * @returns 返回匹配的图形元素集合
   */
  findAll<T extends INode = INode>(callback: (node: T, index: number) => boolean, deep: boolean = false): T[] {
    let nodes: T[] = [];
    this.forEachChildren((node: T, index) => {
      if (node !== (this as unknown as INode) && callback(node, index)) {
        nodes.push(node);
      }
    });

    if (deep) {
      this.forEachChildren(child => {
        if ((child as IGroup).isContainer) {
          const targets = (child as IGroup).findAll(callback, true) as T[];
          if (targets.length) {
            nodes = nodes.concat(targets);
          }
        }
      });
    }
    return nodes;
  }

  /**
   * 通过用户设置的 id 查找对应的图形元素
   * @param id 子节点的 id
   */
  getElementById(id: string | number): INode | null {
    return this.find(node => node.id === id, true);
  }

  /**
   * @alias getElementById
   * 通过用户设置的 id 查找对应的图形元素
   * @param id 子节点的 id
   */
  findChildById(id: string | number): INode | null {
    return this.getElementById(id);
  }

  /**
   * 通过内部生成的节点 id：_uid 查找对应的图形元素
   * @param id 子节点的key
   */
  findChildByUid(uid: number): INode | null {
    if (!this._idMap) {
      return null;
    }
    return this._idMap.get(uid) || null;
  }

  /**
   * 根据用户传入的 name 查找元素，返回匹配的元素集合
   * @param name 用户设置的图形名称
   * @returns 匹配 name 的元素集合
   */
  getElementsByName(name: string) {
    return this.findAll(node => node.name === name, true);
  }

  /**
   * @alias getElementsByName
   * 根据用户传入的 name 查找元素，返回匹配的元素集合
   * @param name 用户设置的图形名称
   * @returns 匹配 name 的元素集合
   */
  findChildrenByName(name: string) {
    return this.getElementsByName(name);
  }
  /**
   * 根据用户传入的 type 查找元素，返回匹配的元素集合
   * @param type 用户设置的图形类型
   * @returns 匹配 type 的元素集合
   */
  getElementsByType(type: string) {
    return this.findAll(node => node.type === type, true);
  }

  /**
   * 根据名字查找元素，只返回第一个查找到的元素
   * @deprecated 待 vis-component & chartspace 修改之后删除
   * @param name
   * @param deep
   * @returns
   */
  getChildByName(name: string, deep: boolean = false) {
    return this.find(node => node.name === name, deep);
  }

  getChildAt(idx: number): INode | null {
    let c = this._firstChild;
    if (!c) {
      return null;
    }
    for (let i = 0; i < idx; i++) {
      if (!c._next) {
        return null;
      }
      c = c._next;
    }
    return c;
  }

  at(idx: number): INode | null {
    return this.getChildAt(idx);
  }

  /**
   * 返回的是一个布尔值，来表示传入的节点是否为该节点的后代节点。
   * @param node 判断是否包含的节点
   */
  containNode(node: INode): boolean {
    if (!this._idMap) {
      return false;
    }
    if (this._idMap.has(node._uid)) {
      return true;
    }
    let child = this._firstChild;
    while (child) {
      if (child.containNode(node)) {
        return true;
      }
      child = child._next;
    }
    return false;
  }

  /**
   * 方法返回上下文中的根节点，不常用
   */
  getRootNode(): INode {
    let parent = this.parent;
    while (parent?.parent) {
      parent = parent.parent;
    }
    return parent || this;
  }

  /**
   * 方法返回一个布尔值,表明当前节点是否包含有子节点.
   */
  hasChildNodes(): boolean {
    return this._firstChild !== null;
  }

  /* 语法糖 */
  addChild(node: INode): INode | null {
    return this.appendChild(node);
  }
  add(node: INode): INode | null {
    return this.appendChild(node);
  }
  getChildren(): INode[] {
    const nodes: INode[] = [];
    let child = this._firstChild;
    while (child) {
      nodes.push(child);
      child = child._next;
    }
    return nodes;
  }

  /**
   * 判断该节点是否是node的子节点
   * @param node
   */
  isChildOf(node: INode): boolean {
    if (!this.parent) {
      return false;
    }
    return this.parent._uid === node._uid;
  }

  /**
   * 判断该节点是否是node的父节点
   * @param node
   */
  isParentOf(node: INode): boolean {
    return node.isChildOf(this);
  }

  /**
   * 判断节点是否是node的后代节点
   * @param node
   */
  isDescendantsOf(node: INode): boolean {
    let parent = this.parent;
    if (!parent) {
      return false;
    }
    do {
      if (parent._uid === node._uid) {
        return true;
      }
      parent = parent.parent;
    } while (parent !== null);

    return false;
  }

  /**
   * 判断节点是否是node的祖先节点
   * @param node
   */
  isAncestorsOf(node: INode): boolean {
    return node.isDescendantsOf(this);
  }

  getAncestor(idx: number): INode {
    throw new Error('暂不支持');
  }

  /**
   * 设置该节点的所有后代节点某个属性
   * @param propsName 属性名
   * @param propsValue 属性值
   */
  setAllDescendantsProps(propsName: string, propsValue: any) {
    let child = this._firstChild;
    while (child) {
      (child as any)[propsName] = propsValue;
      child.setAllDescendantsProps(propsName, propsValue);
      child = child._next;
    }
  }
  /**
   * 设置当前节点的count属性，会更改父节点的count属性
   * @param deltaCount delta count
   */
  private setCount(deltaCount: number): void {
    this._count += deltaCount;
    let parent = this.parent;
    if (!parent) {
      return;
    }
    do {
      parent._count += deltaCount;
      parent = parent.parent;
    } while (parent !== null);
  }

  clone(): INode {
    throw new Error('暂不支持');
  }

  /**
   * clone to node
   * @param node
   */
  cloneTo(node: INode): void {
    throw new Error('暂不支持');
  }

  /***************语法糖***************/
  getParent(): INode | null {
    return this.parent;
  }

  del(child: INode): INode | null {
    return this.removeChild(child);
  }

  // 事件相关别名
  /**
   *  @alias on
   * @param type
   * @param listener
   * @param options
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | LooseFunction,
    options?: AddEventListenerOptions | boolean
  ) {
    const capture =
      (isBoolean(options, true) && options) || (isObject(options) && (options as AddEventListenerOptions).capture);
    const once = isObject(options) && (options as AddEventListenerOptions).once;
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? (listener as LooseFunction) : (listener as EventListenerObject).handleEvent;

    if (once) {
      super.once(type, listener, context);
    } else {
      super.on(type, listener, context);
    }
    return this;
  }

  on(
    type: string,
    listener: EventListenerOrEventListenerObject | LooseFunction,
    options?: AddEventListenerOptions | boolean
  ) {
    return this.addEventListener(type, listener, options);
  }

  /**
   * @alias off
   * @param type
   * @param listener
   * @param options
   * @returns
   */
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | LooseFunction,
    options?: AddEventListenerOptions | boolean
  ) {
    const capture =
      (isBoolean(options, true) && options) || (isObject(options) && (options as AddEventListenerOptions).capture);
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? (listener as LooseFunction) : (listener as EventListenerObject).handleEvent;

    const once = isObject(options) && (options as AddEventListenerOptions).once;
    super.off(type, listener, context, once);

    return this;
  }

  /**
   * @alias off
   * @param type
   * @param listener
   * @param options
   * @returns
   */
  off(
    type: string,
    listener: EventListenerOrEventListenerObject | LooseFunction,
    options?: AddEventListenerOptions | boolean
  ) {
    return this.removeEventListener(type, listener, options);
  }

  once(
    type: string,
    listener: EventListenerOrEventListenerObject | LooseFunction,
    options?: AddEventListenerOptions | boolean
  ) {
    if (isObject(options)) {
      options.once = true;
      return this.addEventListener(type, listener, options);
    }
    return this.addEventListener(type, listener, { once: true });
  }

  removeAllEventListeners() {
    super.removeAllListeners();
    return this;
  }

  removeAllListeners(): this {
    return this.removeAllEventListeners();
  }

  dispatchEvent(event: any, ...args: any) {
    super.emit(event.type, event, ...args);
    return !event.defaultPrevented;
  }

  emit(event: any, data?: Dict<any>) {
    return this.dispatchEvent(event, data);
  }

  release() {
    // 卸载事件
    this.removeAllListeners();
  }
}
