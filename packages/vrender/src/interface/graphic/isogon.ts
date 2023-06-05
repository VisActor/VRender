import type { IGraphicAttribute, IGraphic } from '../graphic';

// 正多边形
export type IIsogonAttribute = {
  radius: number;
  edgeNumber: number; // 边数
};

export type IIsogonGraphicAttribute = Partial<IGraphicAttribute> & Partial<IIsogonAttribute>;

export type IIsogon = IGraphic<IIsogonGraphicAttribute>;
