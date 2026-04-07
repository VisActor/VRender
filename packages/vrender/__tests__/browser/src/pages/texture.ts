import { createStage, createSymbol, container, createArc, createRect } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);

export const page = () => {
  const shapes = [];
  const svgTexture = `<svg t="1775469608211" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1306" width="40" height="40"><path d="M478.25 655.5h90.35v237.07h-90.35z" fill="#A5855E" p-id="1307"></path><path d="M568.6 905.07h-90.35c-6.9 0-12.5-5.6-12.5-12.5V655.5c0-6.9 5.6-12.5 12.5-12.5h90.35c6.9 0 12.5 5.6 12.5 12.5v237.07c0 6.9-5.6 12.5-12.5 12.5z m-77.85-25h65.35V668h-65.35v212.07z" p-id="1308"></path><path d="M607.99 905.07H438.87c-6.9 0-12.5-5.6-12.5-12.5s5.6-12.5 12.5-12.5h169.12c6.9 0 12.5 5.6 12.5 12.5s-5.6 12.5-12.5 12.5z" p-id="1309"></path><path d="M523.43 353.39L210.74 749.95l312.69-37.16 312.69 37.16-312.69-396.56z" fill="#ABCF78" p-id="1310"></path><path d="M836.12 762.45c-0.49 0-0.98-0.03-1.48-0.09l-311.21-36.99-311.21 36.99c-5.02 0.6-9.91-1.89-12.38-6.3a12.507 12.507 0 0 1 1.09-13.85l312.69-396.56c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76l312.69 396.56a12.498 12.498 0 1 1-9.81 20.24z m-312.69-62.16c0.49 0 0.99 0.03 1.48 0.09l282.7 33.6-284.17-360.39-284.17 360.39 282.7-33.6c0.49-0.06 0.98-0.09 1.48-0.09z" p-id="1311"></path><path d="M523.43 277.55l-261 331.01 261-37.17 261 37.17-261-331.01z" fill="#C5E298" p-id="1312"></path><path d="M784.43 621.06c-0.58 0-1.17-0.04-1.77-0.13l-259.24-36.92-259.24 36.92c-5.06 0.72-10.05-1.71-12.6-6.14a12.496 12.496 0 0 1 1.02-13.98l261-331.01c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76l261 331.01c3.16 4.01 3.57 9.55 1.02 13.98a12.504 12.504 0 0 1-10.83 6.26z m-261-323.32L291.58 591.78l230.09-32.77c1.17-0.17 2.36-0.17 3.52 0l230.09 32.77-231.85-294.04z" p-id="1313"></path><path d="M523.43 210.47L327.93 458.4l195.5-37.17 195.49 37.17-195.49-247.93z" fill="#ABCF78" p-id="1314"></path><path d="M718.92 470.9c-0.77 0-1.56-0.07-2.34-0.22l-193.16-36.72-193.16 36.72c-5.12 0.97-10.31-1.34-13.02-5.79a12.5 12.5 0 0 1 0.87-14.23L513.6 202.73c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76l195.49 247.93a12.5 12.5 0 0 1 0.87 14.23 12.496 12.496 0 0 1-10.68 6.02z m-195.49-62.17c0.78 0 1.56 0.07 2.33 0.22l162.63 30.92-164.96-209.21-164.96 209.21 162.63-30.92c0.77-0.15 1.55-0.22 2.33-0.22z" p-id="1315"></path><path d="M523.43 151L378.37 334.96l145.06-37.93 145.05 37.93L523.43 151z" fill="#C5E298" p-id="1316"></path><path d="M668.48 347.47c-1.05 0-2.11-0.13-3.16-0.41l-141.9-37.11-141.9 37.11c-5.2 1.36-10.68-0.75-13.62-5.25a12.505 12.505 0 0 1 0.64-14.58L513.6 143.26c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76L678.3 327.23c3.33 4.22 3.59 10.09 0.64 14.58a12.498 12.498 0 0 1-10.46 5.66z m-145.05-62.94c1.06 0 2.13 0.14 3.16 0.41l109.01 28.51-112.17-142.26-112.17 142.26 109.01-28.51c1.04-0.27 2.1-0.41 3.16-0.41z" p-id="1317"></path></svg>`;
  const imgTexture = `https://lf-dp.bytetos.com/obj/dp-open-internet-cn/visactor-site/bytedance/client/img/visactor/navigator-logo.svg`;
  shapes.push(
    createSymbol({
      x: 300,
      y: 100,
      symbolType: 'circle',
      size: 160,
      outerBorder: {
        distance: 10,
        lineWidth: 2,
        stroke: 'green'
      },
      innerBorder: {
        distance: 10,
        lineWidth: 1,
        stroke: 'red'
      },
      // fill: 'green',
      background:
        'data:image/png;base64,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',
      texture: 'circle',
      texturePadding: 0,
      textureSize: 20,
      textureColor: 'blue',
      fillOpacity: 1,
      scaleX: 2,
      scaleY: 2,
      lineWidth: 6
    })
  );

  shapes.push(
    createArc({
      x: 720,
      y: 180,
      innerRadius: 20,
      outerRadius: 80,
      startAngle: 0,
      endAngle: Math.PI * 1.5,
      fill: '#f3f5f7',
      stroke: '#333',
      lineWidth: 2,
      texture: svgTexture
    })
  );

  // image texture 示例（图片平铺）
  shapes.push(
    createRect({
      x: 880,
      y: 320,
      width: 260,
      height: 200,
      fill: '#f3f5f7',
      stroke: '#333',
      lineWidth: 2,
      texture: imgTexture,
      textureSize: 80,
      texturePadding: 6
    })
  );

  // shapes.push(
  //   createArc({
  //     x: 700,
  //     y: 200,
  //     outerBorder: {
  //       distance: 10,
  //       lineWidth: 2,
  //       stroke: 'green'
  //     },
  //     // innerBorder: {
  //     //   distance: 10,
  //     //   lineWidth: 1,
  //     //   stroke: 'red'
  //     // },
  //     innerRadius: 0,
  //     outerRadius: 60,
  //     fill: 'green',
  //     // background:
  //     //   'data:image/png;base64,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',
  //     texture: 'circle',
  //     texturePadding: 1,
  //     textureSize: 3,
  //     textureColor: 'red',
  //     fillOpacity: 1,
  //     scaleX: 2,
  //     scaleY: 2,
  //     lineWidth: 6
  //   })
  // );

  const stage = createStage({
    canvas: 'main',
    autoRender: true,
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600
  });

  addShapesToStage(stage, shapes as any, true);
  stage.render(undefined, { renderStyle: 'rough' });
};
