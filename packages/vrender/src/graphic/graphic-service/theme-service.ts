// import { inject, injectable, named, postConstruct } from 'inversify';
// import { ContributionProvider } from '../../common/contribution-provider';
// import {
//   ICircleGraphicAttribute,
//   ILineGraphicAttribute,
//   IPathGraphicAttribute,
//   IRectGraphicAttribute,
//   ISymbolGraphicAttribute,
//   ITextGraphicAttribute,
//   IArcGraphicAttribute,
//   IAreaGraphicAttribute,
//   IGroupGraphicAttribute,
//   IPolygonGraphicAttribute
// } from '../../interface';

// export interface ITheme {
//   readonly id: string;
//   circleAttribute: Required<ICircleGraphicAttribute>;
//   textAttribute: Required<ITextGraphicAttribute>;
//   symbolAttribute: Required<ISymbolGraphicAttribute>;
//   lineAttribute: Required<ILineGraphicAttribute>;
//   areaAttribute: Required<IAreaGraphicAttribute>;
//   rectAttribute: Required<IRectGraphicAttribute>;
//   pathAttribute: Required<IPathGraphicAttribute>;
//   arcAttribute: Required<IArcGraphicAttribute>;
//   groupAttribute: Required<IGroupGraphicAttribute>;
//   polygonAttribute: Required<IPolygonGraphicAttribute>;

//   configure: (themeService: IThemeService) => void;

//   activate: () => void;
//   deactivate: () => void;
// }

// export const Theme = Symbol.for('Theme');

// export const DEFAULT_THEME_ID = 'DEFAULT_THEME_ID';

// export interface IThemeService {
//   register: (theme: ITheme) => void;
//   getThemes: () => ITheme[];

//   getTheme: (themeId: string) => ITheme;

//   setCurrentTheme: (themeId: string) => void;

//   getCurrentTheme: () => ITheme;

//   defaultTheme: ITheme;

//   reset: () => void;
// }

// export const ThemeServce = Symbol.for('ThemeServce');

// @injectable()
// export class DefaultThemeService implements IThemeService {
//   protected themeMap: Record<string, ITheme> = {};
//   protected activeTheme?: ITheme;

//   constructor(
//     @inject(ContributionProvider)
//     @named(Theme)
//     protected readonly contributions: IContributionProvider<ITheme>
//   ) {}

//   @postConstruct()
//   init() {
//     this.contributions.getContributions().forEach(theme => {
//       theme.configure(this);
//     });
//     this.setCurrentTheme(this.defaultTheme.id);
//   }

//   register(theme: ITheme) {
//     this.themeMap[theme.id] = theme;
//   }
//   getThemes(): ITheme[] {
//     return Object.keys(this.themeMap).map(k => this.themeMap[k]);
//   }

//   getTheme(themeId: string): ITheme {
//     return this.themeMap[themeId];
//   }

//   setCurrentTheme(themeId: string): void {
//     this.activeTheme = this.themeMap[themeId] || this.defaultTheme;
//   }

//   getCurrentTheme(): ITheme {
//     return this.activeTheme as ITheme;
//   }

//   get defaultTheme(): ITheme {
//     return this.themeMap[DEFAULT_THEME_ID];
//   }

//   reset(): void {
//     this.setCurrentTheme(this.defaultTheme.id);
//   }
// }
