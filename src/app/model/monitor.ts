import { DateFormatService } from '../shared/date-format.service';
export const default_chart_options = {
  color: ['#3cb371', '#ff7f50', '#ffa500', '#da70d6'],
  title: {
    text: '',
    x: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 'bolder',
      color: '#00c1e0'
    }
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0,193,224,0.9)',
    textStyle: {
      color: '#fff',
    },
    borderColor: '#00c1e0',
    borderWidth: 1,
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#ccc',
        width: 1,
        type: 'solid'
      },
    },
    formatter: function (datas) {
      let res = DateFormatService.moment(datas[0].value[0], 'yyyy-MM-dd hh:mm:ss') + '<br/>', val;
      for (let i = 0, length = datas.length; i < length; i++) {
        if (datas[i].seriesName.indexOf('loss') > -1 || datas[i].seriesName.indexOf('percent') > -1) {
          val = datas[i].value[1] + '%';
        } else if (datas[i].seriesName.indexOf('rtt') > -1) {
          val = datas[i].value[1] + 'ms';
        }else if (datas[i].seriesName.indexOf('pkts') > -1) {
          val = datas[i].value[1] + '个';
        }else if (datas[i].seriesName.indexOf('rate') > -1 || datas[i].seriesName.indexOf('used') > -1 || datas[i].seriesName.indexOf('free') > -1) {
          val = sizeRoundToString(datas[i].value[1]);
        } else {
          val = datas[i].value[1];
        }
        res += datas[i].seriesName + '：' + val + '<br/>';
      }
      return res;
    }
  },
  legend: {
    data: [],
    y: 'bottom'
  },
  xAxis: [{
    type: 'time',
    boundaryGap: false,
    splitNumber: 3,
    offset: 0,
    axisLabel: {
      color: '#333',
      formatter: function (value) {
        return DateFormatService.moment(value, 'MM-dd hh:mm:ss');
      }
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    splitLine: {
      show: false
    }
  }],
  labelLine: {
    normal: {
      lineStyle: {
        color: '#ccc'
      }
    }
  },
  grid: {
    containLabel: true,
    left: 40,
    right: 40
  },
  series: []
};
export const loss_rtt_chart_options = Object.assign({}, default_chart_options, {
  yAxis: [{
    name: '丢包率(%)',
    type: 'value',
    min: 0,
    max: 100,
    axisLabel: {
      color: '#333',
      formatter: '{value}%'
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }, {
    name: '延时(ms)',
    type: 'value',
    min: 0,
    max: function (value) {
      return value.max !== 0 && isFinite(value.max) ? value.max : 5;
    },
    axisLabel: {
      color: '#333',
      formatter: '{value}ms'
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }]
});
export const rate_pkts_chart_options = Object.assign({}, default_chart_options, {
  yAxis: [{
    name: '流量',
    type: 'value',
    min: 0,
    max: 'dataMax',
    axisLabel: {
      color: '#333',
      formatter: function (value) {
        return sizeRoundToString(value);
      }
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }, {
    name: '数据包(个)',
    type: 'value',
    min: 0,
    max: 'dataMax',
    axisLabel: {
      color: '#333',
      formatter: '{value}个'
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }]
});
export const rate_chart_options = Object.assign({}, default_chart_options, {
  yAxis: [{
    name: '流量',
    type: 'value',
    min: 0,
    max: 'dataMax',
    axisLabel: {
      color: '#333',
      formatter: function (value) {
        return sizeRoundToString(value);
      }
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0]
      }
    ],
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }]
});
export const pkts_chart_options = Object.assign({}, default_chart_options, {
  yAxis: [{
    name: '数据包',
    type: 'value',
    min: 0,
    max: 'dataMax',
    axisLabel: {
      color: '#333',
      formatter: function (value) {
        return value + '个';
      }
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }]
});
export const cpu_chart_options = Object.assign({}, default_chart_options, {
  yAxis: [{
    name: 'CPU',
    type: 'value',
    min: 0,
    max: 'dataMax',
    axisLabel: {
      color: '#333',
      formatter: '{value}'
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }]
});
export const mem_chart_options = Object.assign({}, default_chart_options, {
  yAxis: [{
    name: 'Memory',
    type: 'value',
    min: 0,
    max: 'dataMax',
    axisLabel: {
      color: '#333',
      formatter: function (value) {
        return sizeRoundToString(value);
      }
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  }]
});
export const pie_chart_options = {
  xAxis: [],
  tooltip: {
    trigger: 'item',
    formatter: "{a} <br/>{b} : {c}台 ({d}%)",
    textStyle: {
      fontSize: 12,
    }
  },
  legend: {
    orient: 'vertical',
    bottom: 20,
    right: 60,
    data: [],
    textStyle: {
      fontSize: 12
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '10%',
    containLabel: true
  },
  series: []
};
export const bar_chart_options = Object.assign({}, default_chart_options, {
  color: ['#5cb85c', '#c23531'],
  xAxis: [],
  yAxis: [],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    textStyle: {
      fontSize: 12,
    }
  },
  legend: {
    orient: 'horizontal',
    bottom: 15,
    // left: 25,
    align: 'left',
    data: [],
    textStyle: {
      fontSize: 12
    }
  },
  grid: {
    containLabel: true,
    left: 30,
    right: 30,
    top: 10,
    bottom: 40
  },
});

export function sizeRoundToString(size, toFixed = 2) {
  const K = 1024;
  const sizeMap = {
    'P': K * K * K * K * K,
    'T': K * K * K * K,
    'G': K * K * K,
    'M': K * K,
    'K': K
  };
  let roundSize = '0B', flag = true;
  if (!size || size < K) {
    return size + 'B';
  } else {
    for (const obj in sizeMap) {
      if (size / sizeMap[obj] >= 1 && flag) {
        roundSize = (size / sizeMap[obj]).toFixed(toFixed) + obj;
        flag = false;
      }
    }
    return roundSize;
  }
}
export const DURATION_OPTIONS = [{
  during: 7 * 24 * 60 * 60 * 1000,
  interval: 60 * 1000,
  suffix: '_30m',
  dataTick: 2
}, {
  during: 24 * 60 * 60 * 1000,
  interval: 30 * 1000,
  suffix: '_5m',
  dataTick: 1
}, {
  during: 0,
  interval: 30 * 1000,
  suffix: '',
  dataTick: 1
}];
