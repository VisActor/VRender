import { registerGroup, registerLine, registerPolygon, registerSymbol } from '@visactor/vrender-kits';
// import { Segment } from './segment';

// export function registerSegmentAnimate() {
//   Segment.animate = animate;
// }
// export function animate(startSymbol, endSymbol, lines) {
//   startSymbol?.setAttribute('fillOpacity', 0)
//   endSymbol?.setAttribute('fillOpacity', 0)
//   lines?.forEach(line => line.setAttribute('clipRange', 0));
//   startSymbol?.animate().to({ fillOpacity: 1 }, 100, 'linear')
//   lines?.forEach((line, index) => {
//     line.animate().wait(index * 50).to({ clipRange: 1 }, 16 * 100, 'linear')
//   });
//   endSymbol?.animate().wait(lines.length * 50 + 16 * 100).to({ fillOpacity: 1 }, 100, 'linear')
// }

export function loadSegmentComponent(enableAnimation: boolean = false) {
  registerGroup();
  registerLine();
  registerPolygon();
  registerSymbol();
}
