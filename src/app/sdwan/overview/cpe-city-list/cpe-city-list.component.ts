import {Component, OnInit} from '@angular/core';
import {pie_chart_options} from '../../../model';
import {CeService} from '../../../shared/sdwan';

@Component({
  selector: 'app-cpe-city-list',
  templateUrl: './cpe-city-list.component.html',
  styleUrls: ['./cpe-city-list.component.styl']
})
export class CpeCityListComponent implements OnInit {


  dialogOptions = {
    title: 'CPE分布情况',
    width: '440px',
    visible: false,
  };
  pieChartOptions = pie_chart_options;
  legend = {
    type: 'plain',
    data: []
  };
  pieData = {
    name: '',
    type: 'pie',
    startAngle: 90,
    center: ['30%', '50%'],
    radius: null,
    selectedMode: null,
    data: [],
    label: {
      normal: {
        show: false,
        position: 'center'
      },
    },
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    hoverOffset: 6,
    selectedOffset: 6
  };
  cpeCityListsOptions: any;
  isLoading = {
    cpeCityLists: false
  };
  baseData = {
    cePositionDatas: null
  };

  constructor(private ceService: CeService) {
  }

  ngOnInit() {
  }

  open() {
    this.dialogOptions.visible = true;
    // cpe城市分布
    this.getCePositionNum();
  }

  getCePositionNum() {
    this.isLoading.cpeCityLists = true;
    const sub = this.ceService.getCePositionNum((data) => {
      sub.unsubscribe();
      const names = Object.keys(data);
      if (names.length > 0) {
        this.baseData.cePositionDatas = data;
        this.cePositionMonitor();
      }
      this.isLoading.cpeCityLists = false;
    });
  }

  //CPE分部情况
  cePositionMonitor() {
    let index = 1, cpeNum = 0, cityNames = [], graphic: any = [], cityNums = [];
    for (let key in this.baseData.cePositionDatas) {
      if (this.baseData.cePositionDatas.hasOwnProperty(key) && key) {
        cpeNum += this.baseData.cePositionDatas[key];
        cityNames.unshift({name: key});
        graphic.push({
          type: 'text',
          bottom: 25 * index,
          right: 25,
          style: {text: this.baseData.cePositionDatas[key] + '台'}
        });
        cityNums.push({name: key, value: this.baseData.cePositionDatas[key]});
        index++;
      }
    }

    const cePositionDatas = this.baseData.cePositionDatas;
    const legend: any = Object.assign({}, this.legend);
    legend.data = cityNames;
    legend.type = 'scroll';
    legend.orient = 'vertical';
    legend.right = 40;
    legend.bottom = 7;
    legend.formatter = function (data) {
      let name = '';
      for (let key in cePositionDatas) {
        if (key == data) {
          name = key + ' ' + cePositionDatas[key] + '台';
          break;
        }
      }
      return name;
    };

    const pieData: any = Object.assign({}, this.pieData);
    pieData.name = 'CPE分布情况';
    pieData.radius = ['40%', '70%'];
    pieData.selectedMode = 'single';
    pieData.data = cityNums;
    pieData.label.normal.show = false;

    let colors = [];
    colors = [
      '#817936',
      '#83c8d5',
      '#b7ba6d',
      '#f47920',
      '#fedcbd',
      '#deab8a',
      '#454926',
      '#faa755',
      '#b2d235',
      '#dc9bbb',
      '#8f4b2e',
      '#dbce8f',
      '#444693',
      '#f7acbc',
      '#918597',
      '#375830',
      '#77ac98',
      '#c77eb5',
      '#50b7c1',
      '#181d4b',
      '#d3d7d4',
      '#dea32c',
      '#ea66a6',
      '#769149',
      '#d4e7b7',
      '#9d9087',
      '#6f599c',
      '#ffd400',
      '#009ad6',
      '#de773f',
      '#a27220',
      '#87ac76',
      '#ece192',
      '#b4a8da'
    ];
    let tooltip: any = {};

    if (cpeNum === 0) {
      tooltip.show = false;
      legend.data = [{name: 'CPE'}];
      legend.formatter = function (data) {
        return data + ' ' + '0台';
      };
      graphic = [
        {type: 'text', bottom: 25, right: 25, style: {text: '0台'}}
      ];
      colors = ['#ddd'];

      pieData.hoverAnimation = false;
      pieData.legendHoverLink = false;
      pieData.hoverOffset = 0;
      pieData.selectedOffset = 0;
      pieData.data = [
        {name: 'CPE', value: 0}
      ];
    }

    this.cpeCityListsOptions = {
      tooltip: tooltip,
      color: colors,
      series: pieData,
      legend: legend,
      title: {
        text: cpeNum,
        textStyle: {
          fontSize: 30,
        },
        subtext: 'CPE(台)',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };
  }

}
