import '@visactor/vrender';
import render from '../../util/render';
import { StoryArrowList } from '../../../src';
import { svg1, svg2, svg3 } from './assets';

export function run() {
  const storyLists: StoryArrowList[] = [];

  // 单箭头示例 - 向右
  storyLists.push(
    new StoryArrowList({
      x: 50,
      y: 50,
      width: 400,
      height: 150,
      direction: 'left',
      colors: ['#4285F4'],
      list: [
        {
          title: {
            textConfig: [{ text: '关键转折点', fontSize: 18, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [
              { text: '2024年到2025年是全球经济的重要转折点', fontSize: 14, fill: '#6b7280', textAlign: 'center' }
            ]
          },
          icon: {
            background: svg1,
            stroke: '#fff',
            lineWidth: 2
          }
        }
      ]
    })
  );

  // 双箭头示例 - 向左
  storyLists.push(
    new StoryArrowList({
      x: 500,
      y: 50,
      width: 400,
      height: 200,
      direction: 'left',
      themeStyle: 'fill-only',
      colors: ['#FF0000'],
      list: [
        {
          title: {
            textConfig: [{ text: '政策调整', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [
              { text: '各国央行政策调整为经济增长创造条件', fontSize: 14, fill: '#6b7280', textAlign: 'center' }
            ]
          },
          icon: {
            background: svg2,
            stroke: '#fff',
            lineWidth: 1
          }
        },
        {
          title: {
            textConfig: [{ text: '增长复苏', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [
              { text: '预计2025年全球经济将迎来强劲复苏', fontSize: 14, fill: '#6b7280', textAlign: 'center' }
            ]
          },
          icon: {
            background: svg3,
            stroke: '#fff',
            lineWidth: 1
          }
        }
      ]
    })
  );

  // 三箭头示例 - 向右
  storyLists.push(
    new StoryArrowList({
      x: 50,
      y: 300,
      width: 600,
      height: 250,
      direction: 'right',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      list: [
        {
          title: {
            textConfig: [
              { text: '主要地区经济增长放缓', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }
            ]
          },
          text: {
            textConfig: [
              { text: '全球主要经济体增长步伐在2024年有所放缓', fontSize: 14, fill: '#6b7280', textAlign: 'center' }
            ]
          }
        },
        {
          title: {
            textConfig: [
              {
                text: '预计政策放松后经济增长反弹',
                fontSize: 16,
                fontWeight: 'bold',
                fill: '#1f2937',
                textAlign: 'center'
              }
            ]
          },
          text: {
            textConfig: [
              { text: '各国政策调整将推动2025年经济复苏', fontSize: 14, fill: '#6b7280', textAlign: 'center' }
            ]
          }
        },
        {
          title: {
            textConfig: [
              { text: '2025年全球经济前景乐观', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }
            ]
          },
          text: {
            textConfig: [
              { text: '预期2025年将迎来更强劲的经济增长', fontSize: 14, fill: '#6b7280', textAlign: 'center' }
            ]
          }
        }
      ]
    })
  );

  // 四箭头示例 - 向右
  storyLists.push(
    new StoryArrowList({
      x: 50,
      y: 600,
      width: 700,
      height: 300,
      direction: 'right',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
      list: [
        {
          title: {
            textConfig: [
              { text: '东亚和太平洋', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }
            ]
          },
          text: {
            textConfig: [{ text: '东亚和太平洋在2025年增长放缓', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '中东和北非', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '中东和北非预计在2025年增长加速', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [
              { text: '撒哈拉以南非洲', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }
            ]
          },
          text: {
            textConfig: [{ text: '撒哈拉以南非洲在2024年增长加速', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [
              { text: '拉美和加勒比', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }
            ]
          },
          text: {
            textConfig: [{ text: '拉美和加勒比在2024年增长放缓', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        }
      ]
    })
  );

  // 测试修正后的单颜色阶梯渐变效果
  storyLists.push(
    new StoryArrowList({
      x: 50,
      y: 450,
      width: 800,
      height: 250,
      direction: 'right',
      themeStyle: 'normal',
      colors: ['#FF0000'], // 红色 - 测试修正后的渐变
      list: [
        {
          title: {
            textConfig: [{ text: '第一段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '浅色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '第二段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '中等色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '第三段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '较深色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '第四段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '深色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '第四段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '深色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '第四段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '深色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        }
      ]
    })
  );

  const stage = render(storyLists as any, 'main');

  console.log('Story Arrow List demo rendered:', storyLists.length, 'components');
}
