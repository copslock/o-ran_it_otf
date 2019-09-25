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


package org.oran.otf.camunda.delegate.otf.common;

import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.utility.Utility;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import org.assertj.core.util.Strings;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SendMailDelegate implements JavaDelegate {

  @Autowired private WorkflowUtility utility;

  private static final String logPrefix = Utility.getLoggerPrefix();
  private static final Logger log = LoggerFactory.getLogger(SendMailDelegate.class);

  @Override
  public void execute(DelegateExecution execution) throws Exception {
    Map<String, Object> variables = execution.getVariables();
    Map<String, Object> testData = utility.getTestData(variables, logPrefix);

    Map<String, Object> sendMailData = null;
    try {
      sendMailData =
          (Map<String, Object>) testData.getOrDefault(execution.getCurrentActivityId(), null);
    } catch (Exception e) {
      log.error(e.getMessage());
      throw new TestExecutionException(e);
    }

    if (sendMailData == null) {
      String err =
          String.format(
              "%sMissing parameters for activityId, %s.",
              logPrefix, execution.getCurrentActivityId());
      log.error(err);
      throw new TestExecutionException(err);
    }

    // Get the recipient(s)
    Object oRecipients = sendMailData.get("to");
    if (oRecipients == null) {
      String err = String.format("%sRecipients array cannot be null or empty.", logPrefix);
      log.error(err);
      throw new TestExecutionException(err);
    }
    List<String> recipients = null;
    try {
      recipients = (ArrayList<String>) (oRecipients);
      if (recipients.size() == 0) {
        String err = String.format("%sRecipients array cannot be null or empty.", logPrefix);
        log.error(err);
        throw new TestExecutionException(err);
      }
    } catch (Exception e) {
      throw new TestExecutionException(e);
    }

    for (String recipient : recipients) {
      if (Strings.isNullOrEmpty(recipient)) {
        String err = String.format("%sRecipient cannot be null or empty.", logPrefix);
        log.error(err);
        throw new TestExecutionException(err);
      }
    }

    // Get the email subject.
    String subject = (String) sendMailData.get("subject");
    if (Strings.isNullOrEmpty(subject.trim())) {
      String err = String.format("%sSubject cannot be null or empty.", logPrefix);
      log.error(err);
      throw new TestExecutionException(err);
    }

    // Get the body contents.
    String body = (String) sendMailData.get("body");
    if (Strings.isNullOrEmpty(body.trim())) {
      String err = String.format("%sBody cannot be null or empty.", logPrefix);
      log.error(err);
      throw new TestExecutionException(err);
    }

    TestExecution testExecution = utility.getTestExecution(variables, logPrefix);
    String sender = testExecution.getHistoricEmail();
    String hTestInstanceId = testExecution.getHistoricTestInstance().get_id().toString();
    String processInstanceId = execution.getProcessInstanceId();

    sendMail(recipients, subject, body, sender, processInstanceId, hTestInstanceId);
  }

  public void sendMail(
      List<String> recipients,
      String subject,
      String body,
      String sender,
      String processInstanceId,
      String testInstanceId)
      throws Exception {
    // Get the system properties.
    Properties properties = System.getProperties();

    // Set the SMTP host.
    properties.setProperty("mail.smtp.host", "localhost");

    // creating session object to get properties
    Session session = Session.getDefaultInstance(properties);

    try {
      // MimeMessage object.
      MimeMessage message = new MimeMessage(session);

      // Set From Field: adding senders email to from field.
      message.setFrom(new InternetAddress("OTF_EMAIL-ALERT@localhost"));

      // Set Subject: subject of the email
      message.setSubject(subject);

      // set body of the email.
      StringBuffer sb = new StringBuffer();
      sb.append("************************OTF Alerting System************************");
      sb.append("\n\n");
      sb.append(String.format("This message was sent by %s via the Open Test Framework\n", sender));
      sb.append(String.format("processInstanceId: %s\n", processInstanceId));
      sb.append(String.format("testInstanceId: %s", testInstanceId));
      sb.append("\n\n");
      sb.append("******************************************************************");
      sb.append("\n\n");
      sb.append(body);

      message.setText(sb.toString());

      // Send email.
      Transport.send(message);
    } catch (MessagingException mex) {
      mex.printStackTrace();
    }
  }
}
