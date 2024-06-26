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
      fontSize: 26,
      _debug_bounds: true,
      width: 0,
      x: 100,
      y: 100,
      editable: true,
      // background: 'green',
      // "textAlign": "center",
      textConfig: [
        {
          text: '我',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '们',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '是',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '无',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '缘',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: 'a',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '无',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '故',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '的',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '尘😁',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '埃\n',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '无',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '缘',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '无',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '故',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '的',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '游',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '走\n',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '黑',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '暗',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '只',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '需',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '要',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '张',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '开',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '一',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '张',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '缝',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '隙\n',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '就',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '能',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '挂',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '起',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '飓',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        },
        {
          text: '风\n',
          fontSize: 26,
          textAlign: 'center',
          fill: '#0f51b5'
        }
      ]
    })
  );

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
