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
  loadArcSegmentComponent();
  registerSymbol();
  registerImage();
  registerLine();
}
