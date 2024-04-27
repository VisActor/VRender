import { MarkArcArea } from '../arc-area';
import { markArcAreaAnimate, markAreaAnimate, markCommonLineAnimate, markPointAnimate } from '../animate/animate';
import { MarkArcLine } from '../arc-line';
import { MarkArea } from '../area';
import { MarkLine } from '../line';
import { MarkPoint } from '../point';

export function registerMarkLineAnimate() {
  MarkLine._animate = markCommonLineAnimate;
}

export function registerMarkAreaAnimate() {
  MarkArea._animate = markAreaAnimate;
}

export function registerMarkArcLineAnimate() {
  MarkArcLine._animate = markCommonLineAnimate;
}

export function registerMarkArcAreaAnimate() {
  MarkArcArea._animate = markArcAreaAnimate;
}

export function registerMarkPointAnimate() {
  MarkPoint._animate = markPointAnimate;
}
