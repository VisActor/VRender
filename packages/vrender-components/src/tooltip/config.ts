import { AABBBounds } from '@visactor/vutils';
import { DEFAULT_TEXT_FONT_FAMILY } from '../constant';
import { TooltipAttributes } from './type';

export const defaultAttributes: Partial<TooltipAttributes> = {
  panel: {
    visible: true,
    borderRadius: [3, 3, 3, 3],
    fill: true,
    fillColor: 'white',
    shadow: true,
    shadowBlur: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowSpread: 0,
    stroke: true,
    strokeColor: 'white'
  },
  titleStyle: {
    value: {
      fill: true,
      fillColor: '#4E5969',
      fontFamily: DEFAULT_TEXT_FONT_FAMILY,
      fontSize: 14,
      lineHeight: 18,
      textAlign: 'left',
      textBaseline: 'middle'
    },
    spaceRow: 6
  },
  contentStyle: {
    shape: {
      fill: true,
      fillColor: 'black',
      size: 8,
      symbolType: 'circle',
      spacing: 6
    },
    key: {
      fill: true,
      fillColor: '#4E5969',
      fontFamily: DEFAULT_TEXT_FONT_FAMILY,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'left',
      textBaseline: 'middle',
      spacing: 26
    },
    value: {
      fill: true,
      fillColor: '#4E5969',
      fontFamily: DEFAULT_TEXT_FONT_FAMILY,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'right',
      textBaseline: 'middle',
      spacing: 0
    },
    spaceRow: 6
  },
  padding: 10,
  positionX: 'right',
  positionY: 'bottom',
  offsetX: 10,
  offsetY: 10,
  parentBounds: new AABBBounds().setValue(
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY
  ),
  autoCalculatePosition: true,
  autoMeasure: true,

  pickable: false,
  childrenPickable: false,
  zIndex: 500
};

export const TOOLTIP_POSITION_ATTRIBUTES = [
  'pointerX',
  'pointerY',
  'offsetX',
  'offsetY',
  'positionX',
  'positionY',
  'parentBounds'
];
