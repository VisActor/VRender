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
import { registerAnimate } from '@visactor/vrender-animate';
function loadBaseMarker() {
  registerGroup();
  loadTagComponent();
  registerAnimate();
}

export function loadMarkLineComponent() {
  loadBaseMarker();
  loadSegmentComponent();
  registerAnimate();
}

export function loadMarkArcLineComponent() {
  loadBaseMarker();
  loadArcSegmentComponent();
  registerAnimate();
}

export function loadMarkAreaComponent() {
  loadBaseMarker();
  registerPolygon();
  registerAnimate();
}

export function loadMarkArcAreaComponent() {
  loadBaseMarker();
  registerArc();
  registerAnimate();
}

export function loadMarkPointComponent() {
  loadBaseMarker();
  loadSegmentComponent();
  loadArcSegmentComponent();
  registerSymbol();
  registerImage();
  registerLine();
  registerAnimate();
}
