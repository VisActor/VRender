// import { IPoint } from "@visactor/vutils";
// import { IContext2d } from "./context";
// import { IGraphicAttribute } from "./graphic";

// interface TextType {
//   text: string;
//   fontFamily: string;
//   fontSize: number;
// }

// export declare function measureText(
//   params: TextType,
//   ctx?: IContext2d
// ): { width: number; height: number };

// export * from "./graphic/bounds";

// // export type TransformType = Pick<IGraphicAttribute, 'x' | 'y' | 'scaleX' | 'scaleY' | 'angle'> & {
// //   anchor?: IGraphicAttribute['anchor'];
// // };

// // export interface Transform {
// //   init: (origin: TransformType) => Transform;
// //   translate: (x: number, y: number) => Transform;
// //   translateTo: (x: number, y: number) => Transform;
// //   scale: (sx: number, sy: number, center: IPoint) => Transform;
// //   scaleTo: (sx: number, sy: number, center: IPoint) => Transform;
// //   rotate: (rx: number, ry: number, center: IPoint) => Transform;
// //   rotateTo: (rx: number, ry: number, center: IPoint) => Transform;
// //   // 语法糖
// //   interactive: (dx: number, dy: number, dsx: number, dsy: number, drx: number, dry: number) => Transform;
// //   // 扩展padding像素，用于外描边，内描边
// //   extend: (origin: TransformType, padding: number) => Transform;
// //   // 将所有的transform生成为一次的transform
// //   simplify: (target?: TransformType) => TransformType;
// // }
