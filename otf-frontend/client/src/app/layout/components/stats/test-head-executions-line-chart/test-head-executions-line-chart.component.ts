/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
##############################################################################*/


import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { StatsService } from '../stats.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { _ } from 'ag-grid-community';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { GroupService } from 'app/shared/services/group.service';

@Component({
  selector: 'app-test-head-executions-line-chart',
  templateUrl: './test-head-executions-line-chart.component.pug',
  styleUrls: ['./test-head-executions-line-chart.component.scss']
})
export class TestHeadExecutionsLineChartComponent implements OnInit {

  private toDestroy: Array<Subscription> = [];

  @ViewChild('chart') chartElement: ElementRef;
  @Input() height: string;

  //public testDefinitionName = "Hello";
  private chart: am4charts.XYChart;
  private loadingIndicator;

  constructor(private stats: StatsService, private _groups: GroupService) {
  }

  ngOnInit() {
    this.renderChart();

    this.toDestroy.push(this.stats.onTDExecutionChangeStarted().subscribe(res => {
      this.showLoadingIndicator();
    }));

    this.toDestroy.push(this.stats.onDefaultDataCallStarted().subscribe(res => {
      this.showLoadingIndicator();
    }));

    this.toDestroy.push(this.stats.onDefaultDataCallFinished().subscribe(res => {
      this.setChartData();
    }));

    this.toDestroy.push(this.stats.onTDExecutionChangeFinished().subscribe(res => {
      this.setChartData();
    }));

  }

  ngOnDestroy() {
    //destory chart
    this.toDestroy.forEach(e => e.unsubscribe());
    this.chart.dispose();
  }

  //Sets count to 0 for any dates that dont have data
  setupPoints(rawData) {
    let formattedData = [];
    let dayRange = moment(this.stats.filters.endDate).add(1, 'days').diff(moment(this.stats.filters.startDate), 'days');
    for (let i = 0; i < dayRange; i++) {
      //find date in raw data
      let d = rawData.find(e => moment(e.date).isSame(moment(this.stats.filters.startDate).add(i, 'days'), 'day'));
      let myTestHeads = 0;
      let otherTestHeads = 0;
      if (d) {
        myTestHeads = d.myTestHeads || 0;
        otherTestHeads = d.otherTestHeads || 0;
      }
      formattedData.push({
        date: moment(this.stats.filters.startDate).startOf('day').add(i, 'days').toDate(),
        myTestHeads: myTestHeads,
        otherTestHeads: otherTestHeads
      })
    }

    return formattedData;
  }

  showLoadingIndicator() {

    //this.height = "380px";
    if (!this.loadingIndicator) {
      this.loadingIndicator = this.chart.tooltipContainer.createChild(am4core.Container);
      this.loadingIndicator.background.fill = am4core.color("#fff");
      this.loadingIndicator.background.fillOpacity = 0.8;
      this.loadingIndicator.width = am4core.percent(100);
      this.loadingIndicator.height = am4core.percent(100);

      let indicatorLabel = this.loadingIndicator.createChild(am4core.Label);
      indicatorLabel.text = "Loading..";
      indicatorLabel.align = "center";
      indicatorLabel.valign = "middle";
      indicatorLabel.fontSize = 18;
      indicatorLabel.fontWeight = "bold";
      indicatorLabel.dy = 50;

      let loadingImage = this.loadingIndicator.createChild(am4core.Image);
      //loadingImage.href = "https://img.devrant.com/devrant/rant/r_647810_4FeCH.gif";
      loadingImage.href = "/assets/images/equalizer.gif";
      //loadingImage.dataSource = "/loading-pies.svg"
      loadingImage.align = "center";
      loadingImage.valign = "middle";
      loadingImage.horizontalCenter = "middle";
      loadingImage.verticalCenter = "middle";
      loadingImage.scale = 3.0;
    } else {
      this.loadingIndicator.show();
    }
  }

  hideLoadingIndicator() {
    this.loadingIndicator.hide();
  }

  async setChartData() {
    let data = [];

    this.stats.executionList.forEach((e, i) => {
      if (e.testHeadResults && e.testHeadResults.length > 0) {

        e.testHeadResults.forEach((result, index) => {

          let isMyTestHead = result.testHeadGroupId == this._groups.getGroup()['_id'];



          let dataIndex = data.findIndex(d => moment(d.date).isSame(result.startTime, 'day'));

          if (dataIndex == -1) {
            dataIndex = data.push({ date: moment(result.startTime).toDate() }) - 1;
          }

          if (isMyTestHead) {
            if (data[dataIndex]['myTestHeads']) {
              data[dataIndex]['myTestHeads'] += 1;
            } else {
              data[dataIndex]['myTestHeads'] = 1;
            }
          }else{
            if (data[dataIndex]['otherTestHeads']) {
              data[dataIndex]['otherTestHeads'] += 1;
            } else {
              data[dataIndex]['otherTestHeads'] = 1;
            }
          }

        })
      }
    });

    

    this.chart.data = this.setupPoints(data);

    this.hideLoadingIndicator();
  }

  renderChart() {

    if (this.chart) {
      this.chart.dispose();
    }
    this.chart = am4core.create(this.chartElement.nativeElement, am4charts.XYChart);
    this.chart.preloader.disabled = true;
    this.showLoadingIndicator();

    let dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.fontSize = "10px";

    let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Executions";
    valueAxis.title.fontSize = "10px";

    let series = this.chart.series.push(new am4charts.LineSeries());
    series.name = "My Group's VTHs"
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "myTestHeads";
    series.strokeWidth = 3;

    series.fillOpacity = .5;  
    // series.tensionX = 0.8;
    series.sequencedInterpolation = false;
    series.tooltipText = "{valueY.value}";

    let seriesOthers = this.chart.series.push(new am4charts.LineSeries());
    seriesOthers.name = "Other VTHs";
    seriesOthers.dataFields.dateX = "date";
    seriesOthers.dataFields.valueY = "otherTestHeads";
    seriesOthers.strokeWidth = 3;
    seriesOthers.tooltipText = "{valueY.value}";

    this.chart.cursor = new am4charts.XYCursor();

    this.chart.responsive.enabled = true;

    this.chart.legend = new am4charts.Legend();
    this.chart.legend.labels.template.text = "[bold {color}]{name}";
    this.chart.legend.scale = .8;
  }



}
