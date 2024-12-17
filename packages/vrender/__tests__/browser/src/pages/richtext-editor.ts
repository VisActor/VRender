import {
  createStage,
  createRichText,
  createGroup,
  createCircle,
  xul,
  ContainerModule,
  RichTextEditPlugin,
  AutoEnablePlugins,
  container,
  XMLParser
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

export const page = () => {
  const c = new ContainerModule(bind => {
    bind(RichTextEditPlugin).toSelf();
    bind(AutoEnablePlugins).toService(RichTextEditPlugin);
  });
  container.load(c);

  const shapes = [];

  const parser = new XMLParser();
  const data = parser.parse('<span>abcdef</span>');
  console.log(data);

  shapes.push(
    createRichText({
      visible: true,
      fontSize: 16,
      _debug_bounds: true,
      width: 0,
      height: 0,
      x: 100,
      y: 100,
      editable: true,
      // background: 'green',
      // "textAlign": "center",
      textConfig: [
        {
          text: 'and this is our world, \nthat we call life',
          fontSize: 16,
          lineHeight: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        }
      ]
    })
  );

  console.log(shapes[0]);

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 700,
    pluginList: ['RichTextEditPlugin']
    // viewWidth: 1200,
    // viewHeight: 600
  });

  // addShapesToStage(stage, shapes as any, true);
  shapes.forEach(item => {
    stage.defaultLayer.add(item);
  });
  stage.render();

  const plugin = stage.pluginService.findPluginsByName('RichTextEditPlugin')[0] as RichTextEditPlugin;
  console.log('plugin', plugin);

  plugin.registerUpdateListener((type, p) => {
    if (type === 'selection') {
      const selection = p.getSelection();
      if (selection && selection.hasFormat('fill')) {
        const fill = selection.getFormat('fill');
        console.log('当前颜色: ', fill, selection.getAllFormat('fill'));
      } else if (selection) {
        const allFill = selection.getAllFormat('fill');
        console.log('当前没有反色', allFill);
      }
    }
  });

  ['bold', 'italic', 'underline', 'lineThrough', { fill: 'red' }].forEach(item => {
    const btn = document.createElement('button');
    btn.innerHTML = typeof item === 'string' ? item : JSON.stringify(item);
    btn.addEventListener('click', () => {
      plugin.dispatchCommand('FORMAT_TEXT_COMMAND', item);
    });
    document.body.appendChild(btn);
  });

  console.log(shapes);

  (window as any).stage = stage;
};
