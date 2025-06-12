import { StoryVerticalShapeClipList } from '../../../src/story-list';
import render from '../../util/render';
import { svg1, svg2, svg3 } from './assets';

export function run() {
  console.log('StoryShapeListExample');

  const components: StoryVerticalShapeClipList[] = [];
  // 简化的美元符号形状
  const simpleDollarPath =
    'M47.9 143.3 48 142.9V134.4Q61.6 132.2 69.4 123 77.2 113.9 77.2 100.8 77.2 85 64.7 76.5 58 71.9 41.8 67.4 41.6 67.3 41.3 67.2 28.2 63.9 23.7 60.8 18.8 57.4 18.8 50.8 18.8 45 21.9 41.1 26.6 35 38.8 35 56.5 35 59 44.5 59.8 48.1 63.3 50.1 66.4 51.8 69.8 51.2 73.6 50.4 75.6 46.8 77.3 43.7 76.7 40.3L76.6 40.1 76.6 39.9Q71.1 20 47.6 17.1V9.2Q47.6 5.2 45 2.6 42.4-0 38.4 0 34.5 0 31.9 2.6 29.3 5.2 29.3 9.2V17.2Q15.7 19.5 7.9 28.6.1 37.8.1 50.8.1 66.7 12.7 75.6 19.5 80.4 35.2 85.1 35.6 85.2 35.8 85.2L35.8 85.2 35.9 85.3Q49 88.7 53.3 91.5 58 94.7 58 100.8 58 116.7 38 116.7 20.3 116.7 17.9 107.2 17.1 103.5 13.6 101.6 10.4 99.8 7 100.5 3.2 101.3 1.2 104.9-.5 108 .2 111.4L.2 111.6.3 111.7Q5.8 131.6 29.3 134.6V142.5Q29.3 146.4 31.9 149.1 34.5 151.7 38.4 151.7 42.2 151.7 44.9 149.2 47.3 146.9 47.9 143.3Z';

  // 示例1：基本用法 - 美元符号形状
  components.push(
    new StoryVerticalShapeClipList({
      x: 50,
      y: 50,
      width: 700,
      height: 400,
      shapeRatio: 0.3,
      spacing: 5,
      colors: ['#00BCD4', '#4ECDC4', '#45B7D1', '#3498DB', '#2980B9', '#1ABC9C'],
      shapePath: simpleDollarPath,
      list: [
        {
          icon: {
            symbolType: 'circle',
            background: svg1
          },
          title: {
            textConfig: [{ text: '东亚和太平洋', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '预计增长放缓', fontSize: 14, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'square',
            background: svg2
          },
          title: {
            textConfig: [{ text: '欧洲和中亚', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '预计增长放缓', fontSize: 14, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'diamond',
            background: svg3
          },
          title: {
            textConfig: [{ text: '拉美和加勒比', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '预计增长放缓', fontSize: 14, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'triangle'
          },
          title: {
            textConfig: [{ text: '中东和北非', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '预计增长回升', fontSize: 14, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'star'
          },
          title: {
            textConfig: [{ text: '南亚', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '预计增长放缓', fontSize: 14, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'rect'
          },
          title: {
            textConfig: [
              { text: '撒哈拉以南非洲', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }
            ]
          },
          text: {
            textConfig: [{ text: '预计增长回升', fontSize: 14, fill: '#6b7280', textAlign: 'left' }]
          }
        }
      ]
    })
  );

  // 示例2：单色渐变效果 + stroke-only主题
  components.push(
    new StoryVerticalShapeClipList({
      x: 50,
      y: 500,
      width: 600,
      height: 300,
      shapeRatio: 0.35,
      spacing: 10,
      themeStyle: 'stroke-only', // 只显示边框
      colors: ['#FF6B6B'], // 单色，会自动生成渐变
      shapePath: simpleDollarPath,
      list: [
        {
          icon: {
            symbolType: 'circle'
          },
          title: {
            textConfig: [{ text: '第一季度', fontSize: 15, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '经济增长稳定', fontSize: 13, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'triangle'
          },
          title: {
            textConfig: [{ text: '第二季度', fontSize: 15, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '增长势头加强', fontSize: 13, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'diamond'
          },
          title: {
            textConfig: [{ text: '第三季度', fontSize: 15, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '持续向好发展', fontSize: 13, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'star'
          },
          title: {
            textConfig: [{ text: '第四季度', fontSize: 15, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '年度目标达成', fontSize: 13, fill: '#6b7280', textAlign: 'left' }]
          }
        }
      ]
    })
  );

  // 示例3：不同比例设置 + fill-only主题
  components.push(
    new StoryVerticalShapeClipList({
      x: 500,
      y: 500,
      width: 500,
      height: 250,
      shapeRatio: 0.5, // 形状占一半宽度
      spacing: 8,
      themeStyle: 'fill-only', // 只填充，无边框
      colors: ['#8E44AD', '#9B59B6', '#AF7AC5'],
      shapePath: simpleDollarPath,
      list: [
        {
          icon: {
            symbolType: 'rect'
          },
          title: {
            textConfig: [{ text: '技术革新', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '推动产业升级', fontSize: 12, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'triangle'
          },
          title: {
            textConfig: [{ text: '市场扩张', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '开拓新兴市场', fontSize: 12, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'circle'
          },
          title: {
            textConfig: [{ text: '品牌建设', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '提升品牌价值', fontSize: 12, fill: '#6b7280', textAlign: 'left' }]
          }
        }
      ]
    })
  );

  // 示例4：normal主题样式（默认）
  components.push(
    new StoryVerticalShapeClipList({
      x: 1050,
      y: 500,
      width: 400,
      height: 200,
      shapeRatio: 0.45,
      spacing: 6,
      themeStyle: 'normal', // 填充+边框
      colors: ['#2ECC71'],
      shapePath: simpleDollarPath,
      list: [
        {
          icon: {
            symbolType: 'circle'
          },
          title: {
            textConfig: [{ text: '收入增长', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '同比增长15%', fontSize: 12, fill: '#6b7280', textAlign: 'left' }]
          }
        },
        {
          icon: {
            symbolType: 'triangle'
          },
          title: {
            textConfig: [{ text: '利润提升', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'left' }]
          },
          text: {
            textConfig: [{ text: '净利润增长20%', fontSize: 12, fill: '#6b7280', textAlign: 'left' }]
          }
        }
      ]
    })
  );

  const stage = render(components as any, 'main');

  console.log('StoryVerticalShapeClipList demo created successfully');
}
