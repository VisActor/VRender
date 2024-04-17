import {
  registerArc,
  registerGroup,
  registerImage,
  registerLine,
  registerPolygon,
  registerSymbol
} from '@visactor/vrender-kits';
import { loadTagComponent } from '../tag/register';
import { loadArcSegmentComponent, loadSegmentComponent } from '../segment/register';
import { MarkLine } from './line';
import { MarkArcLine } from './arc-line';
import { markArcAreaAnimate, markAreaAnimate, commonMarkLineAnimate, markPointAnimate } from './animate/animate';
import { MarkArea } from './area';
import { MarkArcArea } from './arc-area';
import { MarkPoint } from './point';
function loadBaseMarker() {
  registerGroup();
  loadTagComponent();
}

export function loadMarkLineComponent() {
  loadBaseMarker();
  loadSegmentComponent();
}

export function loadMarkArcLineComponent() {
  loadBaseMarker();
  loadArcSegmentComponent();
}

export function loadMarkAreaComponent() {
  loadBaseMarker();
  registerPolygon();
}

export function loadMarkArcAreaComponent() {
  loadBaseMarker();
  registerArc();
}

export function loadMarkPointComponent() {
  loadBaseMarker();
  loadSegmentComponent();
  registerSymbol();
  registerImage();
  registerLine();
}

export function registerMarkLineAnimate() {
  MarkLine._animate = commonMarkLineAnimate;
}

export function registerMarkArcLineAnimate() {
  MarkArcLine._animate = commonMarkLineAnimate;
}

export function registerMarkAreaAnimate() {
  MarkArea._animate = markAreaAnimate;
}

export function registerMarkArcAreaAnimate() {
  MarkArcArea._animate = markArcAreaAnimate;
}

export function registerMarkPointAnimate() {
  MarkPoint._animate = markPointAnimate;
}
