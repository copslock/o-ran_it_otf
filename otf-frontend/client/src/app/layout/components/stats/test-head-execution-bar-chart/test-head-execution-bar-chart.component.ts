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
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { StatsService } from '../stats.service';
import { Router } from '@angular/router';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
@Component({
  selector: 'app-test-head-execution-bar-chart',
  templateUrl: './test-head-execution-bar-chart.component.pug',
  styleUrls: ['./test-head-execution-bar-chart.component.scss']
})
export class TestHeadExecutionBarChartComponent implements OnInit, OnDestroy {

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

  incrementStatus(data, code){
    
    if(code >= 200 && code < 300){
      data["200"]++;
    }else if(code >= 300 && code < 400){
      data["300"]++;
    }else if(code >= 400 && code < 500){
      data["400"]++;
    }else if(code >= 500 && code < 600){
      data["500"]++;
    }else{
      
      data["other"]++;
    }
  }

  setChartData() {

    let data = [];
    this.stats.executionList.forEach((execution, i) => {
      execution.testHeadResults.forEach((result, val) => {
        let index = data.findIndex(e => e.id === result.testHeadId);
        let executionTime = moment(result.endTime).diff(moment(result.startTime), 'seconds');
        if(index == -1){
          let toPush = {
            id: result.testHeadId,
            name: result.testHeadName,
            executionTime: executionTime,
            count: 1,
            average: executionTime,
            "200": 0,
            "300": 0,
            "400": 0,
            "500": 0,
            "other": 0
          }
          this.incrementStatus(toPush, result.statusCode);
          data.push(toPush);
        }else{
          this.incrementStatus(data[index], result.statusCode);
          data[index].count += 1;
          data[index].executionTime += executionTime;
          data[index].average = (data[index].executionTime / data[index].count);
        }
      });
    });
    data.sort((a, b) => b.count - a.count);
    this.chart.data = data;

    // Displays the average time for each bar. 
    // If there is no time recorded for the Test Instance, display No Time Recorded.
    let series = this.chart.series.values as Array<am4charts.ColumnSeries>;
    
    // series.columns.template.adapter.add("tooltipText", (text, target) => {
    //   if (target.dataItem) {
    //     if (this.chart.data[target.dataItem.index].average > 0) {
    //       return this.chart.data[target.dataItem.index].count.toString() + " Executions \n Avg Time: " + this.chart.data[target.dataItem.index].average.toFixed(2).toString() + " seconds";
    //     } else
    //       return this.chart.data[target.dataItem.index].count.toString() + " Executions \n No Time Recorded";
    //   }
    // });

    series.forEach(elem => {
      // elem.columns.template.adapter.add("fill", (fill, target) => this.chart.colors.getIndex(target.dataItem.index));
    
    
      elem.columns.template.events.on("doublehit", (click) => {
        this.router.navigate(['/test-heads', click.target.dataItem.dataContext['id']]);
      });
    })
    
    this.chart.appear();
    this.hideLoadingIndicator();
  }

  renderChart() {
    this.chart = am4core.create(this.chartElement.nativeElement, am4charts.XYChart);

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

    this.createSeries("200", "200s")
    this.createSeries("300", "300s")
    this.createSeries("400", "400s")
    this.createSeries("500", "500s")
    this.createSeries("other", "Other")

    this.chart.legend = new am4charts.Legend();
    this.chart.legend.scale = .7;
    this.chart.legend.width = am4core.percent(150);

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

  createSeries(field, name){
    // Create series
    var series = this.chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = field;
    series.dataFields.categoryY = "name";
    series.stacked = true;
    series.name = name;
  }

}
