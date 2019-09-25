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


import { Component, OnInit, NgZone, Input, ViewChild, ElementRef, OnDestroy, } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { StatsService } from '../stats.service'

// am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-horiz-bar-chart',
  templateUrl: './horiz-bar-chart.component.pug',
  styleUrls: ['./horiz-bar-chart.component.scss']
})
export class HorizBarChartComponent implements OnInit, OnDestroy {

  @ViewChild('horizBarChartDiv') HorizBarChartDiv: ElementRef;
  @Input() height: string;

  public chart: am4charts.XYChart;
  public testInstanceData;
  public loadingIndicator;
  protected stats: StatsService;

  constructor(private statsService: StatsService) {
    this.stats = statsService;
  }


  ngOnInit() {
    this.renderChart();

    this.stats.onDefaultDataCallStarted().subscribe(res => {
      this.showLoadingIndicator();
    })

    this.stats.onTIExecutionChangeStarted().subscribe(res => {
      this.showLoadingIndicator();
    })

    this.stats.onDefaultDataCallFinished().subscribe(res => {
      this.setChartData();
    })

    this.stats.onTIExecutionChangeFinished().subscribe(res => {
      this.setChartData()
    })

  }

  ngOnDestroy() {
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
    this.testInstanceData = this.stats.getData('testInstances');
    this.chart.data = this.testInstanceData;

    // Displays the average time for each bar. 
    // If there is no time recorded for the Test Instance, display No Time Recorded.
    let series = this.chart.series.values[0] as am4charts.ColumnSeries;
    
    
    series.columns.template.adapter.add("tooltipText", (text, target) => {
      if (target.dataItem) {
        if (this.chart.data[target.dataItem.index].Average > 0) {
          return this.chart.data[target.dataItem.index].Count.toString() + " Executions \n Avg Time: " + this.chart.data[target.dataItem.index].Average.toFixed(2).toString() + " seconds";
        } else
          return this.chart.data[target.dataItem.index].Count.toString() + " Executions \n No Time Recorded";
      }
    });
    series.columns.template.adapter.add("fill", (fill, target) => this.chart.colors.getIndex(target.dataItem.index));
    // console.log(this.chart.yAxes);
    this.chart.yAxes.values[0].zoomToIndexes(0, 6, false, true);
    this.hideLoadingIndicator();
    
  }

  renderChart() {
    this.chart = am4core.create(this.HorizBarChartDiv.nativeElement, am4charts.XYChart);
    this.chart.cursor = new am4charts.XYCursor();
    this.showLoadingIndicator();

    this.chart.responsive.enabled = true;

    // Create axes
    var categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "Name";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.minGridDistance = 5;
    categoryAxis.title.text = "Test Instances";
    categoryAxis.title.fontSize = "10px";

    var valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 10;

    // Create series
    var series = this.chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = "Count";
    series.dataFields.categoryY = "Name";
    series.columns.template.tooltipText = " ";

    let label = categoryAxis.renderer.labels.template;
    label.truncate = true;
    label.maxWidth = 130;
    label.fontSize = 13;

    //Scrollbar on the right. 
    let scrollBarY = new am4charts.XYChartScrollbar();
    scrollBarY.series.push(series);
    this.chart.scrollbarY = scrollBarY;
    this.chart.scrollbarY.contentHeight = 100;
    this.chart.scrollbarY.minWidth = 20;
    this.chart.scrollbarY.thumb.minWidth = 20;

    //set initial Scrollbar Zoom to the Top 6 Instances. 
  //   this.chart.events.on("ready", () => {
  //     console.log("here")
  //     categoryAxis.zoomToIndexes(0, 6, false, true);
  //   });
   }

}


