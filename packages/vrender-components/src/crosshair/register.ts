// import { registerArc, registerGroup, registerLine, registerPath, registerRect } from '@visactor/vrender-kits';
import { registerArc, registerGroup, registerLine, registerPath, registerRect } from '@visactor/vrender-kits';

export function loadLineCrosshairComponent() {
  registerGroup();
  registerLine();
}

export function loadCircleCrosshairComponent() {
  registerGroup();
  registerArc();
}

export function loadPolygonCrosshairComponent() {
  registerGroup();
  registerPath();
}

export function loadRectCrosshairComponent() {
  registerGroup();
  registerRect();
}

export function loadSectorCrosshairComponent() {
  registerGroup();
  registerArc();
}

export function loadPolygonSectorCrosshairComponent() {
  registerGroup();
  registerPath();
}
