const CanvasPkg = require('canvas');
const { global, createStage, container, Path, Arc, Rect, Symbol, Circle, Image } = require('@visactor/vrender');
// const { nodeLoader, roughModule } = require('@visactor/vrender-kits');
const fs = require('fs');

const colorPools = [
  'aliceblue',
  'antiquewhite',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue'
];

// 加载node环境的loader
// nodeLoader(container);
// 加载rough的module
// container.load(roughModule)

global.setEnv('node', CanvasPkg);

function run() {
  const stage = createStage({ width: 0, height: 0, title: '这是title', dpr: 2 });
  stage.resize(1200, 1200)
  stage.defaultLayer.add(new Path({
    x: 200,
    y: 200,
    path: 'M50,0A50,50,0,1,1,-50,0A50,50,0,1,1,50,0', // circle
    fill: colorPools[Math.floor(Math.random() * colorPools.length)],
    scaleX: 2,
    scaleY: 2,
    lineWidth: 2
  }));
  stage.defaultLayer.add(new Arc({
    innerRadius: 30,
    outerRadius: 50,
    startAngle: -Math.PI / 4,
    endAngle: (3 * Math.PI) / 2,
    x: 200,
    y: 500,
    fill: colorPools[Math.floor(Math.random() * colorPools.length)],
    lineWidth: 2
  }));
  stage.defaultLayer.add(new Circle({
    startAngle: 0,
    endAngle: Math.PI * 2,
    radius: 50,
    x: 600,
    y: 200,
    fill: colorPools[10],
    // stroke: 'red',
    lineWidth: 2
  }));
  stage.defaultLayer.add(new Rect({
    x: 600,
    y: 500,
    width: 100,
    height: 50,
    fill: colorPools[10],
    // stroke: 'red',
    lineWidth: 2
  }));
  stage.defaultLayer.add(new Symbol({
    x: 800,
    y: 300,
    symbolType: 'cross',
    size: 60,
    fill: colorPools[10],
    // stroke: 'red',
    lineWidth: 2
  }));

  stage.render();
  // console.log(stage.window);

  // setTimeout(() => {
    // TODO 增加资源加载完成回调
    const buffer = stage.window.getImageBuffer();
    fs.writeFileSync(`./image.png`, buffer);
  // }, 1000);
}

run();
