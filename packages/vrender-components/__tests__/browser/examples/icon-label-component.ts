import { IconLabelComponent } from '../../../src/story-list';
import render from '../../util/render';

export function run() {
  console.log('IconLabelComponentExample');

  // SVG icon示例
  const starIcon = `<svg t="1749635137492" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4193" width="200" height="200">
    <path d="M946.5 505L560.1 118.8l-25.9-25.9c-12.3-12.2-32.1-12.2-44.4 0L77.5 505c-12.3 12.3-18.9 28.6-18.8 46 0.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8 12.1-12.1 18.7-28.2 18.7-45.3 0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204z m217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z" p-id="4194"></path>
  </svg>`;

  const heartIcon = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <path d="M923 283.6c-13.4-31.1-32.6-58.9-56.9-82.8-24.3-23.8-52.5-42.4-84-55.5-32.5-13.5-66.9-20.3-102.4-20.3-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5-24.4 23.9-43.5 51.7-56.9 82.8-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3.1-35.3-7-69.6-20.9-101.9z"/>
  </svg>`;

  const components: IconLabelComponent[] = [];

  // 示例1：基本用法
  components.push(
    new IconLabelComponent({
      x: 50,
      y: 50,
      width: 300,
      height: 60,
      color: '#4285F4',
      item: {
        icon: {
          symbolType: 'circle',
          fill: '#4285F4'
        },
        title: {
          textConfig: [
            {
              text: '基本示例',
              fontSize: 16,
              fontWeight: 'bold'
            }
          ]
        },
        text: {
          textConfig: [
            {
              text: '这是一个基本的icon-label组件示例',
              fontSize: 14
            }
          ]
        }
      }
    })
  );

  // 示例2：使用SVG icon
  components.push(
    new IconLabelComponent({
      x: 50,
      y: 140,
      width: 350,
      height: 70,
      color: '#34A853',
      item: {
        icon: {
          symbolType: 'square',
          background: starIcon
        },
        title: {
          textConfig: [
            {
              text: 'SVG图标示例',
              fontSize: 18,
              fontWeight: 'bold'
            }
          ]
        },
        text: {
          textConfig: [
            {
              text: '使用自定义SVG图标的组件示例，展示更丰富的视觉效果',
              fontSize: 14
            }
          ]
        }
      }
    })
  );

  // 示例3：不同颜色主题
  components.push(
    new IconLabelComponent({
      x: 50,
      y: 240,
      width: 320,
      height: 65,
      color: '#FF6B6B',
      divideWidth: 3,
      item: {
        icon: {
          symbolType: 'circle',
          background: heartIcon
        },
        title: {
          textConfig: [
            {
              text: '红色主题',
              fontSize: 17
            }
          ]
        },
        text: {
          textConfig: [
            {
              text: '不同的颜色主题可以传达不同的情感和信息',
              fontSize: 13
            }
          ]
        }
      }
    })
  );

  // 示例4：调整icon大小
  components.push(
    new IconLabelComponent({
      x: 50,
      y: 330,
      width: 280,
      height: 50,
      color: '#8E44AD',
      iconRatio: 0.6, // 较小的icon
      item: {
        icon: {
          symbolType: 'star'
        },
        title: {
          textConfig: [
            {
              text: '小图标示例',
              fontSize: 15
            }
          ]
        },
        text: {
          textConfig: [
            {
              text: '图标尺寸可以通过iconRatio属性调整',
              fontSize: 12
            }
          ]
        }
      }
    })
  );

  // 示例5：大尺寸组件
  components.push(
    new IconLabelComponent({
      x: 50,
      y: 410,
      width: 400,
      height: 80,
      color: '#F39C12',
      iconRatio: 0.9, // 较大的icon
      divideWidth: 4,
      item: {
        icon: {
          symbolType: 'diamond',
          fill: '#F39C12'
        },
        title: {
          textConfig: [
            {
              text: '大尺寸组件示例',
              fontSize: 20,
              fontWeight: 'bold'
            }
          ]
        },
        text: {
          textConfig: [
            {
              text: '适合用作重要信息展示的大尺寸组件，可以承载更多内容和更突出的视觉效果',
              fontSize: 16
            }
          ]
        }
      }
    })
  );

  // 示例6：仅标题
  components.push(
    new IconLabelComponent({
      x: 480,
      y: 50,
      width: 280,
      height: 50,
      color: '#2ECC71',
      item: {
        icon: {
          symbolType: 'triangle'
        },
        title: {
          textConfig: [
            {
              text: '仅标题示例',
              fontSize: 16,
              fontWeight: 'bold'
            }
          ]
        }
        // 没有text内容
      }
    })
  );

  // 示例7：仅文本
  components.push(
    new IconLabelComponent({
      x: 480,
      y: 130,
      width: 280,
      height: 50,
      color: '#9B59B6',
      item: {
        icon: {
          symbolType: 'rect'
        },
        text: {
          textConfig: [
            {
              text: '仅文本内容的组件示例',
              fontSize: 14
            }
          ]
        }
        // 没有title内容
      }
    })
  );

  const stage = render(components as any, 'main');

  console.log('IconLabelComponent demo created successfully');
}
