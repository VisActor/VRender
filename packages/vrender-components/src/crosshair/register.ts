import { registerArc } from '@visactor/vrender-kits/register/register-arc';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerPath } from '@visactor/vrender-kits/register/register-path';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';

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
