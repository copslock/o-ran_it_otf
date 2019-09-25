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
import { StatsService } from '../stats.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

//am4core.useTheme(frozen);
//am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.pug',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit, OnDestroy {

  private toDestroy: Array<Subscription> = [];

  @ViewChild('pieChartDiv') PieChartDiv: ElementRef;
  @ViewChild('legendDiv') legendDiv: ElementRef;
  @Input() height: string;

  protected stats: StatsService;
  public chart: am4charts.PieChart;
  private chartData: Array<Object>;
  public loadingIndicator;

  constructor(private statsService: StatsService, private route: Router) {
    this.stats = statsService;
  }

  ngOnInit() {

    this.renderChart();

    this.toDestroy.push(this.stats.onDefaultDataCallStarted().subscribe(res => {
      this.showLoadingIndicator();
    }));

    this.toDestroy.push(this.stats.onTDExecutionChangeStarted().subscribe(res => {
      this.showLoadingIndicator();
    }));

    this.toDestroy.push(this.stats.onDefaultDataCallFinished().subscribe(res => {
      this.setChartData();
    }));

    this.toDestroy.push(this.stats.onTDExecutionChangeFinished().subscribe(res => {
      this.setChartData()
    }));
    

    // //Resize if screen size changes.
    // this.stats.checkWindow().subscribe(res=>{
    //   this.renderChart();
    // })

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

  setChartData(){
    this.chartData = this.stats.getData("TD_Results") as Array<Object>;
    if (this.chartData.length == 0) {
      this.chart.data = [{
        Name: "N/A",
        Count: 1,
      }]
      
      this.chart.series.values[0].tooltipText = "No Executions Found"
    } else {
      this.chart.data = this.chartData;
      //OnClick open page for that result. 
      this.chart.series.values[0].slices.template.events.on("doublehit", (clickedSlice) => {
        this.route.navigate(['/test-executions', { filter: clickedSlice.target.dataItem.dataContext['Name'].toString().toLowerCase() }]);
      });
    }
    this.hideLoadingIndicator();
    
  }

  renderChart() {

    this.chart = am4core.create(this.PieChartDiv.nativeElement, am4charts.PieChart);
    let series = this.chart.series.push(new am4charts.PieSeries());
    this.chart.scale = 1;
    this.chart.align = "center";
    this.showLoadingIndicator();

    // this.chart.legend = new am4charts.Legend();
    // this.chart.legend.position = "right";
    // this.chart.legend.scale = .7;
    // this.chart.legend.markers.template.width = 10;
    // this.chart.legend.markers.template.height = 10;
  
    //chart.preloader.disabled = false;
    //chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    
    // var legendContainer = am4core.create(this.legendDiv.nativeElement, am4core.Container);
    // legendContainer.width = am4core.percent(100);
    // legendContainer.height = am4core.percent(100);
    // this.chart.legend.parent = legendContainer;
    series.dataFields.value = "Count";
    series.dataFields.category = "Name";
    series.slices.template.strokeWidth = 1;
    series.slices.template.strokeOpacity = 1;
    series.slices.template.propertyFields.fill = "color"
    series.scale = .8;

    // This creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;
    series.ticks.template.disabled = false;
    series.labels.template.disabled = false;
    series.titleElement.textContent = 'Total Test Results'

    //responsive pie chart. if size of chart is less than 450 pixels remove legend. 
    this.chart.responsive.enabled = true;
    
    

  }
}
