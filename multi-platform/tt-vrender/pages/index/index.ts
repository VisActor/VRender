const app = getApp();

Page({
  data: {
    gallaryData: [
      { name: 'area', image: 'area.png' },
      { name: 'rect', image: 'bar.png' },
      { name: 'line', image: 'line.png' },
      { name: 'arc', image: 'pie.png' },
      { name: 'symbol', image: 'scatter.png' },
      { name: 'text', image: 'wordcloud.png' },
      { name: 'image', image: 'indicator.png' }
    ]
  },
  // 事件处理函数
  bindViewTap(e: any, a: any) {
    const name = e.currentTarget.id;
    tt.navigateTo({
      url: `../gallery/pages/gallary?name=${name}`
    });
  },
  onLoad() {}
});
