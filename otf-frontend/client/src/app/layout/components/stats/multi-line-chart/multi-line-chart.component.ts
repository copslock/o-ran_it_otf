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


import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { StatsService } from '../stats.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as moment from 'moment';

//am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-multi-line-chart',
  templateUrl: './multi-line-chart.component.pug',
  styleUrls: ['./multi-line-chart.component.scss']
})
export class MultiLineChartComponent implements OnInit {

  @ViewChild('multilinechartdiv') MultiLineChartDiv: ElementRef;
  @Input() height: string;

  public chart: am4charts.XYChart;
  public loadingIndicator;
  public chartData;
  protected stats: StatsService;
  public dataIsEmpty = 0;
  constructor(private statsService: StatsService) {
    this.stats = statsService;
  }

  ngOnInit() {

    this.stats.onDefaultDataCallStarted().subscribe(res => {
      this.showLoadingIndicator();
    })

    this.stats.onTIExecutionChangeStarted().subscribe(res => {
      this.showLoadingIndicator();
    })

    this.stats.onDefaultDataCallFinished().subscribe(res => {
      this.renderChart();
      this.hideLoadingIndicator();
    })

    this.stats.onTIExecutionChangeFinished().subscribe(res => {
      this.renderChart();
      this.hideLoadingIndicator();
    })
    this.renderChart();

    //Resize if screen size changes.
    // this.stats.checkWindow().subscribe(res=>{
    //   this.renderChart();
    // })
  }


  // Rearrange the data to match the format needed for amcharts. Need to group by date. Each object has a date and a list of the lines and its count.
  reformatData() {
    var newData = [];

    //Names of the test instances. 
    var InstanceStrings = {};

    //Go through the instances and add the names to the InstanceStrings Array. 
    for (var numberInstances = 0; numberInstances < this.chartData.length; numberInstances++) {
      var instanceName = this.chartData[numberInstances].testInstanceName;
      InstanceStrings[instanceName] = 0;
    }

    // Iterate through the test instances. 
    for (var instanceLength = 0; instanceLength < this.chartData.length; instanceLength++) {

      //For each instance go through the dates. 
      for (var numDates = 0; numDates < this.chartData[instanceLength].dateData.length; numDates++) {

        //Check newData to see if date has been pushed. 
        var dateIndex = newData.findIndex((element) => {
          return (
            this.chartData[instanceLength].dateData[numDates].date.getFullYear() === element.date.getFullYear() &&
            this.chartData[instanceLength].dateData[numDates].date.getMonth() === element.date.getMonth() &&
            this.chartData[instanceLength].dateData[numDates].date.getDate() === element.date.getDate()
          )
        });

        //If date is not present push the new date and the count for the test instance. 
        if (newData[dateIndex] == undefined) {
          //date is not present
          var newDate = {
            date: new Date(this.chartData[instanceLength].dateData[numDates].date.getFullYear(),
              this.chartData[instanceLength].dateData[numDates].date.getMonth(),
              this.chartData[instanceLength].dateData[numDates].date.getDate())
          };
          newDate = Object.assign(newDate, InstanceStrings);
          newDate[this.chartData[instanceLength].testInstanceName] = this.chartData[instanceLength].dateData[numDates].count;
          newData.push(newDate);
        } else {

          //If the date is present update the count for that test instance. 
          newData[dateIndex][this.chartData[instanceLength].testInstanceName] += this.chartData[instanceLength].dateData[numDates].count;
        }
      }
    }
    return newData;
  }

  //fill in dates that have no data. If a specific date is not present, we need to fill in the date and set a count for 0. 
  async setupPoints(rawData): Promise<any> {
    let formattedData = [];

    //If the chart is supposed to be empty push in a line with a count of 0.
    if (rawData.length == 0) {
      return new Promise((resolve, reject) => {

        let days = this.daysDuration(this.stats.filters.startDate, this.stats.filters.endDate);

        if (!days) {
          days = 62;
          this.stats.filters.startDate = (moment().subtract(2, "months").toDate());
        }

        // Go through 62 days and push a count of 0/
        for (let day = 0; day < days; day++) {
          let newDate = this.addDaysToDate(this.stats.filters.startDate, day);
          formattedData.push({
            date: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
            count: 0,
            testInstancename: "empty"
          })
        }
        resolve(formattedData);
      })





      //Data is not empty. push in empty days for each instance. Some instances might not have executions for each day. 
    } else return new Promise((resolve, reject) => {
      //get list of test instances. 
      var InstanceStrings = {};
      for (var numberInstances = 0; numberInstances < this.chartData.length; numberInstances++) {
        var instanceName = this.chartData[numberInstances].testInstanceName;
        InstanceStrings[instanceName] = 0;
      }


      //Go through the data
      for (let i = 0; i < rawData.length; i++) {

        //for the first iteration, 
        if (i == 0) {
          formattedData.push(rawData[0]);

          // if the date is before the startDate specified by the filter or two months be default. 
          if (formattedData[0].date > this.stats.filters.startDate) {

            // Go through the difference in days and push the date and count of 0. 
            let days = this.daysDuration(this.stats.filters.startDate, formattedData[0].date)
            for (let k = days - 1; k >= 0; k--) {
              let newDate = this.addDaysToDate(this.stats.filters.startDate, k);
              var objectToAdd = {
                date: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
              };
              //push the new date and all the strings for the test instances.
              objectToAdd = Object.assign(objectToAdd, InstanceStrings);

              //add date to the beginning of the array. 
              formattedData.unshift(objectToAdd)

            }
          }

          //for all other iterations
        } else {

          //get the difference in days.
          let days = this.daysDuration(rawData[i].date, rawData[i - 1].date);
          if (days > 1) {
            //push the new dates. 
            for (let j = 1; j < days; j++) {
              let newDate = this.addDaysToDate(rawData[i - 1].date, j);
              var objectToAdd = {
                date: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
              };
              //push the new date and all the strings for the test instances.
              objectToAdd = Object.assign(objectToAdd, InstanceStrings);
              formattedData.push(objectToAdd);
            }
          }
          formattedData.push(rawData[i]);
        }
      }

      if (rawData.length >= 1) {
        var days = this.daysDuration(rawData[rawData.length - 1].date, this.stats.filters.endDate);
        if (days >= 1) {
          for (let j = 1; j < days; j++) {
            let newDate = this.addDaysToDate(rawData[rawData.length - 1].date, j);
            var objectToAdd = {
              date: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
            };
            objectToAdd = Object.assign(objectToAdd, InstanceStrings);
            formattedData.push(objectToAdd);
          }
        }
      }


      resolve(formattedData);
    })
  }

  daysDuration(date1, date2) {
    return Math.ceil(Math.abs((date1 - date2) / (60 * 60 * 24 * 1000)));
  }

  addDaysToDate(date, days) {
    let newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  }

  //initialize loading indicator
  showLoadingIndicator() {

    this.height = "380px";
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
    loadingImage.href = "https://loading.io/spinners/equalizer/lg.equalizer-bars-loader.gif";
    //loadingImage.dataSource = "/loading-pies.svg"
    loadingImage.align = "center";
    loadingImage.valign = "middle";
    loadingImage.horizontalCenter = "middle";
    loadingImage.verticalCenter = "middle";
    loadingImage.scale = 3.0;

  }

  hideLoadingIndicator() {
    this.loadingIndicator.hide();
  }

  async renderChart() {
    //console.log("here")

    am4core.options.minPolylineStep = 5;

    this.chart = am4core.create(this.MultiLineChartDiv.nativeElement, am4charts.XYChart);
    this.chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    this.chart.paddingRight = 20;
    this.chartData = this.stats.getData("multiLineData");

    //reformat the data to match the format needed for amcharts. 
    var formattedData = this.reformatData();

    //sort the data.
    formattedData.sort((a, b) => a.date - b.date);

    //fill in gaps in the data
    await this.setupPoints(formattedData).then(res => {
      formattedData = res;
    }, err => console.log(err));

    this.chart.data = formattedData;

    let dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.title.text = "Date";

    let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Executions";

    this.chart.cursor = new am4charts.XYCursor();
    this.chart.cursor.xAxis = dateAxis;

    //if the data is empty, push in a line and set the count to 0. 
    if (this.chartData.length == 0) {
      this.chartData.push({ testInstanceName: "empty" })
      let newSeries = this.chart.series.push(new am4charts.LineSeries());
      newSeries.name = "empty";
      newSeries.dataFields.dateX = "date";
      newSeries.dataFields.valueY = "count";
      newSeries.tooltipText = "{valueY.value}";
      newSeries.sequencedInterpolation = true;
      newSeries.defaultState.transitionDuration = 1000;
      newSeries.strokeWidth = 3;
      newSeries.tensionX = 0.8;
    } else {

      //initialize the lines for the series
      for (let index = 0; index < this.chartData.length; index++) {
        let newSeries = this.chart.series.push(new am4charts.LineSeries());
        newSeries.name = this.chartData[index].testInstanceName;
        newSeries.dataFields.dateX = "date";
        newSeries.dataFields.valueY = (this.chartData[index].testInstanceName).toString();
        newSeries.tooltipText = "{valueY.value}";
        newSeries.sequencedInterpolation = true;
        newSeries.defaultState.transitionDuration = 1000;
        newSeries.strokeWidth = 3;
        newSeries.tensionX = 0.8;
      }
      this.chart.legend = new am4charts.Legend();
      this.chart.legend.labels.template.text = "[bold {color}]{name}";
    }
  }

}