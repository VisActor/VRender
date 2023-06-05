import type {
  IGraphic,
  IGraphicAttribute,
  IStage,
  FederatedEvent,
  GraphicType,
  IGroup,
  ILayer,
  IGlyph
} from '@visactor/vrender';

/**
 * host config type
 */
export type Type = GraphicType | 'layer';
export interface Props extends IGraphicAttribute, VRenderEvents {
  // empty
}
export type Container = IStage | ILayer | IGroup;
export type Instance = IGraphic | IGroup | ILayer | IGlyph | IStage;
export type TextInstance = IGraphic;
export type SuspenseInstance = any;
export type HydratableInstance = any;
export type PublicInstance = any;
export type HostContext = any;
export type UpdatePayload = any;
export type ChildSet = any;
export type TimeoutHandle = any;
export type NoTimeout = any;

/**
 * event
 */
export interface VRenderEvents {
  onPointerDown?: (evt: FederatedEvent) => void;
  onPointerUp?: (evt: FederatedEvent) => void;
  onPointerUpOutside?: (evt: FederatedEvent) => void;
  onPointerTap?: (evt: FederatedEvent) => void;
  onPointerOver?: (evt: FederatedEvent) => void;
  onPointerMove?: (evt: FederatedEvent) => void;
  onPointerEnter?: (evt: FederatedEvent) => void;
  onPointerLeave?: (evt: FederatedEvent) => void;
  onPointerOut?: (evt: FederatedEvent) => void;
  onMouseDown?: (evt: FederatedEvent) => void;
  onMouseUp?: (evt: FederatedEvent) => void;
  onMouseUpOutside?: (evt: FederatedEvent) => void;
  onMouseMove?: (evt: FederatedEvent) => void;
  onMouseOver?: (evt: FederatedEvent) => void;
  onMouseOut?: (evt: FederatedEvent) => void;
  onMouseEnter?: (evt: FederatedEvent) => void;
  onMouseLeave?: (evt: FederatedEvent) => void;
  onPinch?: (evt: FederatedEvent) => void;
  onPinchStart?: (evt: FederatedEvent) => void;
  onPinchEnd?: (evt: FederatedEvent) => void;
  onPan?: (evt: FederatedEvent) => void;
  onPanStart?: (evt: FederatedEvent) => void;
  onPanEnd?: (evt: FederatedEvent) => void;
  onDrag?: (evt: FederatedEvent) => void;
  onDragStart?: (evt: FederatedEvent) => void;
  onDragEnter?: (evt: FederatedEvent) => void;
  onDragLeave?: (evt: FederatedEvent) => void;
  onDragOver?: (evt: FederatedEvent) => void;
  onDragEnd?: (evt: FederatedEvent) => void;
  onRightDown?: (evt: FederatedEvent) => void;
  onRightUp?: (evt: FederatedEvent) => void;
  onRightUpOutside?: (evt: FederatedEvent) => void;
  onTouchStart?: (evt: FederatedEvent) => void;
  onTouchEnd?: (evt: FederatedEvent) => void;
  onTouchEndOutside?: (evt: FederatedEvent) => void;
  onTouchMove?: (evt: FederatedEvent) => void;
  onTouchCancel?: (evt: FederatedEvent) => void;
  onPress?: (evt: FederatedEvent) => void;
  onPressUp?: (evt: FederatedEvent) => void;
  onPressEnd?: (evt: FederatedEvent) => void;
  onSwipe?: (evt: FederatedEvent) => void;
  onDrop?: (evt: FederatedEvent) => void;
  onWeel?: (evt: FederatedEvent) => void;
  onClick?: (evt: FederatedEvent) => void;
  onDblClick?: (evt: FederatedEvent) => void;
}
