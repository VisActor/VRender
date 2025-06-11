import '@visactor/vrender';
import render from '../../util/render';
import { StoryThinArrowList } from '../../../src';

export function run() {
  const storyLists: StoryThinArrowList[] = [];

  // 单箭头示例 - 向右（细身体宽三角形）
  storyLists.push(
    new StoryThinArrowList({
      x: 50,
      y: 50,
      width: 400,
      height: 150,
      direction: 'right',
      themeStyle: 'normal',
      colors: ['#4285F4'],
      list: [
        {
          title: {
            textConfig: [{ text: '细箭头样式', fontSize: 18, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [
              { text: '箭头身体较细，三角形较宽的设计风格', fontSize: 14, fill: '#6b7280', textAlign: 'center' }
            ]
          }
        }
      ]
    })
  );

  // 双箭头示例 - 向左（测试单颜色渐变）
  storyLists.push(
    new StoryThinArrowList({
      x: 500,
      y: 50,
      width: 400,
      height: 200,
      direction: 'left',
      themeStyle: 'fill-only',
      colors: ['#10B981'], // 单颜色自动生成渐变
      list: [
        {
          title: {
            textConfig: [{ text: '第一阶段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '较浅的绿色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '第二阶段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '较深的绿色段', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        }
      ]
    })
  );

  // 三箭头示例 - 向右（stroke-only主题）
  storyLists.push(
    new StoryThinArrowList({
      x: 50,
      y: 300,
      width: 600,
      height: 250,
      direction: 'right',
      themeStyle: 'stroke-only',
      colors: ['#E11D48'], // 玫红色单色渐变
      list: [
        {
          title: {
            textConfig: [{ text: '起始阶段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '细箭头描边样式展示', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '发展阶段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '中等深度的描边效果', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '成熟阶段', fontSize: 16, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '最深的描边颜色效果', fontSize: 14, fill: '#6b7280', textAlign: 'center' }]
          }
        }
      ]
    })
  );

  // 四箭头示例 - 向右（多颜色预定义）
  storyLists.push(
    new StoryThinArrowList({
      x: 50,
      y: 600,
      width: 700,
      height: 300,
      direction: 'right',
      themeStyle: 'normal',
      colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'], // 紫、粉、橙、绿
      list: [
        {
          title: {
            textConfig: [{ text: '规划阶段', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '项目初期规划和准备工作', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '设计阶段', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '详细设计和原型制作', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '开发阶段', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '核心功能开发和实现', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '上线阶段', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '测试部署和正式发布', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        }
      ]
    })
  );

  // 五箭头示例 - 向左（测试完整渐变范围）
  storyLists.push(
    new StoryThinArrowList({
      x: 50,
      y: 950,
      width: 800,
      height: 200,
      direction: 'left',
      themeStyle: 'normal',
      colors: ['#7C3AED'], // 紫色 - 测试5+项目的完整渐变
      list: [
        {
          title: {
            textConfig: [{ text: '阶段一', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '最浅紫色', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '阶段二', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '浅紫色', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '阶段三', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '中等紫色', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '阶段四', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '较深紫色', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '阶段五', fontSize: 14, fontWeight: 'bold', fill: '#1f2937', textAlign: 'center' }]
          },
          text: {
            textConfig: [{ text: '最深紫色', fontSize: 12, fill: '#6b7280', textAlign: 'center' }]
          }
        }
      ]
    })
  );

  const stage = render(storyLists as any, 'main');

  console.log('Story Thin Arrow List demo rendered:', storyLists.length, 'components');
}
