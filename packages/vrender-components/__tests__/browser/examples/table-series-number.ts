import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { EmptyTip, SeriesNumberEvent, TableSeriesNumber } from '../../../src';

export function run() {
  const tableSeriesNumber: TableSeriesNumber = new TableSeriesNumber(
    {
      rowCount: 100,
      colCount: 100
    },
    { initRenderAll: true }
  );
  window.tableSeriesNumber = tableSeriesNumber;
  const stage = render(tableSeriesNumber, 'main');
  tableSeriesNumber.on(SeriesNumberEvent.seriesNumberCellClick, e => {
    console.log(SeriesNumberEvent.seriesNumberCellClick, e);
  });
  tableSeriesNumber.on(SeriesNumberEvent.seriesNumberCellHover, e => {
    console.log(SeriesNumberEvent.seriesNumberCellHover, e);
  });
  tableSeriesNumber.on(SeriesNumberEvent.seriesNumberCellUnHover, e => {
    console.log(SeriesNumberEvent.seriesNumberCellUnHover, e);
  });
}
