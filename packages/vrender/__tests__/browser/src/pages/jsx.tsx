import { createStage, VGroup, VSymbol, VText, VImage, VRichText, Fragment, jsx } from '@visactor/vrender';
import { VTag } from '@visactor/vrender-components';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';
import { Group } from 'zrender';
import { IGroup } from '@visactor/vrender';
import { IFederatedEvent } from '@visactor/vrender';

// container.load(roughModule);
const base64 =
  'data:image/png;base64,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';

const svg =
  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="6" fill="#FD9C87"></circle><circle opacity="0.6" cx="6" cy="6" r="1" stroke="white" stroke-width="2"></circle></svg>';

export const page = () => {
  const symbolList = [
    'circle',
    'cross',
    'diamond',
    'square',
    'arrow',
    'arrow2Left',
    'arrow2Right',
    'wedge',
    'thinTriangle',
    'triangle',
    'triangleUp',
    'triangleDown',
    'triangleRight',
    'triangleLeft',
    'stroke',
    'star',
    'wye',
    'rect',
    'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5'
  ];

  const stage = createStage({
    canvas: 'main',
    autoRender: true,
    enableLayout: true
  });

  const paths = {
    colHeaderPaths: [],
    rowHeaderPaths: [
      {
        dimensionKey: '220524114340021',
        value: '办公用品',
        children: [
          {
            dimensionKey: '220524114340022',
            value: '公司',
            children: [
              {
                dimensionKey: '220524114340023',
                value: '一级',
                level: 2,
                startIndex: 1,
                startInTotal: 2,
                id: 33,
                hierarchyState: 'none',
                size: 1
              },
              {
                dimensionKey: '220524114340023',
                value: '二级',
                level: 2,
                startIndex: 1,
                startInTotal: 2,
                id: 34,
                hierarchyState: 'none',
                size: 1
              },
              {
                dimensionKey: '220524114340023',
                value: '三级',
                level: 2,
                startIndex: 1,
                startInTotal: 2,
                id: 35,
                hierarchyState: 'none',
                size: 1
              }
            ],
            level: 1,
            startIndex: 1,
            startInTotal: 1,
            id: 32,
            hierarchyState: 'collapse',
            size: 1,
            keepAspectRatio: false,
            dragHeader: true
          },
          {
            dimensionKey: '220524114340022',
            value: '消费者',
            children: [
              {
                dimensionKey: '220524114340023',
                value: '一级',
                level: 2,
                startIndex: 1,
                startInTotal: 3,
                id: 37,
                hierarchyState: 'none',
                size: 1
              },
              {
                dimensionKey: '220524114340023',
                value: '二级',
                level: 2,
                startIndex: 1,
                startInTotal: 3,
                id: 38,
                hierarchyState: 'none',
                size: 1
              },
              {
                dimensionKey: '220524114340023',
                value: '三级',
                level: 2,
                startIndex: 1,
                startInTotal: 3,
                id: 39,
                hierarchyState: 'none',
                size: 1
              }
            ],
            level: 1,
            startIndex: 2,
            startInTotal: 2,
            id: 36,
            hierarchyState: 'collapse',
            size: 1,
            keepAspectRatio: false,
            dragHeader: true
          },
          {
            dimensionKey: '220524114340022',
            value: '小型企业',
            children: [
              {
                dimensionKey: '220524114340024',
                value: '纸张',
                level: 2,
                startIndex: 1,
                startInTotal: 4,
                id: 41,
                hierarchyState: 'none',
                size: 1
              },
              {
                dimensionKey: '220524114340024',
                value: '打印机',
                level: 2,
                startIndex: 1,
                startInTotal: 4,
                id: 42,
                hierarchyState: 'none',
                size: 1
              },
              {
                dimensionKey: '220524114340024',
                value: '电脑',
                level: 2,
                startIndex: 1,
                startInTotal: 4,
                id: 43,
                hierarchyState: 'none',
                size: 1
              }
            ],
            level: 1,
            startIndex: 3,
            startInTotal: 3,
            id: 40,
            hierarchyState: 'collapse',
            size: 1,
            keepAspectRatio: false,
            dragHeader: true
          }
        ],
        level: 0,
        startIndex: 0,
        startInTotal: 0,
        id: 31,
        hierarchyState: 'expand',
        size: 4,
        keepAspectRatio: false
      }
    ]
  };
  const value = '办公用品';
  const rowPathLength = paths.rowHeaderPaths.length;
  const children = paths.rowHeaderPaths[rowPathLength - 1].children;
  const width = 342;
  const height = 60;
  // const width = undefined;
  // const height = undefined;
  const leftContainerWidth = rowPathLength === 1 ? 30 : 50;

  // const container = (
  //   <VGroup
  //     attribute={{
  //       id: 'container',
  //       width,
  //       height,
  //       display: 'flex',
  //       flexDirection: 'row',
  //       flexWrap: 'nowrap',
  //       fill: '#f00',
  //       opacity: 0.1
  //     }}
  //   >
  //     <VGroup
  //       attribute={{
  //         id: 'container-left',
  //         width: leftContainerWidth,
  //         height,
  //         display: 'flex',
  //         flexDirection: 'column',
  //         fill: '#f80',
  //         opacity: 0.1,
  //         alignItems: 'flex-end'
  //       }}
  //       stateProxy={(stateName: string) => {
  //         if (stateName === 'hover') {
  //           return {
  //             fill: '#080'
  //           };
  //         }
  //       }}
  //       onMouseEnter={(event: IFederatedEvent) => {
  //         event.currentTarget.addState('hover', true, true);
  //       }}
  //       onMouseLeave={(event: IFederatedEvent) => {
  //         event.currentTarget.removeState('hover', true);
  //       }}
  //     >
  //       <VImage
  //         attribute={{
  //           id: 'hierarchy',
  //           image:
  //             '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.81235 11.3501C5.48497 11.612 5 11.3789 5 10.9597L5 5.04031C5 4.62106 5.48497 4.38797 5.81235 4.64988L9.51196 7.60957C9.76216 7.80973 9.76216 8.19027 9.51196 8.39044L5.81235 11.3501Z" fill="#141414" fill-opacity="0.65"/></svg>',
  //           width: 18,
  //           height: 15,
  //           boundsPadding: [10, 0, 0, 0]
  //         }}
  //         stateProxy={(stateName: string) => {
  //           if (stateName === 'hover') {
  //             return {
  //               background: {
  //                 fill: '#888',
  //                 cornerRadius: 5,
  //                 expandX: 2,
  //                 expandY: 2
  //               }
  //             };
  //           }
  //         }}
  //         onMouseEnter={(event: IFederatedEvent) => {
  //           event.currentTarget.addState('hover', true, true);
  //         }}
  //         onMouseLeave={(event: IFederatedEvent) => {
  //           event.currentTarget.removeState('hover', true);
  //         }}
  //       ></VImage>
  //     </VGroup>
  //     <VGroup
  //       attribute={{
  //         id: 'container-middle',
  //         width: width - leftContainerWidth - 40,
  //         height,
  //         display: 'flex',
  //         flexDirection: 'column',
  //         flexWrap: 'nowrap',
  //         fill: '#f88',
  //         opacity: 0.1
  //       }}
  //     >
  //       <VGroup
  //         attribute={{
  //           id: 'container-middle-top',
  //           width: width - leftContainerWidth - 40,
  //           height: 30,
  //           display: 'flex',
  //           alignItems: 'flex-end',
  //           // flexWrap: 'nowrap',
  //           fill: '#848',
  //           opacity: 0.1
  //         }}
  //       >
  //         <VText
  //           attribute={{
  //             text: value,
  //             fontSize: rowPathLength === 1 ? 14 : 14,
  //             fontFamily: 'sans-serif',
  //             fill: 'black',
  //             boundsPadding: [0, 0, 5, 0],
  //             textAlign: 'left',
  //             textBaseline: 'top'
  //           }}
  //         ></VText>
  //       </VGroup>
  //       <VGroup
  //         attribute={{
  //           id: 'container-middle-bottom',
  //           width: width - leftContainerWidth - 40,
  //           height: height - 30,
  //           display: 'flex',
  //           // flexWrap: 'nowrap',
  //           fill: '#088',
  //           opacity: 0.1
  //         }}
  //       >
  //         <VGroup
  //           attribute={{
  //             id: 'container-middle-bottom-left',
  //             width: 50,
  //             height: height - 30,
  //             display: 'flex',
  //             fill: '#0f8',
  //             opacity: 0.1,
  //             justifyContent: 'flex-end'
  //           }}
  //         >
  //           <VText
  //             attribute={{
  //               text: '分组',
  //               fontSize: 12,
  //               fontFamily: 'sans-serif',
  //               fill: 'black',
  //               boundsPadding: [10, 10, 0, 0],
  //               textAlign: 'left',
  //               textBaseline: 'top'
  //             }}
  //           ></VText>
  //         </VGroup>
  //         <VGroup
  //           attribute={{
  //             id: 'container-middle-bottom-right',
  //             width: width - leftContainerWidth - 40 - 50,
  //             height: height - 30,
  //             display: 'flex',
  //             // alignItems: 'center',
  //             fill: '#008',
  //             opacity: 0.1
  //           }}
  //         >
  //           {children.map((child, index) => {
  //             return (
  //               <VGroup
  //                 attribute={{
  //                   id: `tag-group-${index}`,
  //                   display: 'flex',
  //                   flexWrap: 'nowrap',
  //                   alignItems: 'center',
  //                   // alignContent: 'center',
  //                   boundsPadding: [5, 5, 5, 10]
  //                 }}
  //               >
  //                 <VTag
  //                   attribute={{
  //                     text: child.value,
  //                     textStyle: {
  //                       fontSize: 12,
  //                       fontFamily: 'sans-serif',
  //                       fill: 'rgb(51, 101, 238)'
  //                     },
  //                     panel: {
  //                       visible: true,
  //                       fill: 'rgb(220, 240, 252)',
  //                       cornerRadius: 5
  //                     }
  //                   }}
  //                 ></VTag>
  //                 <VImage
  //                   attribute={{
  //                     width: 10,
  //                     height: 10,
  //                     image:
  //                       '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 11L11 6L24 19L37 6L42 11L29 24L42 37L37 42L24 29L11 42L6 37L19 24L6 11Z" fill="#9b9b9b" stroke="#9b9b9b" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  //                     boundsPadding: [0, 0, 0, 5]
  //                   }}
  //                 ></VImage>
  //               </VGroup>
  //             );
  //           })}
  //         </VGroup>
  //       </VGroup>
  //     </VGroup>
  //     <VGroup
  //       attribute={{
  //         id: 'container-right',
  //         width: 40,
  //         height,
  //         display: 'flex',
  //         flexDirection: 'column',
  //         fill: '#f08',
  //         opacity: 0.1
  //       }}
  //     >
  //       {rowPathLength === 1 ? (
  //         <VImage
  //           attribute={{
  //             id: 'add',
  //             image:
  //               '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 4H18V18H4V30H18V44H30V30H44V18H30V4Z" fill="rgb(51, 101, 238)" stroke="rgb(51, 101, 238)" stroke-width="1" stroke-linejoin="round"/></svg>',
  //             width: 16,
  //             height: 16,
  //             boundsPadding: [12, 0, 0, 5]
  //           }}
  //         ></VImage>
  //       ) : null}
  //       <VImage
  //         attribute={{
  //           id: 'filter',
  //           image: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  //         <path d="M1.29609 1C0.745635 1 0.444871 1.64195 0.797169 2.06491L4.64953 6.68988V9.81861C4.64953 9.89573 4.69727 9.9648 4.76942 9.99205L7.11236 10.877C7.27164 10.9372 7.4419 10.8195 7.4419 10.6492V6.68988L11.2239 2.06012C11.5703 1.63606 11.2685 1 10.721 1H1.29609Z" stroke="#141414" stroke-opacity="0.65" stroke-width="1.18463" stroke-linejoin="round"/>
  //         </svg>`,
  //           width: 16,
  //           height: 16,
  //           boundsPadding: [8, 0, 0, 5]
  //         }}
  //       ></VImage>
  //     </VGroup>
  //   </VGroup>
  // );
  // // stage.defaultLayer.add(container);

  // const record = {
  //   bloggerId: 1,
  //   bloggerName: '虚拟主播小花',
  //   bloggerAvatar: base64,
  //   introduction: '大家好，我是虚拟主播小花。喜欢游戏、动漫和美食的小仙女，希望通过直播和大家分享快乐时光。',
  //   fansCount: 400,
  //   worksCount: 10,
  //   viewCount: 5,
  //   city: '梦幻之都',
  //   tags: ['游戏', '动漫', '美食']
  // };
  // {
  //   const width = 260;
  //   const height = 80;
  //   // stage.defaultLayer.add(
  //   //   <VGroup
  //   //     attribute={{
  //   //       y: 200,
  //   //       id: 'container',
  //   //       width,
  //   //       height,
  //   //       display: 'flex',
  //   //       flexWrap: 'wrap',
  //   //       justifyContent: 'flex-start',
  //   //       alignContent: 'center'
  //   //     }}
  //   //   >
  //   //     <VGroup
  //   //       attribute={{
  //   //         id: 'container-left',
  //   //         width: 60,
  //   //         height,
  //   //         fill: 'red',
  //   //         opacity: 0.1,
  //   //         display: 'flex',
  //   //         justifyContent: 'space-around',
  //   //         alignItems: 'center'
  //   //       }}
  //   //     >
  //   //       <VImage
  //   //         attribute={{
  //   //           id: 'icon0',
  //   //           width: 50,
  //   //           height: 50,
  //   //           image: record.bloggerAvatar,
  //   //           cornerRadius: 25
  //   //         }}
  //   //       ></VImage>
  //   //     </VGroup>
  //   //     <VGroup
  //   //       attribute={{
  //   //         id: 'container-right',
  //   //         width: width - 60,
  //   //         height,
  //   //         fill: 'yellow',
  //   //         opacity: 0.1,
  //   //         display: 'flex',
  //   //         flexDirection: 'column',
  //   //         justifyContent: 'space-around',
  //   //         alignItems: 'center',
  //   //         flexWrap: 'nowrap'
  //   //       }}
  //   //     >
  //   //       <VGroup
  //   //         attribute={{
  //   //           id: 'container-right-top',
  //   //           fill: 'red',
  //   //           opacity: 0.1,
  //   //           width: width - 60,
  //   //           height: height / 2,
  //   //           display: 'flex',
  //   //           flexWrap: 'wrap',
  //   //           justifyContent: 'flex-start',
  //   //           alignItems: 'center'
  //   //           // clip: true
  //   //         }}
  //   //       >
  //   //         <VText
  //   //           attribute={{
  //   //             id: 'bloggerName',
  //   //             text: record.bloggerName,
  //   //             fontSize: 13,
  //   //             fontFamily: 'sans-serif',
  //   //             fill: 'black',
  //   //             textAlign: 'left',
  //   //             textBaseline: 'top',
  //   //             boundsPadding: [0, 0, 0, 10]
  //   //           }}
  //   //         ></VText>
  //   //         <VImage
  //   //           attribute={{
  //   //             id: 'location-icon',
  //   //             width: 15,
  //   //             height: 15,
  //   //             image:
  //   //               '<svg t="1684484908497" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2429" width="200" height="200"><path d="M512 512a136.533333 136.533333 0 1 1 136.533333-136.533333 136.533333 136.533333 0 0 1-136.533333 136.533333z m0-219.272533a81.92 81.92 0 1 0 81.92 81.92 81.92 81.92 0 0 0-81.92-81.92z" fill="#0073FF" p-id="2430"></path><path d="M512 831.214933a27.306667 27.306667 0 0 1-19.2512-8.055466l-214.493867-214.357334a330.5472 330.5472 0 1 1 467.490134 0l-214.357334 214.357334a27.306667 27.306667 0 0 1-19.387733 8.055466z m0-732.091733a275.933867 275.933867 0 0 0-195.106133 471.04L512 765.269333l195.106133-195.106133A275.933867 275.933867 0 0 0 512 99.1232z" fill="#0073FF" p-id="2431"></path><path d="M514.321067 979.490133c-147.456 0-306.107733-37.000533-306.107734-118.3744 0-45.602133 51.746133-81.92 145.681067-102.4a27.306667 27.306667 0 1 1 11.605333 53.384534c-78.370133 17.066667-102.673067 41.915733-102.673066 49.015466 0 18.432 88.064 63.761067 251.4944 63.761067s251.4944-45.192533 251.4944-63.761067c0-7.3728-25.258667-32.768-106.496-49.834666a27.306667 27.306667 0 1 1 11.195733-53.384534c96.6656 20.343467 150.186667 56.9344 150.186667 103.2192-0.273067 80.964267-158.9248 118.3744-306.3808 118.3744z" fill="#0073FF" p-id="2432"></path></svg>',
  //   //             boundsPadding: [0, 0, 0, 10]
  //   //           }}
  //   //         ></VImage>
  //   //         <VText
  //   //           attribute={{
  //   //             id: 'locationName',
  //   //             text: record.city,
  //   //             fontSize: 11,
  //   //             fontFamily: 'sans-serif',
  //   //             fill: '#6f7070',
  //   //             textAlign: 'left',
  //   //             textBaseline: 'top'
  //   //           }}
  //   //         ></VText>
  //   //       </VGroup>
  //   //       <VGroup
  //   //         attribute={{
  //   //           id: 'container-right-bottom',
  //   //           fill: 'green',
  //   //           opacity: 0.1,
  //   //           width: width - 60,
  //   //           height: height / 2,
  //   //           display: 'flex',
  //   //           flexWrap: 'wrap',
  //   //           justifyContent: 'flex-start',
  //   //           alignItems: 'center'
  //   //         }}
  //   //       >
  //   //         {record?.tags?.length
  //   //           ? record.tags.map((str, i) => (
  //   //               // <VText attribute={{
  //   //               //   text: str,
  //   //               //   fontSize: 10,
  //   //               //   fontFamily: 'sans-serif',
  //   //               //   fill: 'rgb(51, 101, 238)',
  //   //               //   textAlign: 'left',
  //   //               //   textBaseline: 'rop',
  //   //               //   boundsPadding: [0, 0, 0, 10],
  //   //               // }}></VText>
  //   //               <VTag
  //   //                 attribute={{
  //   //                   text: str,
  //   //                   textStyle: {
  //   //                     fontSize: 10,
  //   //                     fontFamily: 'sans-serif',
  //   //                     fill: 'rgb(51, 101, 238)'
  //   //                     // textAlign: 'left',
  //   //                     // textBaseline: 'rop',
  //   //                   },
  //   //                   panel: {
  //   //                     visible: true,
  //   //                     fill: '#e6fffb',
  //   //                     lineWidth: 1,
  //   //                     cornerRadius: 4
  //   //                   },
  //   //                   boundsPadding: [0, 0, 0, 10]
  //   //                 }}
  //   //               ></VTag>
  //   //             ))
  //   //           : null}
  //   //       </VGroup>
  //   //     </VGroup>
  //   //   </VGroup>
  //   // );
  // }

  // stage.defaultLayer.add(
  //   <VGroup
  //     attribute={{
  //       y: 200
  //     }}
  //   >
  //     {symbolList.map((str, i) => (
  //       <VSymbol
  //         onMouseEnter={e => {
  //           e.target.setAttribute('fill', 'blue');
  //         }}
  //         attribute={{
  //           symbolType: str,
  //           x: ((i * 100) % 500) + 100,
  //           y: (Math.floor((i * 100) / 500) + 1) * 100,
  //           size: 60,
  //           background:
  //             '<svg t="1683876749384" class="icon" viewBox="0 0 1059 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5625" width="200" height="200"><path d="M928.662069 17.655172h-812.137931v208.331035h812.137931z" fill="#F1543F" p-id="5626"></path><path d="M1020.468966 275.42069l-236.579311 367.227586c0-17.655172-3.531034-35.310345-14.124138-49.434483-17.655172-24.717241-56.496552-28.248276-81.213793-45.903448-21.186207-14.124138-35.310345-42.372414-60.027586-56.496552L928.662069 17.655172l24.717241 14.124138c88.275862 49.434483 116.524138 158.896552 67.089656 243.64138M416.662069 490.813793c-21.186207 14.124138-38.841379 42.372414-60.027586 56.496552-24.717241 17.655172-63.558621 24.717241-81.213793 45.903448-10.593103 14.124138-10.593103 31.77931-14.124138 49.434483L24.717241 275.42069C-24.717241 190.675862 3.531034 81.213793 91.806897 31.77931l24.717241-14.124138 300.137931 473.158621z" fill="#FF7058" p-id="5627"></path><path d="M893.351724 656.772414c0 38.841379-35.310345 70.62069-45.903448 102.4-10.593103 35.310345-3.531034 81.213793-24.717242 109.462069-21.186207 28.248276-67.089655 35.310345-98.868965 56.496551-31.77931 28.248276-52.965517 70.62069-88.275862 81.213794-35.310345 10.593103-77.682759-10.593103-112.993104-10.593104-38.841379 0-81.213793 21.186207-116.524137 10.593104S349.572414 953.37931 317.793103 932.193103c-31.77931-21.186207-77.682759-28.248276-98.868965-56.496551-21.186207-28.248276-14.124138-74.151724-24.717241-109.462069-10.593103-35.310345-45.903448-67.089655-45.903449-102.4 0-38.841379 35.310345-70.62069 45.903449-105.931035 10.593103-35.310345 3.531034-81.213793 24.717241-109.462069 21.186207-28.248276 67.089655-35.310345 98.868965-56.496551 28.248276-21.186207 49.434483-63.558621 88.275863-74.151725 35.310345-10.593103 77.682759 10.593103 116.524137 10.593104 38.841379 0 81.213793-21.186207 112.993104-10.593104 35.310345 10.593103 56.496552 52.965517 88.275862 74.151725 31.77931 21.186207 77.682759 28.248276 98.868965 56.496551 21.186207 28.248276 14.124138 74.151724 24.717242 109.462069 10.593103 31.77931 45.903448 63.558621 45.903448 98.868966" fill="#F8B64C" p-id="5628"></path><path d="M790.951724 656.772414c0 144.772414-120.055172 264.827586-268.358621 264.827586-148.303448 0-268.358621-120.055172-268.35862-264.827586s120.055172-264.827586 268.35862-264.827586c148.303448 0 268.358621 120.055172 268.358621 264.827586" fill="#FFD15C" p-id="5629"></path><path d="M706.206897 589.682759h-123.586207c-7.062069 0-10.593103-3.531034-14.124138-10.593104L529.655172 466.096552c-3.531034-14.124138-21.186207-14.124138-28.248275 0l-38.84138 112.993103c-3.531034 7.062069-7.062069 10.593103-14.124138 10.593104H335.448276c-14.124138 0-21.186207 17.655172-7.062069 24.717241l98.868965 70.62069c3.531034 3.531034 7.062069 10.593103 3.531035 14.124138L391.944828 812.137931c-3.531034 14.124138 10.593103 24.717241 21.186206 14.124138l98.868966-70.62069c3.531034-3.531034 10.593103-3.531034 17.655172 0l98.868966 70.62069c10.593103 7.062069 24.717241-3.531034 21.186207-14.124138l-38.841379-112.993103c-3.531034-7.062069 0-10.593103 3.531034-14.124138l98.868966-70.62069c14.124138-7.062069 7.062069-24.717241-7.062069-24.717241" fill="#F8B64C" p-id="5630"></path></svg>',
  //           texture: 'diamond',
  //           texturePadding: 0,
  //           textureSize: 3,
  //           textureColor: 'red'
  //           // onMouseEnter={(symbol) => {
  //           //   symbol.setAttribute('fill', 'blue')
  //           // }}
  //         }}
  //       />
  //     ))}
  //     <VRichText attribute={{ x: 600, y: 600, width: 0, height: 0, textAlign: 'right' }}>
  //       <VRichText.Text attribute={{ fill: 'red', text: 'aaa' }}>富文本全局</VRichText.Text>
  //       <VRichText.Image attribute={{ image: svg, width: 30, height: 30, id: 'circle-0' }}></VRichText.Image>
  //     </VRichText>
  //   </VGroup>
  // );

  stage.defaultLayer.add(
    <>
      <VText attribute={{ text: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', x: 200, y: 200, fill: 'blue' }}></VText>
    </>
  );

  // const graphics: IGraphic[] = [];
  // symbolList.forEach((st, i) => {
  //   const symbol = createSymbol({});
  //   symbol.addEventListener('mouseenter', () => {
  //     symbol.setAttribute('fill', 'blue');
  //   })
  //   graphics.push(symbol);
  // })

  // graphics.forEach(g => {
  //   stage.defaultLayer.add(g);
  // })

  window.stage = stage;
};
