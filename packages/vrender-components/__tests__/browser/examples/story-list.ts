import '@visactor/vrender';
import render from '../../util/render';
import { StoryNormalList, StoryCircularList, StoryRectList, StoryArrowList } from '../../../src';

export function run() {
  const storyLists: (StoryNormalList | StoryCircularList | StoryRectList | StoryArrowList)[] = [];

  // // 自定义图标的故事列表
  // storyLists.push(
  //   new StoryNormalList({
  //     x: 0,
  //     y: 0,
  //     width: 300,
  //     height: 180,
  //     colors: ['#FFF8E8', '#E8FFF8', '#F8E8FF'],
  //     list: [
  //       {
  //         icon: {
  //           symbolType: 'star',
  //           size: 14,
  //           fill: '#f59e0b'
  //         },
  //         title: {
  //           textConfig: [{ text: '亚洲市场', fontSize: 14, fontWeight: 'bold', fill: '#1f2937' }]
  //         },
  //         text: {
  //           textConfig: [{ text: '亚洲股市表现强劲，科技股领涨。', fontSize: 12, fill: '#6b7280' }]
  //         }
  //       },
  //       {
  //         icon: {
  //           symbolType: 'triangle',
  //           size: 14,
  //           fill: '#10b981'
  //         },
  //         title: {
  //           textConfig: [{ text: '欧洲市场', fontSize: 14, fontWeight: 'bold', fill: '#1f2937' }]
  //         },
  //         text: {
  //           textConfig: [{ text: '欧洲央行政策支撑市场信心。', fontSize: 12, fill: '#6b7280' }]
  //         }
  //       },
  //       {
  //         icon: {
  //           symbolType: 'diamond',
  //           size: 14,
  //           fill: '#8b5cf6'
  //         },
  //         title: {
  //           textConfig: [{ text: '美洲市场', fontSize: 14, fontWeight: 'bold', fill: '#1f2937' }]
  //         },
  //         text: {
  //           textConfig: [{ text: '美国就业数据好于预期，推动市场上涨。', fontSize: 12, fill: '#6b7280' }]
  //         }
  //       }
  //     ]
  //   })
  // );

  // 环形列表展示
  storyLists.push(
    new StoryCircularList({
      x: 50,
      y: 50,
      width: 300,
      height: 300,
      colors: ['#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6'],
      list: [
        {
          icon: {
            symbolType: 'rect',
            size: 20,
            fill: '#FFFFFF'
          },
          title: {
            textConfig: [{ text: '东亚和太平洋', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '东亚和太平洋在2025年增长放缓。', fontSize: 14, fill: '#6b7280' }]
          }
        },
        {
          icon: {
            symbolType: 'diamond',
            size: 20,
            fill: '#FFFFFF'
          },
          title: {
            textConfig: [{ text: '中东和北非', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '中东和北非预计在2025年增长加速。', fontSize: 14, fill: '#6b7280' }]
          }
        },
        {
          icon: {
            symbolType: 'triangle',
            size: 20,
            fill: '#FFFFFF'
          },
          title: {
            textConfig: [{ text: '撒哈拉以南非洲', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '撒哈拉以南非洲在2024年增长加速。', fontSize: 14, fill: '#6b7280' }]
          }
        },
        {
          icon: {
            symbolType: 'star',
            size: 20,
            fill: '#FFFFFF'
          },
          title: {
            textConfig: [{ text: '拉美和加勒比', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '拉美和加勒比在2024年增长放缓。', fontSize: 14, fill: '#6b7280' }]
          }
        }
      ]
    })
  );

  // // 矩形列表展示
  // storyLists.push(
  //   new StoryRectList({
  //     x: 0,
  //     y: 50,
  //     width: 600,
  //     height: 400,
  //     colors: ['#4285F4', '#34A853', '#00BCD4', '#8BC34A'],
  //     list: [
  //       {
  //         icon: {
  //           symbolType: 'rect',
  //           size: 30,
  //           fill: '#4285F4',
  //           stroke: '#4285F4'
  //         },
  //         title: {
  //           textConfig: [{ text: '东亚和太平洋', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
  //         },
  //         text: {
  //           textConfig: [{ text: '东亚和太平洋在2025年增长放缓。', fontSize: 14, fill: '#6b7280' }]
  //         }
  //       },
  //       {
  //         icon: {
  //           symbolType: 'diamond',
  //           size: 30,
  //           fill: '#34A853',
  //           stroke: '#34A853'
  //         },
  //         title: {
  //           textConfig: [{ text: '中东和北非', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
  //         },
  //         text: {
  //           textConfig: [{ text: '中东和北非预计在2025年增长加速。', fontSize: 14, fill: '#6b7280' }]
  //         }
  //       },
  //       {
  //         icon: {
  //           symbolType: 'triangle',
  //           size: 30,
  //           fill: '#00BCD4',
  //           stroke: '#00BCD4'
  //         },
  //         title: {
  //           textConfig: [{ text: '拉美和加勒比', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
  //         },
  //         text: {
  //           textConfig: [{ text: '拉美和加勒比在2024年增长放缓。', fontSize: 14, fill: '#6b7280' }]
  //         }
  //       },
  //       {
  //         icon: {
  //           symbolType: 'star',
  //           size: 30,
  //           fill: '#8BC34A',
  //           stroke: '#8BC34A'
  //         },
  //         title: {
  //           textConfig: [{ text: '撒哈拉以南非洲', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
  //         },
  //         text: {
  //           textConfig: [{ text: '撒哈拉以南非洲在2024年增长加速。', fontSize: 14, fill: '#6b7280' }]
  //         }
  //       }
  //     ]
  //   })
  // );

  // 箭头列表展示 - 向右箭头，3个元素
  storyLists.push(
    new StoryArrowList({
      x: 400,
      y: 50,
      width: 500,
      height: 300,
      direction: 'right',
      colors: ['#4285F4', '#34A853', '#FF6B6B'],
      list: [
        {
          title: {
            textConfig: [{ text: '主要地区经济增长放缓', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '全球主要经济体增长步伐在2024年有所放缓', fontSize: 14, fill: '#6b7280' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '预计政策放松后经济增长反弹', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '各国政策调整将推动2025年经济复苏', fontSize: 14, fill: '#6b7280' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '2025年全球经济前景乐观', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '预期2025年将迎来更强劲的经济增长', fontSize: 14, fill: '#6b7280' }]
          }
        }
      ]
    })
  );

  // 箭头列表展示 - 向左箭头，2个元素
  storyLists.push(
    new StoryArrowList({
      x: 50,
      y: 400,
      width: 400,
      height: 200,
      direction: 'left',
      colors: ['#8B5CF6', '#10B981'],
      list: [
        {
          title: {
            textConfig: [{ text: '政策调整', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '各国央行政策调整为经济增长创造条件', fontSize: 14, fill: '#6b7280' }]
          }
        },
        {
          title: {
            textConfig: [{ text: '增长复苏', fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '预计2025年全球经济将迎来强劲复苏', fontSize: 14, fill: '#6b7280' }]
          }
        }
      ]
    })
  );

  // 箭头列表展示 - 单个箭头
  storyLists.push(
    new StoryArrowList({
      x: 500,
      y: 400,
      width: 300,
      height: 150,
      direction: 'right',
      colors: ['#FF6B6B'],
      list: [
        {
          title: {
            textConfig: [{ text: '关键转折点', fontSize: 18, fontWeight: 'bold', fill: '#1f2937' }]
          },
          text: {
            textConfig: [{ text: '2024年到2025年是全球经济的重要转折点', fontSize: 14, fill: '#6b7280' }]
          }
        }
      ]
    })
  );

  const stage = render(storyLists as any, 'main');

  console.log('Story List demo rendered:', storyLists.length, 'components');
}
