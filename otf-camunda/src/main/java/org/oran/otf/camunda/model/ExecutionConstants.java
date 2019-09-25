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


package org.oran.otf.camunda.model;

public class ExecutionConstants {
  public class TestResult {
    public static final String STARTED = "STARTED";
    public static final String COMPLETED = "COMPLETED";
    //remore redundent test results
//    public static final String FAILURE = "FAILURE";
    public static final String FAILED = "FAILED";
    public static final String STOPPED = "STOPPED";
    public static final String SUCCESS = "SUCCESS";
    public static final String TERMINATED = "TERMINATED";
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String DOES_NOT_EXIST = "DOES_NOT_EXIST";
    public static final String UNKNOWN = "UNKNOWN";
    // error can be assignned in a workflow. if user uses workflow error reassign to error
    public static final String ERROR = "ERROR";
    // workflow error is only used for exceptions and bugs
    public static final String WORKFLOW_ERROR = "WORKFLOW_ERROR";
    public static final String OTHER = "OTHER";
  }

  public class ExecutionVariable {
    public static final String TEST_EXECUTION = "otf-execution-testExecution";
    public static final String TEST_EXECUTION_ENCRYPTED = "otf-execution-encrypted";
    public static final String PFLO_INPUT = "pfloInput";
    public static final String TEST_DATA = "testData";
    public static final String TEST_DETAILS = "testDetails";
    public static final String TEST_RESULT = "testResult";
    public static final String VTH_INPUT = "vthInput";
    public static final String TEST_RESULT_MESSAGE = "testResultMessage";
  }

  public static String [] getAllTestResultStr(){
      return new String[] {TestResult.STARTED,TestResult.COMPLETED,TestResult.FAILED,
              TestResult.STOPPED,TestResult.SUCCESS,TestResult.TERMINATED,
              TestResult.UNAUTHORIZED,TestResult.DOES_NOT_EXIST,TestResult.UNKNOWN,
              TestResult.ERROR,TestResult.OTHER};
  }
}
