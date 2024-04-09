// import { merge } from '@visactor/vutils';
// import { DEFAULT_COMMON_MARK_LINE_THEME } from '../config';
// import type { PolarMarkLineAttrs } from '../type';
// import { DEFAULT_STATES } from '../../constant';
// import { BaseMarkLine } from '../base-line';
// import { loadPolarMarkLineComponent } from '../register';

// loadPolarMarkLineComponent();
// export class PolarMarkLine extends BaseMarkLine {
//   name = 'polarMarkLine';
//   static defaultAttributes: Partial<PolarMarkLineAttrs> = DEFAULT_COMMON_MARK_LINE_THEME;
//   protected isValidPoints() {
//     return true
//   }

//   protected createSegment() {
//     const {
//       center,
//       radius,
//       startAngle,
//       endAngle,
//       startSymbol,
//       endSymbol,
//       lineStyle,
//       state
//     } = this.attribute as PolarMarkLineAttrs;
//     return new ArcSegment({
//       center,
//       radius,
//       startAngle,
//       endAngle,
//       startSymbol,
//       endSymbol,
//       lineStyle,
//       state: {
//         line: merge({}, DEFAULT_STATES, state?.line),
//         startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
//         endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
//       }
//     })
//   }

//   protected setLineAttributes() {
//     const {
//       center,
//       radius,
//       startAngle,
//       endAngle,
//       startSymbol,
//       endSymbol,
//       lineStyle,
//     } = this.attribute as PolarMarkArcLineAttrs;
//     if (this._line) {
//       (this._line as any).setAttributes({
//         center,
//         radius,
//         startAngle,
//         endAngle,
//         startSymbol,
//         endSymbol,
//         lineStyle
//       });
//     }
//   }
// }
