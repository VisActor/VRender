import { graphicCreator, createGlyph, createText, createShadowRoot } from '@visactor/vrender';
// eslint-disable-next-line no-duplicate-imports
import type { IStage, IGraphic, IGroup, ILayer, IGlyph, IShadowRoot } from '@visactor/vrender';
import React from 'react';
import ReactReconciler from 'react-reconciler';
// eslint-disable-next-line no-duplicate-imports
import type { OpaqueHandle } from 'react-reconciler';
import { DefaultEventPriority } from 'react-reconciler/constants';
import { bindGraphicEvent, splitProps, updateProps } from './processProps';
import type {
  ChildSet,
  Container,
  HostContext,
  HydratableInstance,
  Instance,
  NoTimeout,
  Props,
  PublicInstance,
  SuspenseInstance,
  TextInstance,
  TimeoutHandle,
  Type,
  UpdatePayload
} from './types';
import { log, error } from './util/debug';

declare const process: any;

const isStage = (instance: Instance): instance is IStage => {
  return (instance as any).stage === instance;
};

const isLayer = (instance: Instance): instance is ILayer => {
  return (instance as any).layer === instance;
};

const isGlyph = (instance: Instance): instance is IGlyph => {
  return (instance as any).type === 'glyph';
};

const isShadowRoot = (instance: Instance): instance is IShadowRoot => {
  return (instance as any).type === 'shadowroot';
};

export const createInstance = (type: Type, props: Props, rootContainerInstance?: Container) => {
  const graphicType = (type as string).toLowerCase();
  const { graphicProps, eventProps } = splitProps(props);

  let instance: Instance;

  if (graphicType === 'glyph') {
    instance = createGlyph(graphicProps);
  } else if (graphicType === 'layer' && rootContainerInstance) {
    instance = isStage(rootContainerInstance)
      ? rootContainerInstance.createLayer()
      : rootContainerInstance.stage
      ? rootContainerInstance.stage.createLayer()
      : null;
  } else if (graphicType === 'shadowroot') {
    instance = createShadowRoot();
  } else {
    instance = graphicCreator[graphicType](graphicProps) as IGraphic;
  }

  bindGraphicEvent(eventProps, instance);
  log('createInstance ', graphicType, instance);

  return instance;
};

const appendChild = (parentInstance: Instance, child: Instance | TextInstance) => {
  const isParentStage = isStage(parentInstance);
  const isChildLayer = isLayer(child);
  if (isParentStage && !isChildLayer && (parentInstance as IStage).defaultLayer) {
    (parentInstance as IStage).defaultLayer.appendChild(child);
  } else if (isGlyph(parentInstance)) {
    parentInstance.setSubGraphic((parentInstance.getSubGraphic() ?? []).concat(child as IGraphic));
  } else if (isShadowRoot(child)) {
    if (isParentStage) {
      error('stage can not attach shadow root');
    } else {
      (parentInstance as any).attachShadow(child as IShadowRoot);
    }
  } else {
    parentInstance.appendChild(child);
  }
};

const insertBeforeChild = (
  parentInstance: Instance,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance
) => {
  const isParentStage = isStage(parentInstance);
  const isChildLayer = isLayer(child);
  const isBeforeChildLayer = isLayer(beforeChild);

  if (isParentStage) {
    if (!isChildLayer && !isBeforeChildLayer) {
      if ((parentInstance as IStage).defaultLayer) {
        (parentInstance as IStage).defaultLayer.insertBefore(child, beforeChild);
      } else {
        error('default layer has been removed ');
      }
    } else if (isChildLayer && isBeforeChildLayer) {
      (parentInstance as IStage).insertBefore(child, beforeChild);
    }
  } else if (!isParentStage && isChildLayer) {
    error(`layer can not be inserted into other graphic: ${parentInstance.type}`);
  } else if (isGlyph(parentInstance)) {
    const prevSubGraphics = parentInstance.getSubGraphic();
    const index = prevSubGraphics.indexOf(child as IGraphic);
    const beforeIndex = prevSubGraphics.indexOf(beforeChild as IGraphic);

    if (index >= 0 && beforeIndex >= 0 && index !== beforeIndex) {
      const newSubGraphics: IGraphic[] = prevSubGraphics.slice();
      newSubGraphics[beforeIndex] = child as IGraphic;
      newSubGraphics[index] = beforeChild as IGraphic;

      parentInstance.setSubGraphic(newSubGraphics);
    }
  } else {
    parentInstance.insertBefore(child, beforeChild);
  }
};

const removeChild = (parentInstance: Instance, child: Instance | TextInstance) => {
  const isParentStage = isStage(parentInstance);
  const isChildLayer = isLayer(child);

  if (isParentStage && !isChildLayer && (parentInstance as IStage).defaultLayer) {
    (parentInstance as IStage).defaultLayer.removeChild(child);
  } else if (isGlyph(parentInstance)) {
    const prevSubGraphics = parentInstance.getSubGraphic();
    const index = prevSubGraphics.indexOf(child as IGraphic);

    if (index >= 0) {
      parentInstance.setSubGraphic([...prevSubGraphics.slice(0, index - 1), ...prevSubGraphics.slice(index + 1)]);
    }
  } else if (isShadowRoot(child)) {
    if (isParentStage) {
      error('stage can not attach shadow root');
    } else {
      (parentInstance as any).detachShadow(child as IShadowRoot);
    }
  } else {
    parentInstance.removeChild(child);
  }
};

const clearContainer = (container: Container) => {
  if (isStage(container)) {
    if (container.defaultLayer) {
      container.defaultLayer.removeAllChild();
    }

    while (container.childrenCount > 1) {
      container.removeChild(container.getChildAt(1));
    }
  } else {
    container.removeAllChild();
  }
};

export const reconcilor = ReactReconciler<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
>({
  getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    return instance;
  },
  getRootHostContext(rootContainerInstance: Container): HostContext {
    return;
  },
  getChildHostContext(parentHostContext: HostContext, type: Type, rootContainerInstance: Container): HostContext {
    return;
  },

  prepareForCommit(containerInfo: Container): Record<string, any> {
    return null;
  },
  resetAfterCommit(containerInfo: Container): void {
    return;
  },
  preparePortalMount(containerInfo: Container): void {
    return;
  },

  createInstance(
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle
  ): Instance {
    return createInstance(type, props, rootContainerInstance);
  },
  appendInitialChild(parentInstance: Instance, child: Instance | TextInstance): void {
    log('appendInitialChild', parentInstance, child);

    appendChild(parentInstance, child);
  },
  finalizeInitialChildren(
    parentInstance: Instance,
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext
  ): boolean {
    return false;
  },

  prepareUpdate(
    instance: Instance,
    type: Type,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext
  ): null | UpdatePayload {
    return true;
  },

  shouldSetTextContent(type: Type, props: Props): boolean {
    return false;
  },

  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle
  ): TextInstance {
    return createText({ text });
  },

  scheduleTimeout(handler: (...args: any[]) => void, timeout: number): TimeoutHandle | NoTimeout {
    return;
  },
  cancelTimeout(handle: TimeoutHandle | NoTimeout): void {
    return;
  },
  noTimeout: undefined,

  getCurrentEventPriority() {
    return DefaultEventPriority;
  },

  getInstanceFromNode(node: any): ReactReconciler.Fiber {
    throw new Error('Not implemented.');
  },

  beforeActiveInstanceBlur(): void {
    return;
  },

  isPrimaryRenderer: false,

  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    log('appendChild');
    appendChild(parentInstance, child);
  },
  appendChildToContainer(container: Container, child: Instance | TextInstance): void {
    log('appendChildToContainer', container, child);

    appendChild(container, child);
  },
  commitTextUpdate(textInstance: TextInstance, oldText: string, newText: string): void {
    return;
  },
  commitMount(instance: Instance, type: Type, newProps: Props, internalInstanceHandle: OpaqueHandle): void {
    return;
  },
  commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: Type,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle
  ): void {
    log('commitUpdate', instance, newProps);
    updateProps(instance, newProps, oldProps);
  },
  insertBefore(parentInstance: Instance, child: Instance | TextInstance, beforeChild: Instance | TextInstance): void {
    insertBeforeChild(parentInstance, child, beforeChild);
  },
  insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance
  ): void {
    insertBeforeChild(container, child, beforeChild);
  },
  removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
    log('removeChild', parentInstance, child);
    removeChild(parentInstance, child);
  },
  removeChildFromContainer(container: Container, child: Instance | TextInstance): void {
    removeChild(container, child);
  },
  resetTextContent(instance: Instance): void {
    return;
  },

  // tslint:enable:max-line-length
  hideInstance(instance: Instance): void {
    return;
  },

  hideTextInstance(textInstance: TextInstance): void {
    return;
  },

  unhideInstance(instance: Instance, props: Props): void {
    return;
  },

  unhideTextInstance(textInstance: TextInstance, text: string): void {
    return;
  },

  clearContainer(container: Container): void {
    clearContainer(container);
  },

  cloneInstance(
    instance: Instance,
    updatePayload: null | UpdatePayload,
    type: Type,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle,
    keepChildren: boolean,
    recyclableInstance: Instance
  ): Instance {
    return instance;
  },

  createContainerChildSet(container: Container): ChildSet {
    return;
  },

  appendChildToContainerChildSet(childSet: ChildSet, child: Instance | TextInstance): void {
    return;
  },
  finalizeContainerChildren(container: Container, newChildren: ChildSet): void {
    return;
  },

  replaceContainerChildren(container: Container, newChildren: ChildSet): void {
    return;
  },

  canHydrateInstance(instance: HydratableInstance, type: Type, props: Props): null | Instance {
    return instance;
  },
  canHydrateTextInstance(instance: HydratableInstance, text: string): null | TextInstance {
    return null;
  },
  getNextHydratableSibling(instance: Instance | TextInstance | HydratableInstance): null | HydratableInstance {
    return;
  },
  getFirstHydratableChild(parentInstance: Instance | Container): null | HydratableInstance {
    return;
  },
  hydrateInstance(
    instance: Instance,
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle
  ): null | UpdatePayload {
    return;
  },
  hydrateTextInstance(textInstance: TextInstance, text: string, internalInstanceHandle: OpaqueHandle): boolean {
    return false;
  },
  didNotMatchHydratedContainerTextInstance(parentContainer: Container, textInstance: TextInstance, text: string): void {
    return;
  },
  didNotMatchHydratedTextInstance(
    parentType: Type,
    parentProps: Props,
    parentInstance: Instance,
    textInstance: TextInstance,
    text: string
  ): void {
    return;
  },
  didNotHydrateContainerInstance(parentContainer: Container, instance: Instance | TextInstance): void {
    return;
  },
  didNotHydrateInstance(
    parentType: Type,
    parentProps: Props,
    parentInstance: Instance,
    instance: Instance | TextInstance
  ): void {
    return;
  },
  didNotFindHydratableContainerInstance(parentContainer: Container, type: Type, props: Props): void {
    return;
  },
  didNotFindHydratableContainerTextInstance(parentContainer: Container, text: string): void {
    return;
  },
  didNotFindHydratableInstance(
    parentType: Type,
    parentProps: Props,
    parentInstance: Instance,
    type: Type,
    props: Props
  ): void {
    return;
  },
  didNotFindHydratableTextInstance(parentType: Type, parentProps: Props, parentInstance: Instance, text: string): void {
    return;
  },
  afterActiveInstanceBlur() {
    return;
  },
  prepareScopeUpdate() {
    return;
  },
  getInstanceFromScope(): Instance {
    return null;
  },
  detachDeletedInstance() {
    return;
  }
});

reconcilor.injectIntoDevTools({
  // findFiberByHostInstance: () => {},

  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  version: React.version,
  rendererPackageName: 'react-g',
  rendererConfig: {
    getInspectorDataForViewTag: (tag: number) => {
      // eslint-disable-next-line no-console
      console.log(tag);
    }
  }
});

/**
 * render react-vrender component to target vrender group/stage/layer
 * 将react-vrender组件渲染到group,stage, layer中
 * @param component react-g component
 * @param target g element, Canvas/Group/Shape instance
 * @param callback callback after render finished
 * @returns void
 */
export const render = (component: React.ReactNode, target: IStage | IGroup, callback?: (() => void) | null) => {
  const container = (reconcilor as any).createContainer(target as any, 1, false, null);
  reconcilor.updateContainer(component, container, null, callback);
};
