---
category: examples
group: effects
title: 动态纹理
keywords: dynamic-texture
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/dynamic-texture.gif
---

# 动态纹理

## 代码演示

```javascript livedemo template=vrender
const graphics = [];
const effects = [
    VRender.randomOpacity,
    VRender.columnLeftToRight,
    VRender.columnRightToLeft,
    VRender.rowTopToBottom,
    VRender.rowBottomToTop,
    VRender.diagonalCenterToEdge,
    VRender.diagonalTopLeftToBottomRight,
    VRender.rotationScan,
    VRender.rippleEffect,
    VRender.snakeWave,
    VRender.alternatingWave,
    VRender.spiralEffect,
    VRender.columnEdgeToCenter,
    VRender.columnCenterToEdge,
    VRender.rowEdgeToCenter,
    VRender.rowCenterToEdge,
    VRender.cornerToCenter,
    VRender.centerToCorner,
    VRender.pulseWave,
    VRender.particleEffect
  ];
  const symbolTypeList = [
    'circle',
    'cross',
    'diamond',
    'square',
    'arrow',
    'arrow2Left',
    'arrow2Right',
    'arrow2Up',
    'arrow2Down',
    'wedge',
    'thinTriangle',
    'triangle',
    'triangleUp',
    'triangleDown',
    'triangleRight',
    'triangleLeft',
    'star',
    'wye',
    'rect',
    'arrowLeft',
    'arrowRight',
    'rectRound'
  ];
  const colorPools = [
    {"background": "#FFFFFF", "particleColor": "#00C1D4"},
    {"background": "#000000", "particleColor": "#FF2F92"},
    {"background": "#FFFFFF", "particleColor": "#000000"},
    {"background": "#000000", "particleColor": "#FFFFFF"},
  ];
  effects.forEach((item, index) => {
    // 4行5列
    graphics.push(
      VRender.createRect({
        width: 100,
        height: 100,
        x: 100 * (index % 5),
        y: 100 * Math.floor(index / 5),
        fill: colorPools[index % colorPools.length].background,
        texture: symbolTypeList[index % symbolTypeList.length],
        textureSize: 6,
        texturePadding: 0.5,
        textureRatio: 0,
        textureColor: colorPools[index % colorPools.length].particleColor,
        textureOptions: {
          dynamicTexture: (
            ctx,
            row,
            column,
            rowCount,
            columnCount,
            ratio,
            graphic
          ) => {
            const _r = effects[index](ctx, row, column, rowCount, columnCount, ratio, graphic);
            ctx.globalAlpha = _r;
            const i = row * columnCount + column;
            ctx.fillStyle = colorPools[i % colorPools.length].particleColor;
            ctx.fill();
          }
        }
      })
    );
  });

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});
graphics.forEach(g => {
  stage.defaultLayer.add(g);
  g.animate().to({ textureRatio: 1 }, 2000, 'linear').loop(Infinity);
});
stage.render();
```
