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


import { Injectable } from '@angular/core';
import { FeathersService } from 'app/shared/services/feathers.service';
import { TestExecutionService } from 'app/shared/services/test-execution.service';
import { Observable, Subject, from } from 'rxjs';
import { MatDialog } from '@angular/material';
import { GroupService } from 'app/shared/services/group.service';
import * as moment from 'moment';
import { SchedulingService } from 'app/shared/services/scheduling.service';
import { TestInstanceService } from 'app/shared/services/test-instance.service';
import { string, number } from '@amcharts/amcharts4/core';
import { group } from '@angular/animations';
export interface StatsFilter {
  startDate?: Date,
  endDate?: Date,
  selectedTestDefinitions?: Array<any>,
  selectedTestInstances?: Array<any>
}

@Injectable({
  providedIn: 'root'
})

//this service serves as the controller between the dashboard's data management and the components' UI.
export class StatsService {

  //set default filters
  public filters: StatsFilter = {
    startDate: moment().subtract(1, 'weeks').toDate(),
    endDate: moment().toDate()
  }

  public executionList: Array<any> = [];

  public testDefinitionData = {
    //Executions Array thats made of objects with date, test definition name, and count
    "Executions": [],
    //Array of Results for the Pie Chart
    "Results": [],
  }
  public testInstanceData = {
    //Executions for Each Test Instance
    "Executions": [],
    //For multilinechart, objects made of test instance names, and execution count for each one.
    "Individual_Exec": []
  };

  //list if test instance names
  public testInstances = [];
  //list of scheduled tests gotten from agenda in db.
  public scheduledTests = [];

  //these are filter objects attached to stats service that are updated whenever user confirms from filter modal. 
  //They are updated in the filter functions below.
  // public tdFilters = {
  //   startDate: {},
  //   endDate: {},
  //   selected: [],
  // }
  // public tiFilters = {
  //   startDate: {},
  //   endDate: {},
  //   selectedTDs: [],
  //   selectedTIs: [],
  //   //this limit is for the amount of multiple series being displayed on the multiline chart according to default/filters.
  //   multiLineLimit: 5,
  // }
  // public scheduleFilters = {
  //   startDate: {},
  //   endDate: {},
  //   timeRangeStart: {},
  //   timeRangeEnd: {},
  //   selectedInstances: [],
  // }

  //these are for triggering the listeners located in the chart components.
  //executionsChange subjects are triggered when user filters.
  public tdExecutionsChange: Subject<Object> = new Subject<Object>();
  public tiExecutionsChange: Subject<Object> = new Subject<Object>();
  public scheduleChange: Subject<Object> = new Subject<Object>();
  public finishedDefaultData: Subject<Object> = new Subject<Object>();
  public startDefaultData: Subject<Object> = new Subject<Object>();
  public startTDExecutionCall: Subject<Object> = new Subject<Object>();
  public startTIExecutionCall: Subject<Object> = new Subject<Object>();
  public windowResized: Subject<Object> = new Subject<Object>();
  public startScheduleCall: Subject<Object> = new Subject<Object>();

  constructor(public feathers: FeathersService, public testExecution: TestExecutionService,
    public _groups: GroupService, public testInstanceService: TestInstanceService, public schedService: SchedulingService) {

    //listening for whether user changes group, if so, variables are reset (rest are inside defaultData, we can work on consistency).
    //and we get default data for the new group passed in.
    // this.getDefaultData(this._groups.getGroup());
    // this._groups.groupChange().subscribe(group => {
    //   this.getDefaultData(group);
    // });

  }

  

  //these are trigger functions that we call in the data manipulating functions below.
  //the purpose of these functions is to let the listeners set up in the chart components know that the data has been updated.
  //then the chart components recall the data using getData().
  checkWindow() {
    return this.windowResized;
  }

  onDefaultDataCallStarted() {
    return this.startDefaultData;
  }

  onTDExecutionChangeStarted() {
    return this.startTDExecutionCall;
  }

  onTIExecutionChangeStarted() {
    return this.startTIExecutionCall;
  }

  onScheduleChangeStarted() {
    return this.startScheduleCall;
  }

  onDefaultDataCallFinished() {
    return this.finishedDefaultData;
  }

  onTDExecutionChangeFinished() {
    return this.tdExecutionsChange;
  }

  onTIExecutionChangeFinished() {
    return this.tiExecutionsChange;
  }

  onScheduleChangeFinished() {
    return this.scheduleChange;
  }

  //one giant getter where we pass in the name of what we want and switch case it.

  //This function is called in the components and returns the relavent array for the component.
  getData(name: string) {
    let outputData = {};

    switch (name) {
      case "TD_Executions":
        return this.testDefinitionData.Executions;
      case "TD_Results":
        return this.testDefinitionData.Results;
      case "testInstances":
        return this.testInstanceData.Executions;
      case "Schedule":
        return this.scheduledTests;
      // case "multiLineData":
      //   //limitting the series being displayed.
      //   return this.testInstanceData.Individual_Exec.slice(0, this.tiFilters.multiLineLimit);
    }
    //console.log(outputData);
    return outputData;
  }

  //this gets called from the filter modal when the user confirms their filters.
  filterData(allFilters, tdFilters, tiFilters, schedFilters) {
    //this.filterAll(allFilters);
    this.filterTDs(tdFilters);
    this.filterTIs(tiFilters);
    this.filterSchedule(schedFilters)
  }

  //this is still under the works, the purpose of this is to filter ALL the components of the dashboard if they have common filtering grounds.
  filterAll(allFilters) {
    //console.log('Filtering everything')
    //console.log(allFilters);
    if (allFilters.startDate != "" || allFilters.endDate != "") {
      if (allFilters.endDate == "") {
        this.testDefinitionData.Executions = this.testDefinitionData.Executions.filter(execution => (
          execution.startTime >= allFilters.startDate
        ))
      } else if (allFilters.startDate == "") {
        this.testDefinitionData.Executions = this.testDefinitionData.Executions.filter(execution => (
          execution.startTime <= allFilters.endDate
        ))
      } else {
        this.testDefinitionData.Executions = this.testDefinitionData.Executions.filter(execution => (
          execution.startTime >= allFilters.startDate &&
          execution.date <= allFilters.endDate
        ))
      }
    }
  }

  /*
    this function takes in test definition filters and queries data accordingly.
    improvement needed: if the filters provided do not require querying at all, the function should narrow the currently existing data. This
    will be faster than requerying in those cases and improve loading times.
  */
  async filterTDs(tdFilters) {

    /*
      checking if the filters passed in are empty, if so do nothing, if not, trigger a start call that lets the components know querying is going to begin.
      these start..Call() functions are so chart components can turn on their loading indicators.
    */
    // if (tdFilters.startDate == "" && tdFilters.endDate == "" && tdFilters.selected.length == 0) return;
    // else this.startTDExecutionCall.next(tdFilters);

    // //updating filter objects attached to stats service so we can use the service getters to get them where we want in the charts component code.
    // this.tdFilters = tdFilters;

    // //if no range is passed in we use the default range of past 2 months.
    // let startDate = tdFilters.startDate == "" ? new Date(moment().subtract(2, 'weeks').format('L')) : new Date(tdFilters.startDate);
    // let endDate = tdFilters.endDate == "" ? moment().toDate() : new Date(tdFilters.endDate);
    // //update service filters accordingly. 
    // this.tdFilters.startDate = startDate;
    // this.tdFilters.endDate = endDate;
    //variable of id's of the test definitions selected in the filters.
    let selectedIDs = this.filters.selectedTestDefinitions.map(item => item.id);

    //Promise that queries the data according the filters. We use a promise so we wait for the data to query before the components render.
    await new Promise((resolve, reject) => {

      //feathers query time.
      this.testExecution.find({
        //get the data relevant to the group.
        groupId: this._groups.getGroup()["_id"],
        //thse are gonna go in the data objects.
        $select: [
          'historicTestDefinition.testName',
          'startTime',
          'testResult'
        ],
        //UNLIMITED DATA BABY.
        $limit: -1,
        //sort according to ascending dates.
        $sort: {
          startTime: 1,
        },
        //select the start and end dates from the filter dates.
        startTime: {
          $gte: this.filters.startDate,
          $lte: this.filters.endDate,
        },
        //select the test definitions according to the selected ones in the filters.
        'historicTestDefinition._id': {
          $in: selectedIDs
        }
      }).subscribe(result => {

        //console.log(result)

        //resetting real quick cuz why not.
        this.testDefinitionData = {
          "Executions": [],
          "Results": [],
        }

        //pretty self explanitory.
        let fetchedData = result as Array<any>;
        let currentExecutionsData = this.testDefinitionData.Executions;

        /*
          for each new fetched json we got with the selected stuff we specified in the feathers query,
          we need to organize and distribute them accordingly to our service's data objects. For example, the json objects consist of
          'historicTestDefinition.testName',
          'startTime',
          'testResult',
          test results belong in the results array, the rest needs to be organzied in the executions array,
          thats what the populate methods are for.
        */
        for (let index in fetchedData) {
          let newItem = fetchedData[index];

          //for consistency we're supposed to pass current data to both we'll fix that later, but for now the piechart one just calls the current results data
          //inside itself.
          this.populateLineChartData(newItem, currentExecutionsData);
          this.populatePieChartData(newItem);
        }
        resolve();
      })
    }).then(res => {
      //console.log(res);

      //trigger that querying is done and the test definition executions data has been changed. Line chart and pie chart listen for this.
      this.tdExecutionsChange.next(res);
    })
  }

  //similar stuffies. just small differences.
  async filterTIs(tiFilters) {

    // if (tiFilters.startDate == "" && tiFilters.endDate == "" && tiFilters.selectedTDs.length == 0 && tiFilters.selectedTIs.length == 0) return;
    // else this.startTIExecutionCall.next(tiFilters);

    // this.tiFilters = tiFilters;
    // if (tiFilters.selectedTIs.length > 0 && tiFilters.selectedTDs.length > 0) this.tiFilters.multiLineLimit = tiFilters.selectedTIs.length + tiFilters.selectedTDs.length;
    // else if (tiFilters.selectedTIs.length > 0) this.tiFilters.multiLineLimit = tiFilters.selectedTIs.length;
    // else if (tiFilters.selectedTDs.length > 0) this.tiFilters.multiLineLimit = tiFilters.selectedTDs.length;
    // else this.tiFilters.multiLineLimit = 5;

    // let startDate = tiFilters.startDate == "" ? new Date(moment().subtract(2, 'weeks').format('L')) : new Date(tiFilters.startDate);
    // let endDate = tiFilters.endDate == "" ? moment().toDate() : new Date(tiFilters.endDate);

    // this.tiFilters.startDate = startDate;
    // this.tiFilters.endDate = endDate;
    // console.log(tiFilters.selectedTDs)

    await new Promise((resolve, reject) => {
      this.testExecution.find({
        groupId: this._groups.getGroup()["_id"],
        $limit: -1,
        startTime: {
          $gte: this.filters.startDate,
          $lte: this.filters.endDate,
        },
        $select: [
          'startTime',
          'endTime',
          'historicTestDefinition.testName',
          'historicTestInstance.testInstanceName',
        ],
        $or: [
          {
            'historicTestDefinition._id': {
              $in: tiFilters.selectedTDs
            }
          },
          {
            'historicTestInstance._id': {
              $in: tiFilters.selectedTIs
            }
          }
        ]

      }).subscribe(result => {
        this.testInstanceData = {
          "Executions": [],
          "Individual_Exec": []
        }
        //console.log(result)
        let fetchedData = result as Array<any>;
        for (let index in fetchedData) {
          let newItem = fetchedData[index];
          this.populateBarChartData(newItem);
          this.populateMultiLineChartData(newItem);
        }
        this.testInstanceData.Executions.sort((a, b) => b.Count - a.Count);
        this.testInstanceData.Individual_Exec.sort((a, b) => b.total - a.total);

        resolve();
      })
    }).then(res => {
      this.tiExecutionsChange.next(res);
      //console.log(this.testInstanceData.Executions);
    })

  }

  //similar stuffies just smol differneces.
  async filterSchedule(schedFilters) {

    //console.log(schedFilters);
    // this.scheduleFilters = schedFilters;
    // //console.log(schedFilters.selectedInstances);

    // if (schedFilters.startDate == "" &&
    //   schedFilters.endDate == "" &&
    //   schedFilters.selectedInstances.length == 0) {
    //   return;
    // } else this.startScheduleCall.next(schedFilters);

    // let startDate = schedFilters.startDate == "" ? new Date(moment().toDate()) : new Date(schedFilters.startDate);
    // let endDate = schedFilters.endDate == "" ? new Date(moment().add(2, 'weeks').format('L')) : new Date(schedFilters.endDate);

    // this.scheduleFilters.startDate = startDate;
    // this.scheduleFilters.endDate = endDate;

    
    this.schedService.find({
      $select: ["data.testSchedule._testInstanceId", 'nextRunAt'],
      $limit: -1,
    }).subscribe(result => {
      this.scheduledTests = [];
      //console.log(result);
      let fetchedData = result as Array<any>;
      let resultingData: Array<any> = fetchedData;
      if (schedFilters.selectedInstances.length !== 0) {
        resultingData = fetchedData.filter(el => {
          let fetchedID = el.data.testSchedule._testInstanceId;
          let selectedIDs = schedFilters.selectedInstances as Array<any>;
          let condition = selectedIDs.includes(fetchedID.toString());
          //console.log(condition);
          return condition;
        })
      }

      resultingData = resultingData.filter(el => {
        let schedDate = new Date(el.nextRunAt);
        return schedDate >= this.filters.startDate && schedDate <= this.filters.endDate;
      })

      for (let index in resultingData) {
        let checkIfTestBelongsToUserGroup = this.testInstances.findIndex(testInstances => testInstances.id === resultingData[index].data.testSchedule._testInstanceId);
        if (checkIfTestBelongsToUserGroup >= 0) {
          if (resultingData[index].nextRunAt) {
            let d1 = new Date(resultingData[index].nextRunAt);
            this.scheduledTests.push({
              id: resultingData[index].data.testSchedule._testInstanceId,
              name: this.testInstances[checkIfTestBelongsToUserGroup].name,
              dateExec: d1.toDateString(),
              timeExec: d1.toLocaleTimeString()
            })
          }
        }
      }
      this.scheduleChange.next();
    });
    


  }

  //getters for the filter objects.
  // getTDFilters() {
  //   return this.tdFilters;
  // }

  // getTIFilters() {
  //   return this.tiFilters;
  // }

  // getSchedFilters() {
  //   return this.scheduleFilters;
  // }

  calcTime(execution) {
    var end = new Date(execution.endTime);
    var start = new Date(execution.startTime);
    var executionTime = (end.getTime() - start.getTime()) / 1000;
    return executionTime;
  }

  //This function takes an execution that was retrieved from the Database and takes the data it needs for the line chart. 
  populateLineChartData(execution, currentData) {
    let executionDate = new Date(execution.startTime)

    // Looks to see if the date already has an execution./
    let indexOfItemFound = currentData.findIndex((element) => {

      return (
        executionDate.getFullYear() === element.date.getFullYear() &&
        executionDate.getMonth() === element.date.getMonth() &&
        executionDate.getDate() === element.date.getDate()
      )
    })

    //If the date is not found. Push a new date into the array with a count of one
    if (currentData[indexOfItemFound] == undefined) {
      currentData.push({
        date: new Date(executionDate.getFullYear(), executionDate.getMonth(), executionDate.getDate()),
        count: 1
      })
    // else update the count
    } else currentData[indexOfItemFound].count += 1;
  }


  //Takes an execution and  pushes the result/count or updates the count. For the Pie Chart
  populatePieChartData(execution) {

    //Check if result is already present in the array. 
    var checkIfPresent = this.testDefinitionData.Results.find(Results => Results.Name === execution.testResult);
   
    //If not present, add it to TOPSTATs with a default count of 1.    
    if (!checkIfPresent) {
      
      var color;
      //Set the color for the pie chart.
      if (execution.testResult == "COMPLETED"){
        color = "#0D47A1";
      }else if (execution.testResult == "FAILED")
        color = "#DD2C00";
      else if (execution.testResult == "UNKNOWN")
        color = "#C4CBD4";
      else if (execution.testResult == "SUCCESS")
        color = "#42d660";
      else if (execution.testResult == "success")
        color = "#42d660";
      else if (execution.testResult == "STARTED")
        color = "#29E3E8";
      else if (execution.testResult == "FAILURE")
        color = "#FC9100";
      else if (execution.testResult == "STOPPED")
        color = "#900C3F";
      else if (execution.testResult == "TERMINATED")
        color = "#AC00FC";
      else if (execution.testResult == "UNAUTHORIZED")
        color = "#7A6E6E";
      else if (execution.testResult == "DOES_NOT_EXIST")
        color = "#000000";
      else if (execution.testResult == "ERROR")
        color = "#eb2acd"
      else if (execution.testResult == "WORKFLOW_ERROR")
        color = "#194f24"
      else
        color = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });

      //Push the execution with the count and color.
      this.testDefinitionData.Results.push({ Name: execution.testResult, Count: 1, color: color });
    } else {

      //Find index of the testResult and update the count by 1.
      var position = this.testDefinitionData.Results.findIndex(Results => Results.Name === execution.testResult);
      this.testDefinitionData.Results[position].Count += 1;
    }
  }

  //Takes an execution and pushes result into the barchart. 
  populateBarChartData(execution) {

    //check if test instance is present in the array. 
    var checkIfPresent = this.testInstanceData.Executions.find(Instances => Instances.id === execution.historicTestInstance._id);

    //calculates the time it took for the execution/
    var executionTime = this.calcTime(execution);
    
    //If execution is not present, push the test instance with a count of 1.
    if (!checkIfPresent) {
      //If not present, add it to testInstanceData with a default count of 1. 

      this.testInstanceData.Executions.push({
        Name: execution.historicTestInstance.testInstanceName,
        id: execution.historicTestInstance._id,
        testResult: execution.testResult,
        executionTime: executionTime,
        Count: 1,
        Average: executionTime
      });
    } else {
      // If Present update count and execution time. 
      var position = this.testInstanceData.Executions.findIndex(Instances => Instances.id === execution.historicTestInstance._id);
      this.testInstanceData.Executions[position].Count += 1;
      this.testInstanceData.Executions[position].executionTime += executionTime;
      this.testInstanceData.Executions[position].Average = this.testInstanceData.Executions[position].executionTime / this.testInstanceData.Executions[position].Count;
    }

  }

  //queries data for the scheduled tests. 
  getScheduledTests(groupId) {

    //Queries a list of test instances by group ID
    this.testInstanceService.find({
      groupId: groupId['_id'],
      $select: ["_id", "testInstanceName", "groupId"],
      $limit: -1
    }).subscribe(result => {

      //Iterate through the list and add the test instances to the list. 
      for (var index in result) {
        var checkIfPresent = this.testInstances.find(id => id === result[index]._id);
        if (!checkIfPresent)
          this.testInstances.push({ id: result[index]._id, name: result[index].testInstanceName });
      }
    });

    //Queries all of the scheduled tests. 
    this.schedService.find({

      $select: ["data.testSchedule._testInstanceId", 'nextRunAt'],
      $limit: -1,
      $sort: {
        startTime: 1
      },

    }).subscribe(result => {

      this.scheduledTests = [];
      for (var index in result) {

        //If the scheduled testinstance is owned by the group, push the result. 
        var checkIfTestBelongsToUserGroup = this.testInstances.findIndex(testInstances => testInstances.id === result[index].data.testSchedule._testInstanceId);
        if (checkIfTestBelongsToUserGroup >= 0) {

          //If the next run at is valid, the test is scheduled.
          if (result[index].nextRunAt) {
            let d1 = new Date(result[index].nextRunAt);
            this.scheduledTests.push({
              id: result[index].data.testSchedule._testInstanceId,
              name: this.testInstances[checkIfTestBelongsToUserGroup].name,
              dateExec: d1.toDateString(),
              timeExec: d1.toLocaleTimeString()
            });
          }
        }
      }
    });
  }

  //populate multi line chart
  populateMultiLineChartData(execution) {

    let executionDate = new Date(execution.startTime)
    let currentData = this.testInstanceData.Individual_Exec;
    let count = 1;
    //find if Instance is already present in the array. 
    let position = this.testInstanceData.Individual_Exec.findIndex(Instances => Instances.id === execution.historicTestInstance._id);

    //First execution for this instance
    if (currentData[position] == undefined) {
      currentData.push({
        testInstanceName: execution.historicTestInstance.testInstanceName,
        testDefinitionName: execution.historicTestDefinition.testDefintionName,
        id: execution.historicTestInstance._id,
        dateData: [{ date: executionDate, count: count, name: execution.historicTestInstance.testInstanceName }],
        total: 1
      })
      //execution already present
    } else {
      //find index of Date
      let indexOfDate = currentData[position].dateData.findIndex((element) => {
        return (
          executionDate.getFullYear() === element.date.getFullYear() &&
          executionDate.getMonth() === element.date.getMonth() &&
          executionDate.getDate() === element.date.getDate()
        )
      });

      //Check if the exeuction date is valid for this instance. If it is not present, push a new date and count. 
      if (currentData[position].dateData[indexOfDate] == undefined) {
        let count = 1;
        //Push the new Date
        currentData[position].dateData.push({ date: executionDate, count: count, name: execution.historicTestInstance.testInstanceName, id: execution.historicTestInstance._id});
        currentData[position].total++;
      } else {
        //date is already present
        currentData[position].dateData[indexOfDate].count++;
        currentData[position].total++;
      }
    }
  }
  //Gets the initial data for the default page. 
  async getDefaultData(group, query?) { 
    if(!group){
      return;
    }
    
    this.scheduledTests = [];

    this.startDefaultData.next(group);
    let groupId = group;
    //let startDate = moment().subtract(2, 'weeks').toDate();
    
    //query sheduled tests
    //this.getScheduledTests(group);

    if(!query){
      query = {
        groupId: groupId['_id'],
        $select: [
          'startTime',
          'endTime',
          "historicTestDefinition._id",
          "historicTestDefinition.testName",
          "historicTestInstance._id",
          "historicTestInstance.testInstanceName",
          "testHeadResults.startTime",
          "testHeadResults.endTime",
          "testHeadResults.testHeadName",
          "testHeadResults.testHeadId",
          "testHeadResults.testHeadGroupId",
          "testHeadResults.statusCode",
          'testResult'
        ],
        $limit: -1,
        $sort: {
          startTime: 1
        },
        startTime: {
          $gte: this.filters.startDate,
          $lte: this.filters.endDate
        }
      }
    }

    //Query test Executions
    await new Promise((resolve, reject) => {
      this.testExecution.find(query).subscribe(result => {

        //reset arrays
        this.testDefinitionData = {
          //Executions Array thats made of objects with date, tdName, result
          "Executions": [],
          "Results": [],
        }
        this.testInstanceData = {
          "Executions": [],
          "Individual_Exec": []
        };

        this.executionList = result as Array<any>;
        let currentData = this.testDefinitionData.Executions;

        

        //iterate through the results and populate the appropriate arrays. 
        for (let index in this.executionList) {

          let newItem = this.executionList[index];

          //get default line chart Data
          this.populateLineChartData(newItem, currentData);

          //get pie chart data. 
          this.populatePieChartData(newItem);

          //Get BarChart Data
          //this.populateBarChartData(newItem);

          //get multi line chart data
          //this.populateMultiLineChartData(newItem);
        }

        //sort the two arrays descending.
        this.testInstanceData.Executions.sort((a, b) => b.Count - a.Count);
        this.testInstanceData.Individual_Exec.sort((a, b) => b.total - a.total);
        resolve();
      }, err => {
        reject(err);
      });
    }).then(res => {

      // this.tdFilters = {
      //   startDate: moment().subtract(2, 'weeks').toDate(),
      //   endDate: moment().toDate(),
      //   selected: [],
      // };
      // this.tiFilters = {
      //   startDate: moment().subtract(2, 'weeks').toDate(),
      //   endDate: moment().toDate(),
      //   selectedTDs: [],
      //   selectedTIs: [],
      //   multiLineLimit: 5,
      // }
      this.finishedDefaultData.next(res);
    })
  }


}
