// import {
//   ICircleGraphicAttribute,
//   ILineGraphicAttribute,
//   ISymbolGraphicAttribute,
//   ITextGraphicAttribute,
//   IRectGraphicAttribute,
//   IPathGraphicAttribute,
//   IArcGraphicAttribute,
//   IAreaGraphicAttribute,
//   IGroupGraphicAttribute,
//   IPolygonGraphicAttribute
// } from '../../interface';
// import { DefaultCircleAttribute } from '../circle';
// import { DefaultLineAttribute } from '../line';
// import { DefaultRectAttribute } from '../rect';
// import { DefaultSymbolAttribute } from '../symbol';
// import { DefaultTextAttribute } from '../text';
// import { DefaultPathAttribute } from '../path';
// import { DefaultArcAttribute } from '../arc';
// import { DefaultAreaAttribute } from '../area';
// import { DefaultGroupAttribute } from '../group';
// import { DefaultPolygonAttribute } from '../polygon';
// import { DEFAULT_THEME_ID, ITheme, IThemeService } from './theme-service';

// @injectable()
// export class DefaultTheme implements ITheme {
//   readonly id: string;
//   circleAttribute: Required<ICircleGraphicAttribute>;
//   textAttribute: Required<ITextGraphicAttribute>;
//   symbolAttribute: Required<ISymbolGraphicAttribute>;
//   lineAttribute: Required<ILineGraphicAttribute>;
//   rectAttribute: Required<IRectGraphicAttribute>;
//   pathAttribute: Required<IPathGraphicAttribute>;
//   arcAttribute: Required<IArcGraphicAttribute>;
//   groupAttribute: Required<IGroupGraphicAttribute>;
//   areaAttribute: Required<IAreaGraphicAttribute>;
//   polygonAttribute: Required<IPolygonGraphicAttribute>;

//   constructor() {
//     this.id = DEFAULT_THEME_ID;
//     this.circleAttribute = { ...DefaultCircleAttribute };
//     this.textAttribute = { ...DefaultTextAttribute };
//     this.symbolAttribute = { ...DefaultSymbolAttribute };
//     this.lineAttribute = { ...DefaultLineAttribute };
//     this.rectAttribute = { ...DefaultRectAttribute };
//     this.pathAttribute = { ...DefaultPathAttribute };
//     this.arcAttribute = { ...DefaultArcAttribute };
//     this.areaAttribute = { ...DefaultAreaAttribute };
//     this.groupAttribute = { ...DefaultGroupAttribute };
//     this.polygonAttribute = { ...DefaultPolygonAttribute };
//   }

//   configure(themeService: IThemeService) {
//     themeService.register(this);
//   }

//   activate(): void {
//     return;
//   }
//   deactivate(): void {
//     return;
//   }
// }
