import { registerCircle } from '@visactor/vrender-kits/register/register-circle';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerPath } from '@visactor/vrender-kits/register/register-path';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerRichtext } from '@visactor/vrender-kits/register/register-richtext';
import { registerText } from '@visactor/vrender-kits/register/register-text';
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
