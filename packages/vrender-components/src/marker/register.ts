import { registerArc } from '@visactor/vrender-kits/register/register-arc';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerImage } from '@visactor/vrender-kits/register/register-image';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerPolygon } from '@visactor/vrender-kits/register/register-polygon';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { loadTagComponent } from '../tag/register';
import { loadArcSegmentComponent, loadSegmentComponent } from '../segment/register';
import { registerAnimate } from '@visactor/vrender-animate/register';
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
