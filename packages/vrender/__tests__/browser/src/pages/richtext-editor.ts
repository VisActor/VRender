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
      x: 162.07207758976318,
      y: 216.49803822714284,
      textAlign: 'center',
      text: null,
      // editable: true,
      fontSize: 16,
      whiteSpace: 'normal',
      graphicAlign: 'center',
      graphicBaseline: 'middle',
      fill: '#1F2329',
      ignoreBuf: true,
      anchor: [-162.07207758976318, 216.49803822714284],
      angle: 0,
      editOptions: {
        placeholder: '请输入文本',
        placeholderColor: '#B3B8C3',
        keepHeightWhileEmpty: true,
        boundsStrokeWhenInput: '#3073F2',
        syncPlaceholderToTextConfig: false,
        stopPropagation: true
      },
      fontFamily: 'D-Din',
      height: 0,
      heightLimit: 999999,
      lineHeight: '150%',
      maxWidth: 120,
      strokeBoundsBuffer: -1,
      textBaseline: 'top',
      textConfig: [
        {
          fill: '#1F2329',
          stroke: false,
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'D-Din',
          lineHeight: '150%',
          text: 'fkdlajfldsfjlsaa',
          isComposing: false,
          dy: 5,
          space: 6
        }
      ],
      upgradeAttrs: {
        lineHeight: true,
        multiBreakLine: true
      },
      verticalDirection: 'middle',
      width: 0
    })
  );

  console.log(shapes[0]);

  setTimeout(() => {
    shapes[0].setAttributes({ editable: true });
  }, 1000);

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

  ['bold', 'italic', 'underline', 'lineThrough', { fill: 'red' }, { background: 'pink' }].forEach(item => {
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
