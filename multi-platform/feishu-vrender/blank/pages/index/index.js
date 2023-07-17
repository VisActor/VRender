Page({
  data: {
    gallaryData: [
      { name: 'area', image: 'area.png' },
      { name: 'rect', image: 'bar.png' },
      { name: 'line', image: 'line.png' },
      { name: 'arc', image: 'pie.png' },
      { name: 'symbol', image: 'scatter.png' },
      { name: 'text', image: 'wordcloud.png' },
    ]
  },
  // 事件处理函数
  bindViewTap(e, a) {
    const name = e.currentTarget.id;
    tt.navigateTo({
      url: `../gallery/pages/gallary?name=${name}`
    });
  },
  onLoad() {
    
  },
})
