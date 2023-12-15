import { createStage, createText, createGroup, createRect, container, IGraphic, global } from '@visactor/vrender';

// container.load(roughModule);

export const page = () => {
  const group = createGroup({
    x: 100,
    y: 100,
    background: 'red',
    width: 300,
    height: 400,
    display: 'flex',
    flexDirection: 'column',
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
  });

  // 添加10个rect
  new Array(2).fill(0).forEach(() => {
    group.add(
      createRect({
        x: 10,
        y: 10,
        width: 70,
        height: 60,
        fill: 'green',
        boundsPadding: [0, 6, 6, 0]
      })
    );
  });

  const container = createGroup({
    x: 500,
    y: 100,
    height: 100,
    width: 100,
    background: 'green',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
  });

  const title = createText({
    text: 'abc',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    fontWeight: 'bold',
    fill: 'pink',
    width: 10,
    height: 10
    // alignSelf: 'flex-start'
    // alignContent: 'flex-start'
  });

  const date = createText({
    text: 'bcdas',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    fontWeight: 'bold',
    fill: 'orange',
    width: 10,
    height: 10
    // alignSelf: 'flex-end'
  });
  container.add(title);
  container.add(date);

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    enableLayout: true
  });

  // stage.defaultLayer.add(group);
  stage.defaultLayer.add(container);

  stage.render(undefined, { renderStyle: 'rough' });
};
