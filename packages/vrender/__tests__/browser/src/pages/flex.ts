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
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'space-around'
  });

  const title = createText({
    text: 'abc',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    textAlign: 'center',
    fontWeight: 'bold',
    fill: 'pink',
    width: 10,
    height: 10
    // alignSelf: 'flex-start'
    // alignContent: 'flex-start'
  });
  const title1 = createText({
    text: 'def',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    textAlign: 'center',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    fill: 'pink',
    width: 10,
    height: 10
    // alignSelf: 'flex-start'
    // alignContent: 'flex-start'
  });
  const title2 = createText({
    text: 'hij',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    textAlign: 'center',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
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
    textAlign: 'center',
    fontWeight: 'bold',
    fill: 'orange',
    width: 10,
    height: 10
    // alignSelf: 'flex-end'
  });
  const date1 = createText({
    text: 'date1',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    textAlign: 'center',
    fontWeight: 'bold',
    fill: 'orange',
    width: 10,
    height: 10
    // alignSelf: 'flex-end'
  });
  const date2 = createText({
    text: 'date2',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    textAlign: 'center',
    fontWeight: 'bold',
    fill: 'orange',
    width: 10,
    height: 10
    // alignSelf: 'flex-end'
  });
  const date3 = createText({
    text: 'date3',
    fontSize: 12,
    lineHeight: 18,
    textBaseline: 'bottom',
    textAlign: 'center',
    fontWeight: 'bold',
    fill: 'orange',
    width: 10,
    height: 10
    // alignSelf: 'flex-end'
  });

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    enableLayout: true
  });

  // stage.defaultLayer.add(group);
  stage.defaultLayer.add(container);

  // const plugin = stage.getPluginsByName('FlexLayoutPlugin')[0];
  // plugin.pauseLayout(true);
  container.add(title);
  container.add(title1);
  container.add(title2);
  container.add(date);
  container.add(date1);
  container.add(date2);
  container.add(date3);
  // plugin.pauseLayout(false);
  // plugin.tryLayoutChildren(container);

  stage.render(undefined, { renderStyle: 'rough' });
};
