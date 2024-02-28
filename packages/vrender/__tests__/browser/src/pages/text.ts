import {
  createStage,
  createText,
  global,
  getTextBounds,
  createLine,
  createRect,
  createCircle,
  IGraphic,
  createGroup,
  vglobal,
  createWrapText
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// global.setEnv('browser');

const textStr =
  '蛋糕吃起来像已经放了很多年似的。那天晚上达力神气活现地在起居室里走来走去，向家人展示他那套新校服。斯梅廷中学的男生制服是棕红色燕尾服，橙色短灯笼裤和一顶叫硬草帽2的扁平草帽。他们还配了一支多节的手杖，趁老师不注意时用来互相打斗，这也许是对未来生活的一种很好的训练吧。弗农姨父看着身穿崭新灯笼裤的达力，他的声音都沙哑了，他说这是他平生感到最自豪的一刻。佩妮姨妈突然哭起来，她说她的宝贝疙瘩已经长大了，长得这么帅，简直让她不能相信。哈利却不敢开口。为了强忍住不笑，他的两条肋骨都快折断了。第二天早上哈利来吃早饭时，发现厨房里有一股难闻的味儿。这气味似乎是从污水池里的一只大铁盆里散发出来的。他去看了一眼，发现一盆灰黑色的水里泡着像破抹布似的东西。「这是什么？」他问佩妮姨妈。她把嘴唇抿紧，每当哈利大胆问问题时，她总是这样。「你的新校服呀。」她说。哈利又朝盆里扫了一眼。「哦，」他说，「我不知道还得泡得这么湿。」「别冒傻气，」佩妮姨妈斥责说，「我把达力的旧衣服染好给你用。等我染好以后，穿起来就会跟别人的一模一样。」哈利对此非常怀疑，但他还是觉得最好不要跟她争论。他坐下来吃早饭时，竭力不去想第一天去石墙中学上学自己会是什么模样，八成像披着大象的旧象皮吧。达力和弗农姨父进来时，都因为哈利那套新校服散发的味道皱起了鼻子。弗农姨父像通常一样打开报纸，达力则把他从不离身的斯梅廷手杖啪的一声放到桌上。他们听到信箱咔哒响了一声，一些信落到大门口的擦脚垫上。「去拿信，达力。」弗农姨父从报纸后边说。「叫哈利去捡。」「哈利去捡。」「达力去捡。」「用你的斯梅廷手杖赶他去捡。」哈利躲闪着斯梅廷手杖，去捡信。擦脚垫上有三样邮件：一封是弗农姨父的姐姐玛姬姑妈寄来的明信片，她现在在怀特岛3度假；另一封是看来像账单的棕色信封；还有一封是寄给哈利的信。哈利把信捡起来，目不转睛地盯着看，心里像有一根很粗的橡皮筋嘣的一声弹了起来，嗡嗡直响。活到现在，从来没有人给他写过信。这封信可能是谁写的呢？他没有朋友，没有另外的亲戚，他没有借书证，因此不会收到图书馆催还图书的通知单。可现在确实有一封信，地址清清楚楚，不会有错：萨里郡小惠金区女贞路４号楼梯下的碗柜哈利波特先生收信封是用厚重的羊皮纸做的，地址是甩翡翠绿的墨水写的。没有贴邮票。哈利用颤抖的手把信封翻转过来，只见上边有一块蜡封、一个盾牌纹章，大写「Ｈ」字母的周围圈着一头狮子、一只鹰、一只獾和一条蛇。「小子，快拿过来！」弗农姨父在厨房里喊起来，「你在干什么，在检查邮包有没有炸弹吗？」他开了个玩笑，自己也咯咯地笑开了。哈利回到厨房里，目光一直盯着他的那封信。他把账单和明信片递给弗农姨父，然后坐下来，慢慢拆开他那个黄色的信封。弗农姨父拆开有账单的信封，厌恶地哼了一声，又把明信片轻轻翻转过来。「玛姬病倒了，」他对佩妮姨妈说，「吃了有问题的油螺……」「老爸！」达力突然说，「老爸，哈利收到什么东西了！」哈利刚要打开他那封写在厚重羊皮纸上的信，信却被弗农姨父一把从手中抢过去了。「那是写给我的！」哈利说，想把信夺回来。「谁会给你写信？」弗农姨父讥讽地说，用一只手把信纸抖开，朝它瞥了一眼。他的脸一下子由红变青，比红绿灯变得还快。事情到这里并没结束。几秒钟之内他的脸就变得像灰色的麦片粥一样灰白了。「佩——佩——佩妮！」他气喘吁吁地说。达力想把信抢过来看，可是弗农姨父把信举得老高，他够不着。佩妮姨妈好奇地把信拿过去，刚看第一行，她就好像要晕倒了。她抓住喉咙，噎了一下，像要背过气去。「德思礼！哎呀！我的天……德思礼！」他们俩你看我，我看你，都不说话，似乎忘了哈利和达力还在屋里。达力是不习惯被人冷落的，他用斯梅廷手杖朝他父亲的头上狠狠地敲了一下。「我要看那封信。」他大声说。「我要看。」哈利气呼呼地说，「因为那封信是写给我的。」「你们俩，统统给我出去。」弗农姨父用低沉而沙哑的声音说，把信重新塞到信封里。哈利没有动。「我要我的信！」他大叫说。「让我看！」达力命令说。「出去！」弗农姨父吼了起来，揪住哈利和达力的脖领，把他们俩扔到了走廊里，砰地一';

function performance(stage: any) {
  // vglobal.measureTextMethod = 'quick';
  const textList = new Array(3000).fill(0).map(item => {
    const start = Math.floor(textStr.length * Math.random());
    // return createText({
    //   text: textStr.substring(start, Math.min(textStr.length - start - 1, 10)),
    //   fill: true,
    //   fontSize: 16
    // })
    return createText({
      text: new Array(10)
        .fill(0)
        .map(item => String.fromCharCode(97 + Math.floor(Math.random() * 24)))
        .join(''),
      fill: true,
      fontSize: 16
    });
  });

  const group = createGroup({});
  textList.forEach(t => group.add(t));
  // stage.defaultLayer.add(group);
  console.time();
  const bounds = group.AABBBounds;
  console.timeEnd();
  console.log(bounds);
}

export const page = () => {
  const graphics: IGraphic[] = [];
  const t = createText({
    autoWrapText: false,
    dx: 0,
    ellipsis: '...',
    direction: 'vertical',
    fill: '#000',
    fontFamily: 'Arial,sans-serif',
    fontSize: 16,
    fontWeight: null,
    heightLimit: 52,
    lineClamp: undefined,
    lineHeight: 16,
    lineThrough: undefined,
    maxLineWidth: 60,
    text: '你在唱什么，什么都觉得',
    textAlign: 'left',
    textBaseline: 'top',
    angle: 0.6,
    background: {
      background:
        '<svg t="1683876749384" class="icon" viewBox="0 0 1059 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5625" width="200" height="200"><path d="M928.662069 17.655172h-812.137931v208.331035h812.137931z" fill="#F1543F" p-id="5626"></path><path d="M1020.468966 275.42069l-236.579311 367.227586c0-17.655172-3.531034-35.310345-14.124138-49.434483-17.655172-24.717241-56.496552-28.248276-81.213793-45.903448-21.186207-14.124138-35.310345-42.372414-60.027586-56.496552L928.662069 17.655172l24.717241 14.124138c88.275862 49.434483 116.524138 158.896552 67.089656 243.64138M416.662069 490.813793c-21.186207 14.124138-38.841379 42.372414-60.027586 56.496552-24.717241 17.655172-63.558621 24.717241-81.213793 45.903448-10.593103 14.124138-10.593103 31.77931-14.124138 49.434483L24.717241 275.42069C-24.717241 190.675862 3.531034 81.213793 91.806897 31.77931l24.717241-14.124138 300.137931 473.158621z" fill="#FF7058" p-id="5627"></path><path d="M893.351724 656.772414c0 38.841379-35.310345 70.62069-45.903448 102.4-10.593103 35.310345-3.531034 81.213793-24.717242 109.462069-21.186207 28.248276-67.089655 35.310345-98.868965 56.496551-31.77931 28.248276-52.965517 70.62069-88.275862 81.213794-35.310345 10.593103-77.682759-10.593103-112.993104-10.593104-38.841379 0-81.213793 21.186207-116.524137 10.593104S349.572414 953.37931 317.793103 932.193103c-31.77931-21.186207-77.682759-28.248276-98.868965-56.496551-21.186207-28.248276-14.124138-74.151724-24.717241-109.462069-10.593103-35.310345-45.903448-67.089655-45.903449-102.4 0-38.841379 35.310345-70.62069 45.903449-105.931035 10.593103-35.310345 3.531034-81.213793 24.717241-109.462069 21.186207-28.248276 67.089655-35.310345 98.868965-56.496551 28.248276-21.186207 49.434483-63.558621 88.275863-74.151725 35.310345-10.593103 77.682759 10.593103 116.524137 10.593104 38.841379 0 81.213793-21.186207 112.993104-10.593104 35.310345 10.593103 56.496552 52.965517 88.275862 74.151725 31.77931 21.186207 77.682759 28.248276 98.868965 56.496551 21.186207 28.248276 14.124138 74.151724 24.717242 109.462069 10.593103 31.77931 45.903448 63.558621 45.903448 98.868966" fill="#F8B64C" p-id="5628"></path><path d="M790.951724 656.772414c0 144.772414-120.055172 264.827586-268.358621 264.827586-148.303448 0-268.358621-120.055172-268.35862-264.827586s120.055172-264.827586 268.35862-264.827586c148.303448 0 268.358621 120.055172 268.358621 264.827586" fill="#FFD15C" p-id="5629"></path><path d="M706.206897 589.682759h-123.586207c-7.062069 0-10.593103-3.531034-14.124138-10.593104L529.655172 466.096552c-3.531034-14.124138-21.186207-14.124138-28.248275 0l-38.84138 112.993103c-3.531034 7.062069-7.062069 10.593103-14.124138 10.593104H335.448276c-14.124138 0-21.186207 17.655172-7.062069 24.717241l98.868965 70.62069c3.531034 3.531034 7.062069 10.593103 3.531035 14.124138L391.944828 812.137931c-3.531034 14.124138 10.593103 24.717241 21.186206 14.124138l98.868966-70.62069c3.531034-3.531034 10.593103-3.531034 17.655172 0l98.868966 70.62069c10.593103 7.062069 24.717241-3.531034 21.186207-14.124138l-38.841379-112.993103c-3.531034-7.062069 0-10.593103 3.531034-14.124138l98.868966-70.62069c14.124138-7.062069 7.062069-24.717241-7.062069-24.717241" fill="#F8B64C" p-id="5630"></path></svg>',
      width: 30,
      height: 30
    },
    underline: undefined,
    // whiteSpace: 'no-wrap',
    wordBreak: 'break-word',
    x: 16,
    y: 28
  });
  console.log(t, t.cliped);
  graphics.push(t);
  // t.animate().to({ maxLineWidth: 0 }, 3000, 'linear');

  const tt = createText({
    x: 971.9754981994629,
    y: -213.8625716268361,
    textAlign: 'center',
    _debug_bounds: true,
    textBaseline: 'middle',
    text: ['细分'],
    underline: 1,
    underlineOffset: 0,
    underlineDash: [2, 2],
    fontSize: 16,
    whiteSpace: 'normal',
    graphicAlign: 'center',
    graphicBaseline: 'middle',
    fill: '#000',
    ignoreBuf: true,
    fontFamily: 'D-Din',
    maxLineWidth: 120,
    heightLimit: 999999,
    // angle: 0.6,
    // anchor: [971.9754981994629, -213.8625716268361],
    visible: true,
    background: '#F54A45'
  });
  console.log(tt);
  const g = createGroup({
    // angle: 0.6
    x: -600,
    y: 600
  });
  g.add(tt);

  graphics.push(g);

  graphics.push(
    createText({
      x: 300,
      y: 200,
      fill: {
        gradient: 'linear',
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 1,
        stops: [
          { offset: 0, color: 'green' },
          { offset: 0.5, color: 'orange' },
          { offset: 1, color: 'red' }
        ]
      },
      background: 'red',
      backgroundCornerRadius: 10,
      text: ['这是一行文字'],
      fontSize: 36,
      textBaseline: 'top'
    })
  );

  const text = createText({
    x: 500,
    y: 200,
    fill: colorPools[5],
    // text: ['Tffg'],
    text: ['这是垂aaa直textabc这aaaaa是什么', '这是阿萨姆abcaaaaa'],
    wordBreak: 'break-word',
    maxLineWidth: 200,
    // ellipsis: '',
    direction: 'vertical',
    stroke: 'green',
    // wordBreak: 'break-word',
    // maxLineWidth: 200,
    // ellipsis: '',
    // direction: 'vertical',
    // fontSize: 120,
    // stroke: 'green',
    // lineWidth: 100,
    // lineHeight: 30,
    // lineThrough: 1,
    // underline: 1,
    textAlign: 'left',
    textBaseline: 'middle'
    // textBaseline: 'bottom'
    // scaleX: 2,
    // scaleY: 2
  });
  graphics.push(text);
  const circle = createCircle({
    x: 500,
    y: 200,
    fill: 'black',
    radius: 2
  });
  graphics.push(circle);

  const rect = createRect({
    x: t.AABBBounds.x1,
    y: t.AABBBounds.y1,
    width: t.AABBBounds.width(),
    height: t.AABBBounds.height(),
    stroke: 'red',
    lineWidth: 1
  });
  graphics.push(rect);

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  window.visualViewport.addEventListener('resize', e => {
    console.log(e.currentTarget.scale);
    stage.setDpr(e.currentTarget.scale * window.devicePixelRatio);
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });

  const btn = document.createElement('button');
  btn.innerHTML = '点击';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => {
    performance(stage);
  });
};
