import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { EmptyTip, TableSeriesNumber } from '../../../src';

export function run() {
  const tableSeriesNumber: TableSeriesNumber = new TableSeriesNumber({
    rowCount: 10,
    columnCount: 10
  });

  const stage = render(tableSeriesNumber, 'main');
}
