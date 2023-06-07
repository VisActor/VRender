import { DiscreteLegend, Pager } from '../../../src';
import render from '../../util/render';

const legend = new DiscreteLegend({
  layout: 'vertical',
  title: {
    align: 'start',
    space: 12,
    textStyle: {
      fontSize: 12,
      fontWeight: 'bold',
      fillColor: '#2C3542'
    }
  },
  item: {
    spaceCol: 10,
    spaceRow: 10,
    shape: {
      space: 4,
      style: {
        size: 10,
        symbolType: 'circle',
        cursor: 'pointer'
      },
      state: {
        selectedHover: {
          opacity: 0.85
        },
        unSelected: {
          fillColor: '#D8D8D8',
          fillOpacity: 0.5
        }
      }
    },
    label: {
      space: 4,
      style: {
        fontSize: 12,
        fillColor: 'black',
        cursor: 'pointer',
        fill: true
      },
      state: {
        selectedHover: {
          opacity: 0.85
        },
        unSelected: {
          fillColor: '#D8D8D8',
          fillOpacity: 0.5
        }
      }
    },
    value: {
      alignRight: false,
      style: {
        fontSize: 12,
        fillColor: '#ccc',
        cursor: 'pointer'
      },
      state: {
        selectedHover: {
          opacity: 0.85
        },
        unSelected: {
          fillColor: '#D8D8D8'
        }
      }
    },
    background: {
      style: {
        cursor: 'pointer'
      },
      state: {
        selectedHover: {
          fill: true,
          fillOpacity: 0.7,
          fillColor: 'gray'
        },
        unSelectedHover: {
          fill: true,
          fillOpacity: 0.2,
          fillColor: 'gray'
        }
      }
    },
    focus: false,
    focusIconStyle: {
      size: 10,
      symbolType:
        'M8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1ZM8.75044 2.55077L8.75 3.75H7.25L7.25006 2.5507C4.81247 2.88304 2.88304 4.81247 2.5507 7.25006L3.75 7.25V8.75L2.55077 8.75044C2.8833 11.1878 4.81264 13.117 7.25006 13.4493L7.25 12.25H8.75L8.75044 13.4492C11.1876 13.1167 13.1167 11.1876 13.4492 8.75044L12.25 8.75V7.25L13.4493 7.25006C13.117 4.81264 11.1878 2.8833 8.75044 2.55077ZM8 5.5C9.38071 5.5 10.5 6.61929 10.5 8C10.5 9.38071 9.38071 10.5 8 10.5C6.61929 10.5 5.5 9.38071 5.5 8C5.5 6.61929 6.61929 5.5 8 5.5ZM8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7Z',
      fillColor: '#333',
      cursor: 'pointer'
    },
    visible: true,
    padding: {
      top: 2,
      bottom: 2,
      left: 2,
      right: 2
    }
  },
  autoPage: true,
  pager: {
    // animation: false,
    defaultCurrent: 4,
    handler: {
      space: 4,
      style: {
        size: 10
      }
    }
  },
  hover: true,
  select: true,
  selectMode: 'multiple',
  allowAllCanceled: false,
  items: [
    {
      label: '0',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '0',
      index: 0
    },
    {
      label: '1',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '1',
      index: 1
    },
    {
      label: '2',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '2',
      index: 2
    },
    {
      label: '3',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '3',
      index: 3
    },
    {
      label: '4',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '4',
      index: 4
    },
    {
      label: '5',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '5',
      index: 5
    },
    {
      label: '6',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '6',
      index: 6
    },
    {
      label: '7',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '7',
      index: 7
    },
    {
      label: '8',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '8',
      index: 8
    },
    {
      label: '9',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '9',
      index: 9
    },
    {
      label: '10',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '10',
      index: 10
    },
    {
      label: '11',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '11',
      index: 11
    },
    {
      label: '12',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '12',
      index: 12
    },
    {
      label: '13',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '13',
      index: 13
    },
    {
      label: '14',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '14',
      index: 14
    },
    {
      label: '15',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '15',
      index: 15
    },
    {
      label: '16',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '16',
      index: 16
    },
    {
      label: '17',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '17',
      index: 17
    },
    {
      label: '18',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '18',
      index: 18
    },
    {
      label: '19',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '19',
      index: 19
    },
    {
      label: '20',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '20',
      index: 20
    },
    {
      label: '21',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '21',
      index: 21
    },
    {
      label: '22',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '22',
      index: 22
    },
    {
      label: '23',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '23',
      index: 23
    },
    {
      label: '24',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '24',
      index: 24
    },
    {
      label: '25',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '25',
      index: 25
    },
    {
      label: '26',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '26',
      index: 26
    },
    {
      label: '27',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '27',
      index: 27
    },
    {
      label: '28',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '28',
      index: 28
    },
    {
      label: '29',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '29',
      index: 29
    },
    {
      label: '30',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '30',
      index: 30
    },
    {
      label: '31',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '31',
      index: 31
    },
    {
      label: '32',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '32',
      index: 32
    },
    {
      label: '33',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '33',
      index: 33
    },
    {
      label: '34',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '34',
      index: 34
    },
    {
      label: '35',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '35',
      index: 35
    },
    {
      label: '36',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '36',
      index: 36
    },
    {
      label: '37',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '37',
      index: 37
    },
    {
      label: '38',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '38',
      index: 38
    },
    {
      label: '39',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '39',
      index: 39
    },
    {
      label: '40',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '40',
      index: 40
    },
    {
      label: '41',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '41',
      index: 41
    },
    {
      label: '42',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '42',
      index: 42
    },
    {
      label: '43',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '43',
      index: 43
    },
    {
      label: '44',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '44',
      index: 44
    },
    {
      label: '45',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '45',
      index: 45
    },
    {
      label: '46',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '46',
      index: 46
    },
    {
      label: '47',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '47',
      index: 47
    },
    {
      label: '48',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '48',
      index: 48
    },
    {
      label: '49',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '49',
      index: 49
    },
    {
      label: '50',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '50',
      index: 50
    },
    {
      label: '51',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '51',
      index: 51
    },
    {
      label: '52',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '52',
      index: 52
    },
    {
      label: '53',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '53',
      index: 53
    },
    {
      label: '54',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '54',
      index: 54
    },
    {
      label: '55',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '55',
      index: 55
    },
    {
      label: '56',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '56',
      index: 56
    },
    {
      label: '57',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '57',
      index: 57
    },
    {
      label: '58',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '58',
      index: 58
    },
    {
      label: '59',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '59',
      index: 59
    },
    {
      label: '60',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '60',
      index: 60
    },
    {
      label: '61',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '61',
      index: 61
    },
    {
      label: '62',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '62',
      index: 62
    },
    {
      label: '63',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '63',
      index: 63
    },
    {
      label: '64',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '64',
      index: 64
    },
    {
      label: '65',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '65',
      index: 65
    },
    {
      label: '66',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '66',
      index: 66
    },
    {
      label: '67',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '67',
      index: 67
    },
    {
      label: '68',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '68',
      index: 68
    },
    {
      label: '69',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '69',
      index: 69
    },
    {
      label: '70',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '70',
      index: 70
    },
    {
      label: '71',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '71',
      index: 71
    },
    {
      label: '72',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '72',
      index: 72
    },
    {
      label: '73',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '73',
      index: 73
    },
    {
      label: '74',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '74',
      index: 74
    },
    {
      label: '75',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '75',
      index: 75
    },
    {
      label: '76',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '76',
      index: 76
    },
    {
      label: '77',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '77',
      index: 77
    },
    {
      label: '78',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '78',
      index: 78
    },
    {
      label: '79',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '79',
      index: 79
    },
    {
      label: '80',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '80',
      index: 80
    },
    {
      label: '81',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '81',
      index: 81
    },
    {
      label: '82',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '82',
      index: 82
    },
    {
      label: '83',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '83',
      index: 83
    },
    {
      label: '84',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '84',
      index: 84
    },
    {
      label: '85',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '85',
      index: 85
    },
    {
      label: '86',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '86',
      index: 86
    },
    {
      label: '87',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '87',
      index: 87
    },
    {
      label: '88',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '88',
      index: 88
    },
    {
      label: '89',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '89',
      index: 89
    },
    {
      label: '90',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '90',
      index: 90
    },
    {
      label: '91',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '91',
      index: 91
    },
    {
      label: '92',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '92',
      index: 92
    },
    {
      label: '93',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '93',
      index: 93
    },
    {
      label: '94',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '94',
      index: 94
    },
    {
      label: '95',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '95',
      index: 95
    },
    {
      label: '96',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '96',
      index: 96
    },
    {
      label: '97',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '97',
      index: 97
    },
    {
      label: '98',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '98',
      index: 98
    },
    {
      label: '99',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '99',
      index: 99
    },
    {
      label: '100',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '100',
      index: 100
    },
    {
      label: '101',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '101',
      index: 101
    },
    {
      label: '102',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '102',
      index: 102
    },
    {
      label: '103',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '103',
      index: 103
    },
    {
      label: '104',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '104',
      index: 104
    },
    {
      label: '105',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '105',
      index: 105
    },
    {
      label: '106',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '106',
      index: 106
    },
    {
      label: '107',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '107',
      index: 107
    },
    {
      label: '108',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '108',
      index: 108
    },
    {
      label: '109',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '109',
      index: 109
    },
    {
      label: '110',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '110',
      index: 110
    },
    {
      label: '111',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '111',
      index: 111
    },
    {
      label: '112',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '112',
      index: 112
    },
    {
      label: '113',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '113',
      index: 113
    },
    {
      label: '114',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '114',
      index: 114
    },
    {
      label: '115',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '115',
      index: 115
    },
    {
      label: '116',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '116',
      index: 116
    },
    {
      label: '117',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '117',
      index: 117
    },
    {
      label: '118',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '118',
      index: 118
    },
    {
      label: '119',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '119',
      index: 119
    },
    {
      label: '120',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '120',
      index: 120
    },
    {
      label: '121',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '121',
      index: 121
    },
    {
      label: '122',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '122',
      index: 122
    },
    {
      label: '123',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '123',
      index: 123
    },
    {
      label: '124',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '124',
      index: 124
    },
    {
      label: '125',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '125',
      index: 125
    },
    {
      label: '126',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '126',
      index: 126
    },
    {
      label: '127',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '127',
      index: 127
    },
    {
      label: '128',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '128',
      index: 128
    },
    {
      label: '129',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '129',
      index: 129
    },
    {
      label: '130',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '130',
      index: 130
    },
    {
      label: '131',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '131',
      index: 131
    },
    {
      label: '132',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '132',
      index: 132
    },
    {
      label: '133',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '133',
      index: 133
    },
    {
      label: '134',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '134',
      index: 134
    },
    {
      label: '135',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '135',
      index: 135
    },
    {
      label: '136',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '136',
      index: 136
    },
    {
      label: '137',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '137',
      index: 137
    },
    {
      label: '138',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '138',
      index: 138
    },
    {
      label: '139',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '139',
      index: 139
    },
    {
      label: '140',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '140',
      index: 140
    },
    {
      label: '141',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '141',
      index: 141
    },
    {
      label: '142',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '142',
      index: 142
    },
    {
      label: '143',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '143',
      index: 143
    },
    {
      label: '144',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '144',
      index: 144
    },
    {
      label: '145',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '145',
      index: 145
    },
    {
      label: '146',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '146',
      index: 146
    },
    {
      label: '147',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '147',
      index: 147
    },
    {
      label: '148',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '148',
      index: 148
    },
    {
      label: '149',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '149',
      index: 149
    },
    {
      label: '150',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '150',
      index: 150
    },
    {
      label: '151',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '151',
      index: 151
    },
    {
      label: '152',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '152',
      index: 152
    },
    {
      label: '153',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '153',
      index: 153
    },
    {
      label: '154',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '154',
      index: 154
    },
    {
      label: '155',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '155',
      index: 155
    },
    {
      label: '156',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '156',
      index: 156
    },
    {
      label: '157',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '157',
      index: 157
    },
    {
      label: '158',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '158',
      index: 158
    },
    {
      label: '159',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '159',
      index: 159
    },
    {
      label: '160',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '160',
      index: 160
    },
    {
      label: '161',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '161',
      index: 161
    },
    {
      label: '162',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '162',
      index: 162
    },
    {
      label: '163',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '163',
      index: 163
    },
    {
      label: '164',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '164',
      index: 164
    },
    {
      label: '165',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '165',
      index: 165
    },
    {
      label: '166',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '166',
      index: 166
    },
    {
      label: '167',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '167',
      index: 167
    },
    {
      label: '168',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '168',
      index: 168
    },
    {
      label: '169',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '169',
      index: 169
    },
    {
      label: '170',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '170',
      index: 170
    },
    {
      label: '171',
      shape: {
        fill: true,
        fillColor: '#70D6A3',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '171',
      index: 171
    },
    {
      label: '172',
      shape: {
        fill: true,
        fillColor: '#B4E6E2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '172',
      index: 172
    },
    {
      label: '173',
      shape: {
        fill: true,
        fillColor: '#63B5FC',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '173',
      index: 173
    },
    {
      label: '174',
      shape: {
        fill: true,
        fillColor: '#FF8F62',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '174',
      index: 174
    },
    {
      label: '175',
      shape: {
        fill: true,
        fillColor: '#FFDC83',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '175',
      index: 175
    },
    {
      label: '176',
      shape: {
        fill: true,
        fillColor: '#BCC5FD',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '176',
      index: 176
    },
    {
      label: '177',
      shape: {
        fill: true,
        fillColor: '#A29BFE',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '177',
      index: 177
    },
    {
      label: '178',
      shape: {
        fill: true,
        fillColor: '#63C4C7',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '178',
      index: 178
    },
    {
      label: '179',
      shape: {
        fill: true,
        fillColor: '#F68484',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '179',
      index: 179
    },
    {
      label: '180',
      shape: {
        fill: true,
        fillColor: '#6690F2',
        symbolType: 'circle',
        strokeColor: null,
        stroke: false
      },
      id: '180',
      index: 180
    }
  ],
  zIndex: 500,
  maxWidth: 565,
  maxHeight: 492,
  maxCol: 2,
  // width: 53.24798583984375,
  // height: 492,
  dx: 0,
  dy: 0,
  x: 100,
  y: 0
  // autoPage: false
});

const stage = render([legend], 'main');
console.log(legend);
legend.setSelected(['0', '1', '2', '3', '4']);
