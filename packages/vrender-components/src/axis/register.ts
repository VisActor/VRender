import {
  registerCircle,
  registerGroup,
  registerLine,
  registerPath,
  registerRect,
  registerRichtext,
  registerText
} from '@visactor/vrender/es/register';

function loadBasicAxis() {
  registerGroup();
  registerLine();
  registerRichtext();
  registerText();
}

export function loadLineAxis() {
  loadBasicAxis();
  registerRect();
}

export function loadCircleAxis() {
  loadBasicAxis();
  registerCircle();
}

export function loadLineAxisGrid() {
  registerGroup();
  registerPath();
}

export function loadCircleAxisGrid() {
  registerGroup();
  registerPath();
}
