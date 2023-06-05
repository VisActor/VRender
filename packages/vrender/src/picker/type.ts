import { IGraphic, IGroup } from '../interface';

export type PickResult = {
  graphic: IGraphic | null;
  group: IGroup | null;
};
