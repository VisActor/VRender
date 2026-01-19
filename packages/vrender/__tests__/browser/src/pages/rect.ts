import {
  createStage,
  container,
  createRect,
  IGraphic,
  createGroup,
  createSymbol,
  serviceRegistry,
  contributionRegistry,
  VGlobal,
  EnvContribution,
  CanvasFactory,
  Context2dFactory,
  GraphicRender
} from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';

// container.load(roughModule);
export const page = () => {
  // ===== 调试代码开始 =====
  console.log('===== VRender Debug =====');
  console.log('1. VGlobal 检查:');
  const global = serviceRegistry.get(VGlobal);
  console.log('  global:', global);
  console.log('  global.env:', global.env);
  console.log('  global.envContribution:', global.envContribution);
  console.log('  global.envContribution?.type:', global.envContribution?.type);

  console.log('\n2. EnvContribution 检查:');
  const envContribs = contributionRegistry.get(EnvContribution);
  console.log('  EnvContribution 数量:', envContribs.length);
  envContribs.forEach((c, i) => console.log(`    [${i}] type: ${c.type}`));

  console.log('\n3. Canvas 工厂检查:');
  const canvasFactory = serviceRegistry.getFactory(CanvasFactory);
  const contextFactory = serviceRegistry.getFactory(Context2dFactory);
  console.log('  CanvasFactory:', typeof canvasFactory);
  console.log('  Context2dFactory:', typeof contextFactory);

  console.log('\n4. 测试 createCanvas:');
  try {
    const testCanvas = global.createCanvas({ width: 100, height: 100 });
    console.log('  createCanvas 成功:', testCanvas);
    console.log('  canvas.width:', testCanvas.width);
  } catch (e) {
    console.error('  createCanvas 失败:', e);
  }

  console.log('\n5. 测试 Canvas 工厂:');
  try {
    const nativeCanvas = global.createCanvas({ width: 200, height: 150 });
    const wrapped = canvasFactory({
      nativeCanvas,
      width: 200,
      height: 150,
      dpr: window.devicePixelRatio
    });
    console.log('  工厂包装成功:', wrapped);
    console.log('  wrapped.nativeCanvas:', wrapped.nativeCanvas);
  } catch (e) {
    console.error('  工厂包装失败:', e);
    console.error('  错误堆栈:', e.stack);
  }
  console.log('===== Debug End =====\n');
  // ===== 调试代码结束 =====

  const graphics: IGraphic[] = [];

  // ===== 继续测试：创建 Stage 后检查 =====
  console.log('===== 创建 Stage 前后对比 =====');
  console.log('创建前 - global.env:', global.env);
  console.log('创建前 - global.envContribution:', global.envContribution);

  const testStage = createStage({
    canvas: 'main',
    autoRender: false
  });

  console.log('\n创建后 - global.env:', global.env);
  console.log('创建后 - global.envContribution:', global.envContribution);
  console.log('创建后 - global.envContribution?.type:', global.envContribution?.type);
  console.log('创建后 - Stage:', testStage);
  const canvas = testStage.window.getNativeHandler();
  console.log('创建后 - canvas:', canvas);
  console.log('创建后 - canvas.nativeCanvas:', canvas?.nativeCanvas);

  // 测试绘制
  const testRect = createRect({
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    fill: 'red',
    stroke: 'blue',
    lineWidth: 3
  });

  testStage.defaultLayer.add(testRect);
  console.log('添加矩形到 defaultLayer，准备渲染...');
  console.log('testRect:', testRect);
  console.log('testStage.defaultLayer.children:', testStage.defaultLayer.children);

  // 检查渲染相关对象
  console.log('\n检查渲染对象:');
  console.log('  testStage.renderService:', testStage.renderService);
  console.log('  testStage.defaultLayer.getNativeHandler():', testStage.defaultLayer.getNativeHandler());
  const layerHandler = testStage.defaultLayer.getNativeHandler();
  console.log('  layerHandler.canvas:', layerHandler.canvas);
  console.log('  layerHandler.context:', layerHandler.context);
  console.log('  layerHandler.context.nativeContext:', layerHandler.context?.nativeContext);

  // 测试直接在 context 上绘制
  console.log('\n测试直接在 context 绘制:');
  const ctx = layerHandler.context.nativeContext;
  if (ctx) {
    ctx.fillStyle = 'green';
    ctx.fillRect(50, 50, 100, 100);
    console.log('  直接绘制绿色矩形完成');

    // 立即检查是否绘制成功（在 render() 之前）
    const immediateCheck = ctx.getImageData(75, 75, 1, 1).data;
    console.log(
      `  立即检查 (75,75): RGBA(${immediateCheck[0]}, ${immediateCheck[1]}, ${immediateCheck[2]}, ${immediateCheck[3]})`
    );
    if (immediateCheck[1] > 200 && immediateCheck[0] < 50 && immediateCheck[2] < 50) {
      console.log('  ✓ 绿色矩形立即可见');
    } else {
      console.log('  ✗ 绿色矩形不可见（可能 canvas 有问题）');
    }
  }

  console.log('\n准备调用 render()...');
  console.log('renderService:', testStage.renderService);
  console.log('graphicService:', testStage.graphicService);

  // 手动获取渲染器检查
  const renders = contributionRegistry.get(GraphicRender);
  console.log('注册的 GraphicRender 数量:', renders.length);
  renders.forEach((r, i) => console.log(`  [${i}] type: ${r.type}`));

  // 检查 Rect 的渲染器
  const rectRender = renders.find(r => r.type === 'rect');
  console.log('Rect 渲染器:', rectRender);

  testStage.render();
  console.log('render() 调用完成');

  // render() 后立即检查
  const afterRender = ctx.getImageData(75, 75, 1, 1).data;
  console.log(
    `render() 后检查 (75,75): RGBA(${afterRender[0]}, ${afterRender[1]}, ${afterRender[2]}, ${afterRender[3]})`
  );
  if (afterRender[1] > 200 && afterRender[0] < 50 && afterRender[2] < 50) {
    console.log('  绿色矩形仍然存在');
  } else {
    console.log('  绿色矩形被清除了（render() 清空了 canvas）');
  }

  console.log('\n渲染完成，检查 canvas 内容...');
  setTimeout(() => {
    const nativeCanvas = testStage.window.getNativeHandler().nativeCanvas;
    const ctx = nativeCanvas.getContext('2d');

    // 先检查直接绘制的绿色矩形
    console.log('500ms 后检查直接绘制的绿色矩形:');
    const greenData = ctx.getImageData(75, 75, 1, 1).data;
    console.log(`  位置(75,75): RGBA(${greenData[0]}, ${greenData[1]}, ${greenData[2]}, ${greenData[3]})`);
    // 正确检测绿色：G>200, R<50, B<50
    if (greenData[1] > 200 && greenData[0] < 50 && greenData[2] < 50) {
      console.log('  ✓ 检测到绿色');
    } else {
      console.log('  ✗ 未检测到绿色');
    }

    // 再检查通过 VRender 渲染的红色矩形
    console.log('\n检查 VRender 渲染的红色矩形:');
    const imageData = ctx.getImageData(150, 150, 1, 1);
    console.log(
      `  位置(150,150): RGBA(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}, ${imageData.data[3]})`
    );

    // 正确检测红色：R>200, G<50, B<50
    if (imageData.data[0] > 200 && imageData.data[1] < 50 && imageData.data[2] < 50) {
      console.log('  ✓ 检测到红色像素，VRender 渲染成功！');
    } else {
      console.log('  ✗ 未检测到红色像素，VRender 渲染失败');
      console.log('  检查其他位置...');

      // 检查多个位置
      const positions = [
        [100, 100],
        [200, 200],
        [250, 150],
        [150, 175]
      ];
      positions.forEach(([x, y]) => {
        const data = ctx.getImageData(x, y, 1, 1).data;
        console.log(`    位置(${x},${y}): RGBA(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`);
      });
    }

    console.log('\n===== Stage 测试完成 =====\n');

    // 不要 release，让原始代码继续使用这个 canvas
    // testStage.release();
  }, 500);
  // ===== Stage 测试结束 =====
  // graphics.push(
  //   createRect({
  //     x: 100,
  //     y: 100,
  //     width: 20,
  //     height: 100,
  //     fill: colorPools[10],
  //     stroke: [colorPools[0], colorPools[0], colorPools[0], colorPools[0]],
  //     cornerRadius: 10,
  //     lineWidth: 5
  //   })
  // );

  const rect = createRect({
    visible: true,
    lineWidth: 0,
    fill: '#FF8A00',
    stroke: '#FF8A00',
    x: 207.40897089999999,
    y: 148.53125,
    width: NaN,
    x1: 49.113898,
    height: 381.9375
  });

  rect.states = {
    a: {
      height: 100
    },
    b: {
      cornerRadius: 100
    }
  };

  rect.on('click', () => {
    rect.useStates(['a', 'b']);
  });
  rect.on('dblclick', () => {
    rect.clearStates();
  });
  graphics.push(rect);

  const r = createRect({
    x: 300,
    y: 100,
    scaleX: 2,
    scaleY: 2,
    width: 200,
    height: 200,
    // cornerRadius: [0, 10, 10, 0],
    stroke: 'red',
    // scaleCenter: ['50%', '50%'],
    // _debug_bounds: true,
    fill: 'red',
    // cornerRadius: [5, 10, 15, 20],
    lineWidth: 2,
    anchor: ['50%', '50%'],
    // anchor: [400, 200],
    lineDash: [100, 10],
    lineDashOffset: -100,
    renderStyle: 'rough'
  });
  const star = createSymbol({
    x: 300,
    y: 100,
    scaleX: 2,
    scaleY: 2,
    angle: 30,
    size: 100,
    symbolType: 'star',
    // cornerRadius: [0, 10, 10, 0],
    stroke: 'red',
    // scaleCenter: ['50%', '50%'],
    // _debug_bounds: true,
    // fill: 'conic-gradient(from 90deg, rgba(5,0,255,1) 16%, rgba(0,255,10,1) 41%, rgba(9,9,121,1) 53%, rgba(0,212,255,1) 100%)',
    fill: 'linear-gradient(90deg, #215F97, #FF948F)',
    // cornerRadius: [5, 10, 15, 20],
    lineWidth: 5,
    anchor: ['50%', '50%'],
    // anchor: [400, 200],
    lineDash: [100, 10],
    lineDashOffset: -100,
    renderStyle: 'rough'
  });

  const group = createGroup({
    x: 0,
    y: 0,
    width: 200,
    height: 200
    // angle: 45,
    // anchor: ['50%', '50%']
  });

  group.appendChild(r);
  group.appendChild(star);

  // r.animate().to({ lineDash: [2000, 1000], lineDashOffset: 100 }, 1000, 'linear');

  graphics.push(group);
  // r.animate().to({ scaleX: 2, scaleY: 2 }, 1000, 'linear');

  graphics.push(
    createRect({
      x: 300,
      y: 300,
      width: 100,
      height: 100,
      background:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAACiSURBVMXBsQmDUABF0evLrwISy2yQ1g3UzpHcyBXs9HeCE2SJgEhq0waxEBTeOckEK0bCTJgJM2EW2PGoa9Ki4EpLjMxdx1ZgR1oUPJuGq81dx5YwE2bCLHDSMgxs3fOcW5ZxROCkd1Wx9ep70rLkCGEmzISZMBNmwkyYCTNhJsyEmTATZsIssGOJkTM+bct3HPm3xMieZIIVI2EmzISZMPsBPLUeCZWhvyQAAAAASUVORK5CYII=',
      cornerRadius: 100,
      lineWidth: 5
    })
  );

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });
  rect.addEventListener('pointerenter', () => console.log('abc'));
  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });

  r.animate()
    .to({ angle: Math.PI * 2 }, 10000, 'linear')
    .loop(Infinity);
};
