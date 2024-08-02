import { GUI } from 'lil-gui';
import '@visactor/vrender';
import { createGroup, Stage, createArc } from '@visactor/vrender';
import { createRenderer } from '../../util/render';
import { ArcLabel } from '../../../src';
import { IPointLike } from '@visactor/vutils';

const pieGenerator = () => {
  const spec: any = {
    attribute: {
      width: 800,
      height: 500,
      pickable: false,
      zIndex: 300
    },
    _uid: 14,
    type: 'group',
    name: 'pie_9',
    // children: [
    //   {
    //     attribute: {
    //       fill: '#1f77b4',
    //       x: 100,
    //       y: 100,
    //       startAngle: 0,
    //       endAngle: 1.0927278795094932,
    //       innerRadius: 0,
    //       outerRadius: 80,
    //       fillOpacity: 1
    //     },
    //     _uid: 52,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       fill: '#aec7e8',
    //       x: 100,
    //       y: 100,
    //       startAngle: 1.0927278795094932,
    //       endAngle: 2.731819698773733,
    //       innerRadius: 0,
    //       outerRadius: 80,
    //       fillOpacity: 1
    //     },
    //     _uid: 53,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       fill: '#ff7f0e',
    //       x: 100,
    //       y: 100,
    //       startAngle: 2.731819698773733,
    //       endAngle: 5.463639397547466,
    //       innerRadius: 0,
    //       outerRadius: 80,
    //       fillOpacity: 1
    //     },
    //     _uid: 54,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       fill: '#ffbb78',
    //       x: 100,
    //       y: 100,
    //       startAngle: 5.463639397547466,
    //       endAngle: 6.283185307179586,
    //       innerRadius: 0,
    //       outerRadius: 80,
    //       fillOpacity: 1
    //     },
    //     _uid: 55,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: -1.5707963267948966,
    //       endAngle: 1.357168026350791,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#1664FF',
    //       stroke: '#1664FF',
    //       pickable: true
    //     },
    //     _uid: 15,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 1.357168026350791,
    //       endAngle: 3.0988669935009723,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#1AC6FF',
    //       stroke: '#1AC6FF',
    //       pickable: true
    //     },
    //     _uid: 16,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 3.0988669935009723,
    //       endAngle: 3.609689958974673,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#FF8A00',
    //       stroke: '#FF8A00',
    //       pickable: true
    //     },
    //     _uid: 17,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 3.609689958974673,
    //       endAngle: 3.9238492243336522,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#3CC780',
    //       stroke: '#3CC780',
    //       pickable: true
    //     },
    //     _uid: 18,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 3.9238492243336522,
    //       endAngle: 4.151928850984271,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#7442D4',
    //       stroke: '#7442D4',
    //       pickable: true
    //     },
    //     _uid: 19,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 4.151928850984271,
    //       endAngle: 4.329742995177454,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#FFC400',
    //       stroke: '#FFC400',
    //       pickable: true
    //     },
    //     _uid: 20,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 4.329742995177454,
    //       endAngle: 4.492477494633405,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#304D77',
    //       stroke: '#304D77',
    //       pickable: true
    //     },
    //     _uid: 21,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 4.492477494633405,
    //       endAngle: 4.71238898038469,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#B48DEB',
    //       stroke: '#B48DEB',
    //       pickable: true
    //     },
    //     _uid: 22,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#2E62F1',
    //       stroke: '#2E62F1',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: -1.832595714594046,
    //       endAngle: -1.3089969389957472,
    //       outerRadius: 174.9244056767206,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 105,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#4F44CF',
    //       stroke: '#4F44CF',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: -1.3089969389957472,
    //       endAngle: -0.7853981633974485,
    //       outerRadius: 116.50796003236482,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 106,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#4DC36A',
    //       stroke: '#4DC36A',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: -0.7853981633974483,
    //       endAngle: -0.2617993877991495,
    //       outerRadius: 69.75215161125244,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 107,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FF6341',
    //       stroke: '#FF6341',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: -0.2617993877991494,
    //       endAngle: 0.2617993877991494,
    //       outerRadius: 64.2079052714386,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 108,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FF8406',
    //       stroke: '#FF8406',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 0.2617993877991493,
    //       endAngle: 0.7853981633974481,
    //       outerRadius: 47.60042294494964,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 109,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#5AC8FA',
    //       stroke: '#5AC8FA',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 0.7853981633974481,
    //       endAngle: 1.3089969389957468,
    //       outerRadius: 42.68391001012817,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 110,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#003A8C',
    //       stroke: '#003A8C',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 1.3089969389957472,
    //       endAngle: 1.832595714594046,
    //       outerRadius: 24.53880218925232,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 111,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#98DD62',
    //       stroke: '#98DD62',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 1.832595714594046,
    //       endAngle: 2.3561944901923444,
    //       outerRadius: 20.797393185242615,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 112,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#07A199',
    //       stroke: '#07A199',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 2.3561944901923444,
    //       endAngle: 2.879793265790643,
    //       outerRadius: 19.381967826377565,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 113,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FFCC00',
    //       stroke: '#FFCC00',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 2.8797932657906435,
    //       endAngle: 3.4033920413889422,
    //       outerRadius: 13.31776892117981,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 114,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#B08AE2',
    //       stroke: '#B08AE2',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 3.403392041388942,
    //       endAngle: 3.926990816987241,
    //       outerRadius: 12.487696501669921,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 115,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#87DBDD',
    //       stroke: '#87DBDD',
    //       x: 359.5,
    //       y: 238,
    //       startAngle: 3.926990816987241,
    //       endAngle: 4.4505895925855405,
    //       outerRadius: 5.705389211535645,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 116,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    /** legend2
     * #FF8406
     * #4DC36A
     *
     */
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FF8406',
    //       stroke: '#FF8406',
    //       x: 301,
    //       y: 230,
    //       startAngle: 1.5707963267948963,
    //       endAngle: 3.6651914291880923,
    //       outerRadius: 53.19603101629562,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 194,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#4DC36A',
    //       stroke: '#4DC36A',
    //       x: 301,
    //       y: 230,
    //       startAngle: -0.5235987755982989,
    //       endAngle: 1.5707963267948963,
    //       outerRadius: 94.81139665690232,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 227,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#2E62F1',
    //       stroke: '#2E62F1',
    //       x: 301,
    //       y: 230,
    //       startAngle: -2.617993877991494,
    //       endAngle: -0.5235987755982989,
    //       outerRadius: 147.6613283727806,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 359,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    /** legend3 */
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#2E62F1',
    //       stroke: '#2E62F1',
    //       x: 301,
    //       y: 230,
    //       startAngle: -2.617993877991494,
    //       endAngle: -0.5235987755982989,
    //       outerRadius: 147.6613283727806,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 722,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#4DC36A',
    //       stroke: '#4DC36A',
    //       x: 301,
    //       y: 230,
    //       startAngle: -0.5235987755982989,
    //       endAngle: 1.5707963267948963,
    //       outerRadius: 94.81139665690232,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 821,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FF8406',
    //       stroke: '#FF8406',
    //       x: 301,
    //       y: 230,
    //       startAngle: 1.5707963267948963,
    //       endAngle: 3.6651914291880923,
    //       outerRadius: 53.19603101629562,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 887,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#2E62F1',
    //       padAngle: 0,
    //       stroke: '#2E62F1',
    //       x: 448,
    //       y: 250,
    //       startAngle: -1.5707963267948966,
    //       endAngle: 0.5900002955110919,
    //       outerRadius: 225,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       pickable: true,
    //       zIndex: 0,
    //       cursor: null
    //     },
    //     _uid: 52,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#4DC36A',
    //       padAngle: 0,
    //       stroke: '#4DC36A',
    //       x: 448,
    //       y: 250,
    //       startAngle: 0.5900002955110919,
    //       endAngle: 2.49844308939151,
    //       outerRadius: 225,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       pickable: true,
    //       zIndex: 0,
    //       cursor: null
    //     },
    //     _uid: 53,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FF8406',
    //       padAngle: 0,
    //       stroke: '#FF8406',
    //       x: 448,
    //       y: 250,
    //       startAngle: 2.49844308939151,
    //       endAngle: 3.7353550272662632,
    //       outerRadius: 225,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       pickable: true,
    //       zIndex: 0,
    //       cursor: null
    //     },
    //     _uid: 54,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FFCC00',
    //       padAngle: 0,
    //       stroke: '#FFCC00',
    //       x: 448,
    //       y: 250,
    //       startAngle: 3.7353550272662632,
    //       endAngle: 4.336440130281694,
    //       outerRadius: 225,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       pickable: true,
    //       zIndex: 0,
    //       cursor: null
    //     },
    //     _uid: 55,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#4F44CF',
    //       padAngle: 0,
    //       stroke: '#4F44CF',
    //       x: 448,
    //       y: 250,
    //       startAngle: 4.336440130281694,
    //       endAngle: 4.71238898038469,
    //       outerRadius: 225,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       pickable: true,
    //       zIndex: 0,
    //       cursor: null
    //     },
    //     _uid: 56,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#5AC8FA',
    //       padAngle: 0,
    //       stroke: '#5AC8FA',
    //       x: 448,
    //       y: 250,
    //       startAngle: 4.71238898038469,
    //       endAngle: 4.71238898038469,
    //       outerRadius: 225,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 57,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    /** rose chart label */
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       x: 267,
    //       y: 238,
    //       startAngle: -2.617993877991494,
    //       endAngle: -0.5235987755982989,
    //       outerRadius: 161.12600000000003,
    //       innerRadius: 47.6,
    //       fill: '#1664FF',
    //       stroke: '#1664FF',
    //       pickable: true
    //     },
    //     _uid: 42,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       x: 267,
    //       y: 238,
    //       startAngle: -0.5235987755982989,
    //       endAngle: 1.5707963267948963,
    //       outerRadius: 83.30000000000001,
    //       innerRadius: 47.6,
    //       fill: '#1AC6FF',
    //       stroke: '#1AC6FF',
    //       pickable: true
    //     },
    //     _uid: 43,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       x: 267,
    //       y: 238,
    //       startAngle: 1.5707963267948963,
    //       endAngle: 3.6651914291880923,
    //       outerRadius: 56.882000000000005,
    //       innerRadius: 47.6,
    //       fill: '#FF8A00',
    //       stroke: '#FF8A00',
    //       pickable: true
    //     },
    //     _uid: 44,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    /** rose chart inner label */
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#207BFE',
    //       stroke: '#207BFE',
    //       x: 391.5,
    //       y: 221.5,
    //       startAngle: -2.0943951023931953,
    //       endAngle: -1.0471975511965979,
    //       outerRadius: 207.52363539155942,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 76,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#00CFFF',
    //       stroke: '#00CFFF',
    //       x: 391.5,
    //       y: 221.5,
    //       startAngle: -1.0471975511965979,
    //       endAngle: -1.1102230246251565e-16,
    //       outerRadius: 183.28748871341259,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 77,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#FC7703',
    //       stroke: '#FC7703',
    //       x: 391.5,
    //       y: 221.5,
    //       startAngle: -1.1102230246251565e-16,
    //       endAngle: 1.0471975511965974,
    //       outerRadius: 118.79343912202673,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 78,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#5BCF78',
    //       stroke: '#5BCF78',
    //       x: 391.5,
    //       y: 221.5,
    //       startAngle: 1.0471975511965979,
    //       endAngle: 2.0943951023931953,
    //       outerRadius: 108.41543492632323,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 79,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#2F4DE0',
    //       stroke: '#2F4DE0',
    //       x: 391.5,
    //       y: 221.5,
    //       startAngle: 2.0943951023931953,
    //       endAngle: 3.1415926535897927,
    //       outerRadius: 57.728415747129056,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 80,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       cornerRadius: 0,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       fill: '#94D8FF',
    //       stroke: '#94D8FF',
    //       x: 391.5,
    //       y: 221.5,
    //       startAngle: 3.1415926535897927,
    //       endAngle: 4.18879020478639,
    //       outerRadius: 36.106254188508224,
    //       innerRadius: 0,
    //       pickable: true
    //     },
    //     _uid: 81,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
    /** centerOffset **/
    children: [
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 381.44300790397,
          y: 203.9338884572474,
          startAngle: -1.5707963267948966,
          endAngle: 1.357168026350791,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#1664FF',
          stroke: '#1664FF',
          pickable: true
        },
        _uid: 25,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 365.39080756129067,
          y: 212.9169291866744,
          startAngle: 1.357168026350791,
          endAngle: 3.0988669935009723,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#1AC6FF',
          stroke: '#1AC6FF',
          pickable: true
        },
        _uid: 26,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 361.7253249850388,
          y: 202.88914037608043,
          startAngle: 3.0988669935009723,
          endAngle: 3.609689958974673,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#FF8A00',
          stroke: '#FF8A00',
          pickable: true
        },
        _uid: 27,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 363.39140419167626,
          y: 199.14759245974489,
          startAngle: 3.609689958974673,
          endAngle: 3.9238492243336522,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#3CC780',
          stroke: '#3CC780',
          pickable: true
        },
        _uid: 28,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 365.25493159576075,
          y: 197.18980662042398,
          startAngle: 3.9238492243336522,
          endAngle: 4.151928850984271,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#7442D4',
          stroke: '#7442D4',
          pickable: true
        },
        _uid: 29,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 366.95729604713523,
          y: 196.09136145100572,
          startAngle: 4.151928850984271,
          endAngle: 4.329742995177454,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#FFC400',
          stroke: '#FFC400',
          pickable: true
        },
        _uid: 30,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 368.5325841262034,
          y: 195.45042184010518,
          startAngle: 4.329742995177454,
          endAngle: 4.492477494633405,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#304D77',
          stroke: '#304D77',
          pickable: true
        },
        _uid: 31,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          visible: true,
          lineWidth: 0,
          fillOpacity: 1,
          padAngle: 0,
          x: 370.40265688908954,
          y: 195.0603904454482,
          startAngle: 4.492477494633405,
          endAngle: 4.71238898038469,
          outerRadius: 164,
          innerRadius: 0,
          cornerRadius: 0,
          fill: '#B48DEB',
          stroke: '#B48DEB',
          pickable: true
        },
        _uid: 32,
        type: 'arc',
        children: []
      }
    ]
  };
  return spec;
};

const originData = [
  {
    id: 'AAA',
    value: 4
  },
  {
    id: 'BBB',
    value: 6
  },
  {
    id: 'CCC',
    value: 10
  },
  {
    id: 'DDD',
    value: 3
  }
];

const latestData = [
  {
    type: 'oxygen',
    value: '46.60'
    // __VCHART_DEFAULT_DATA_INDEX: 0,
    // __VCHART_DEFAULT_DATA_KEY: 'oxygen_oxygen_0',
    // __VCHART_ARC_RATIO: 0.4660000000000001,
    // __VCHART_ARC_START_ANGLE: -1.5707963267948966,
    // __VCHART_ARC_END_ANGLE: 1.357168026350791,
    // __VCHART_ARC_MIDDLE_ANGLE: -0.10681415022205276,
    // __VCHART_ARC_RADIAN: 2.9279643531456876,
    // __VCHART_ARC_QUADRANT: 1,
    // __VCHART_ARC_K: 1,
    // VGRAMMAR_DATA_ID_KEY_16: 0
  },
  {
    type: 'silicon11111111',
    value: '27.72',
    __VCHART_DEFAULT_DATA_INDEX: 1,
    __VCHART_DEFAULT_DATA_KEY: 'silicon_silicon_0',
    __VCHART_ARC_RATIO: 0.2772,
    __VCHART_ARC_START_ANGLE: 1.357168026350791,
    __VCHART_ARC_END_ANGLE: 3.0988669935009723,
    __VCHART_ARC_MIDDLE_ANGLE: 2.2280175099258814,
    __VCHART_ARC_RADIAN: 1.7416989671501812,
    __VCHART_ARC_QUADRANT: 3,
    __VCHART_ARC_K: 0.5948497854077253,
    VGRAMMAR_DATA_ID_KEY_16: 1
  }
  // {
  //   type: 'aluminum',
  //   value: '8.13',
  //   __VCHART_DEFAULT_DATA_INDEX: 2,
  //   __VCHART_DEFAULT_DATA_KEY: 'aluminum_aluminum_0',
  //   __VCHART_ARC_RATIO: 0.08130000000000003,
  //   __VCHART_ARC_START_ANGLE: 3.0988669935009723,
  //   __VCHART_ARC_END_ANGLE: 3.609689958974673,
  //   __VCHART_ARC_MIDDLE_ANGLE: 3.3542784762378224,
  //   __VCHART_ARC_RADIAN: 0.5108229654737005,
  //   __VCHART_ARC_QUADRANT: 4,
  //   __VCHART_ARC_K: 0.17446351931330473,
  //   VGRAMMAR_DATA_ID_KEY_16: 2
  // },
  // {
  //   type: 'iron',
  //   value: '5',
  //   __VCHART_DEFAULT_DATA_INDEX: 3,
  //   __VCHART_DEFAULT_DATA_KEY: 'iron_iron_0',
  //   __VCHART_ARC_RATIO: 0.05000000000000001,
  //   __VCHART_ARC_START_ANGLE: 3.609689958974673,
  //   __VCHART_ARC_END_ANGLE: 3.9238492243336522,
  //   __VCHART_ARC_MIDDLE_ANGLE: 3.7667695916541626,
  //   __VCHART_ARC_RADIAN: 0.31415926535897937,
  //   __VCHART_ARC_QUADRANT: 4,
  //   __VCHART_ARC_K: 0.1072961373390558,
  //   VGRAMMAR_DATA_ID_KEY_16: 3
  // },
  // {
  //   type: 'calcium',
  //   value: '3.63',
  //   __VCHART_DEFAULT_DATA_INDEX: 4,
  //   __VCHART_DEFAULT_DATA_KEY: 'calcium_calcium_0',
  //   __VCHART_ARC_RATIO: 0.036300000000000006,
  //   __VCHART_ARC_START_ANGLE: 3.9238492243336522,
  //   __VCHART_ARC_END_ANGLE: 4.151928850984271,
  //   __VCHART_ARC_MIDDLE_ANGLE: 4.037889037658962,
  //   __VCHART_ARC_RADIAN: 0.228079626650619,
  //   __VCHART_ARC_QUADRANT: 4,
  //   __VCHART_ARC_K: 0.0778969957081545,
  //   VGRAMMAR_DATA_ID_KEY_16: 4
  // },
  // {
  //   type: 'sodium',
  //   value: '2.83',
  //   __VCHART_DEFAULT_DATA_INDEX: 5,
  //   __VCHART_DEFAULT_DATA_KEY: 'sodium_sodium_0',
  //   __VCHART_ARC_RATIO: 0.028300000000000006,
  //   __VCHART_ARC_START_ANGLE: 4.151928850984271,
  //   __VCHART_ARC_END_ANGLE: 4.329742995177454,
  //   __VCHART_ARC_MIDDLE_ANGLE: 4.240835923080862,
  //   __VCHART_ARC_RADIAN: 0.17781414419318234,
  //   __VCHART_ARC_QUADRANT: 4,
  //   __VCHART_ARC_K: 0.06072961373390558,
  //   VGRAMMAR_DATA_ID_KEY_16: 5
  // },
  // {
  //   type: 'potassium',
  //   value: '2.59',
  //   __VCHART_DEFAULT_DATA_INDEX: 6,
  //   __VCHART_DEFAULT_DATA_KEY: 'potassium_potassium_0',
  //   __VCHART_ARC_RATIO: 0.025900000000000003,
  //   __VCHART_ARC_START_ANGLE: 4.329742995177454,
  //   __VCHART_ARC_END_ANGLE: 4.492477494633405,
  //   __VCHART_ARC_MIDDLE_ANGLE: 4.411110244905429,
  //   __VCHART_ARC_RADIAN: 0.1627344994559513,
  //   __VCHART_ARC_QUADRANT: 4,
  //   __VCHART_ARC_K: 0.055579399141630896,
  //   VGRAMMAR_DATA_ID_KEY_16: 6
  // },
  // {
  //   type: 'others',
  //   value: '3.5',
  //   __VCHART_DEFAULT_DATA_INDEX: 7,
  //   __VCHART_DEFAULT_DATA_KEY: 'others_others_0',
  //   __VCHART_ARC_RATIO: 0.035,
  //   __VCHART_ARC_START_ANGLE: 4.492477494633405,
  //   __VCHART_ARC_END_ANGLE: 4.71238898038469,
  //   __VCHART_ARC_MIDDLE_ANGLE: 4.602433237509048,
  //   __VCHART_ARC_RADIAN: 0.21991148575128555,
  //   __VCHART_ARC_QUADRANT: 4,
  //   __VCHART_ARC_K: 0.07510729613733905,
  //   VGRAMMAR_DATA_ID_KEY_16: 7
  // }
];

function createContent(stage: Stage) {
  const pieSpec = pieGenerator();
  const pieGroup = createGroup(pieSpec.attribute);
  pieGroup.name = pieSpec.name;
  pieGroup.id = pieSpec._uid;
  stage.defaultLayer.add(pieGroup);
  pieSpec.children.forEach(c => {
    pieGroup.add(createArc(c.attribute));
  });

  const pieLabel = new ArcLabel({
    baseMarkGroupName: pieSpec.name,
    data: pieSpec.children.map((c, index) => {
      return {
        text: 'xx'
        // text: 'test122344556778891234550987665544',
        // text: latestData[index] ? latestData[index]?.type : undefined
        // // text: originData[index].id
        // // fill: c.attribute.fill,
        // // line: {
        // //   stroke: c.attribute.stroke
        // // },
        // // lineWidth: 0
        // // ...latestData[index]

        // textType: 'rich',
        // text: [
        //   // {
        //   //   text: `NO.${index}🐾`,
        //   //   fontSize: 15,
        //   //   textAlign: 'right',
        //   //   textDecoration: 'underline',
        //   //   stroke: '#0f51b5'
        //   // }

        //   {
        //     text: 'Mapbox',
        //     fontWeight: 'bold',
        //     fontSize: 25,
        //     fill: '#3f51b5'
        //   },

        //   {
        //     text: '替代方案',
        //     fontStyle: 'italic',
        //     textDecoration: 'underline',
        //     fill: '#3f51b5'
        //   }
        // ]

        // type: 'html',
        // text: '<p>这是一个html字符串</p>'
      };
    }),
    // dataFilter: data => data.splice(0, 1),
    type: 'arc',
    // animation: false,
    animation: {
      // mode: 'same-time',
      // duration: 300,
      // easing: 'linear'
    },
    width: 800,
    height: 500,
    position: 'outside',

    // position: 'inside-outer',

    // textStyle: {
    //   // angle: 0
    //   fontSize: 16
    // },
    line: {
      line1MinLength: 40,
      line2MinLength: 60,
      // smooth: true,
      customShape: (text, attrs, path) => {
        console.log('attrs', text, attrs, path);
        let points = attrs.points as IPointLike[];
        // 绘制带圆角的折线(暂时用小转折拟合)
        const direction = points[points.length - 1].x - points[0].x > 0 ? -1 : 1;
        path.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const p1 = points[i - 1];
          const p2 = points[i % points.length];
          const p3 = points[(i + 1) % points.length];
          const { x: x1, y: y1 } = p1;
          const { x: x2, y: y2 } = p2;
          const { x: x3, y: y3 } = p3;

          const k1 = (y2 - y1) / (x2 - x1);
          const k2 = (y3 - y2) / (x3 - x2);
          const deltaX = 3;
          const deltaY1 = k1 * deltaX;
          const deltaY2 = k2 * deltaX;

          path.lineTo(p2.x + direction * deltaX, p2.y + direction * deltaY1); // 到点p1的上方
          path.lineTo(p2.x - direction * deltaX, p2.y - direction * deltaY2); // 绘制圆弧
          // path.quadraticCurveTo(p2.x - deltaX, p2.y - deltaY1, p2.x + deltaX, p2.y + deltaY2)
          // path.quadraticCurveTo(p2.x - deltaX, p2.y - deltaY1, p2.x + deltaX, p2.y + deltaY2, 2)
        }

        path.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        return path;
      },
      style: {
        lineWidth: 1,
        stroke: 'red'
      }
    },
    layout: {
      // align: 'edge'
      tangentConstraint: false
    },
    rotate: false,

    // offsetRadius: -50,

    // smartInvert: false,

    // coverEnable: false,
    // layout: {
    //   strategy: 'none'
    // },

    zIndex: 302
  });

  stage.defaultLayer.add(pieLabel);

  return { pie: pieGroup, label: pieLabel };
}

const stage = createRenderer('main', {
  width: 800,
  height: 500,
  viewBox: {
    x1: 0,
    y1: 0,
    x2: 800,
    y2: 500
  },
  enableHtmlAttribute: true
});
const { pie, label } = createContent(stage);
stage.render();
// gui
const gui = new GUI();
const guiObject = {
  name: 'Label',
  position: 'outside',
  baseMarkVisible: true,
  shapeCount: 100,
  overlap: true,
  debug() {
    label.render();
  }
};

gui.add(guiObject, 'name');
gui.add(guiObject, 'position', ['outside', 'inside']);
gui.add(guiObject, 'baseMarkVisible').onChange(value => {
  pie.forEachChildren(s => s.setAttribute('visible', !!value));
});
gui.add(guiObject, 'overlap').onChange(value => {
  label.setAttribute('overlap', {
    enable: value
  });
});

gui.add(guiObject, 'debug');
