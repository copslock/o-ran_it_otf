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


import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { StatsService } from '../stats.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { e } from '@angular/core/src/render3';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test-definition-executions-bar-chart',
  templateUrl: './test-definition-executions-bar-chart.component.pug',
  styleUrls: ['./test-definition-executions-bar-chart.component.scss']
})
export class TestDefinitionExecutionsBarChartComponent implements OnInit, OnDestroy {

  private toDestroy: Array<Subscription> = [];

  @ViewChild('chart') chartElement: ElementRef;
  @Input() height: string;

  public chart: am4charts.XYChart;
  public testInstanceData;
  public loadingIndicator;

  constructor(private stats: StatsService, private router: Router) {}


  ngOnInit() {
    this.renderChart();

    this.toDestroy.push(this.stats.onDefaultDataCallStarted().subscribe(res => {
      this.showLoadingIndicator();
    }));

    this.toDestroy.push(this.stats.onTIExecutionChangeStarted().subscribe(res => {
      this.showLoadingIndicator();
    }));

    this.toDestroy.push(this.stats.onDefaultDataCallFinished().subscribe(res => {
      this.setChartData();
    }));

    this.toDestroy.push(this.stats.onTIExecutionChangeFinished().subscribe(res => {
      this.setChartData()
    }));

  }

  ngOnDestroy() {
    this.toDestroy.forEach(e => e.unsubscribe());
    this.chart.dispose();
  }

  showLoadingIndicator() {
    if(!this.loadingIndicator){
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
      indicatorLabel.fontWeight= "bold";
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
    }else{
      this.loadingIndicator.show();
    }

  }

  hideLoadingIndicator() {
    this.loadingIndicator.hide();
  }

  setChartData() {

    let data = [];
    this.stats.executionList.forEach((execution, i) => {
      let index = data.findIndex(e => e.id === execution.historicTestDefinition._id);
      let executionTime = moment(execution.endTime).diff(moment(execution.startTime), 'seconds');
      if(index == -1){
        data.push({
          id: execution.historicTestDefinition._id,
          name: execution.historicTestDefinition.testName,
          testResult: execution.testResult,
          executionTime: executionTime,
          count: 1,
          average: executionTime
        })
      }else{
        data[index].count += 1;
        data[index].executionTime += executionTime;
        data[index].average = (data[index].executionTime / data[index].count);
      }
    });
    data.sort((a, b) => b.count - a.count);
    this.chart.data = data;
    

    // Displays the average time for each bar. 
    // If there is no time recorded for the Test Instance, display No Time Recorded.
    let series = this.chart.series.values[0] as am4charts.ColumnSeries;
    
    series.columns.template.adapter.add("tooltipText", (text, target) => {
      if (target.dataItem) {
        if (this.chart.data[target.dataItem.index].average > 0) {
          return this.chart.data[target.dataItem.index].count.toString() + " Executions \n Avg Time: " + this.chart.data[target.dataItem.index].average.toFixed(2).toString() + " seconds";
        } else
          return this.chart.data[target.dataItem.index].count.toString() + " Executions \n No Time Recorded";
      }
    });
    series.columns.template.adapter.add("fill", (fill, target) => this.chart.colors.getIndex(target.dataItem.index));
    
    
    series.columns.template.events.on("doublehit", (click) => {
      this.router.navigate(['/test-definitions', click.target.dataItem.dataContext['id']]);
    });
    this.chart.appear();
    this.hideLoadingIndicator();
    
  }

  renderChart() {
    this.chart = am4core.create(this.chartElement.nativeElement, am4charts.XYChart);
    this.chart.cursor = new am4charts.XYCursor();
    this.showLoadingIndicator();

    this.chart.responsive.enabled = true;

    // Create axes
    var categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.minGridDistance = 5;
    categoryAxis.title.fontSize = "10px";

    var valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 10;

    // Create series
    var series = this.chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = "count";
    series.dataFields.categoryY = "name";
    series.columns.template.tooltipText = " ";

    let label = categoryAxis.renderer.labels.template;
    label.truncate = true;
    label.maxWidth = 130;
    label.fontSize = 13;

    //Scrollbar on the right. 
    let scrollBarY = new am4charts.XYChartScrollbar();
    //scrollBarY.series.push(series);
    this.chart.scrollbarY = scrollBarY;
    this.chart.scrollbarY.contentHeight = 100;
    this.chart.scrollbarY.minWidth = 20;
    this.chart.scrollbarY.thumb.minWidth = 20;

    //set initial Scrollbar Zoom to the Top 6 Instances. 
    this.chart.events.on("appeared", () => {
      
      categoryAxis.zoomToIndexes(0, 6, false, true);
    });
   }

}
