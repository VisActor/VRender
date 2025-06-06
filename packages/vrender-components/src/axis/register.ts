import {
  registerCircle,
  registerGroup,
  registerLine,
  registerPath,
  registerRect,
  registerRichtext,
  registerText
} from '@visactor/vrender-kits';
import { registerAxisAnimate } from '../animation/axis-animate';

function loadBasicAxis() {
  registerGroup();
  registerLine();
  registerRichtext();
  registerText();
  registerAxisAnimate();
}

export function loadLineAxisComponent() {
  loadBasicAxis();
  registerRect();
}

export function loadCircleAxisComponent() {
  loadBasicAxis();
  registerCircle();
}

export function loadLineAxisGridComponent() {
  registerGroup();
  registerPath();
}

export function loadCircleAxisGridComponent() {
  registerGroup();
  registerPath();
}
