.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. http://creativecommons.org/licenses/by/4.0
..
.. Copyright (C) 2019 AT&T Intellectual Property


Release-Notes
=============


This document provides the release notes for Amber Release of Open Test Framework (OTF).

.. contents::
   :depth: 3
   :local:


Version history
---------------

+--------------------+--------------------+--------------------+--------------------+
| **Date**           | **Ver.**           | **Author**         | **Comment**        |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| 2019-11-12         | 0.1.0              | Rohan Patel (AT&T) | First draft        |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
|                    | 0.1.1              |                    |                    |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
|                    | 1.0                |                    |                    |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+


Summary
-------

This release will include the initial commit of the OTF platform code. Applications include otf-frontend, otf-service-api, otf-camunda, and several virtual test head microservices (ping, ssh, robot, ric). In addition setup documentation and installation guides are included to build docker containers and helm charts for deployment. 




Release Data
------------


+--------------------------------------+--------------------------------------+
| **Project**                          | OTF                                  |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Repo/commit-ID**                   | it/otf                               |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Release designation**              | E.g. Arno RC2                        |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Release date**                     | E.g. 2015-04-16                      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Purpose of the delivery**          |                                      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+




Feature Additions
^^^^^^^^^^^^^^^^^


**JIRA BACK-LOG:**

+--------------------------------------+--------------------------------------+
| **JIRA REFERENCE**                   | **SLOGAN**                           |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| INT-34                               | Contribute OTF seed code to Linux    |
|                                      | Foundation                           |
+--------------------------------------+--------------------------------------+
| INT-35                               | Deploy one operational OTF instance  |
|                                      | in O-RAN SC lab                      |
+--------------------------------------+--------------------------------------+
| INT-36                               | Develop one VTH                      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| INT-37                               | Create one test strategy for         |
|                                      | End-to-End Integration/Demo          |
+--------------------------------------+--------------------------------------+
| INT-38                               | Create one test instance             |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| INT-39                               | Demonstrate OTF test execution       |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| INT-40                               | Documentation OTF and education      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+

Bug Corrections
^^^^^^^^^^^^^^^

**JIRA TICKETS:**

+--------------------------------------+--------------------------------------+
| **JIRA REFERENCE**                   | **SLOGAN**                           |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| 		                       | 				      |
|                                      | 				      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| 	                               |  				      |
|                                      |  				      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+

Deliverables
^^^^^^^^^^^^

Software Deliverables
+++++++++++++++++++++

Code: https://gerrit.o-ran-sc.org/r/gitweb?p=it/otf.git;a=summary

Repository contains several applications:


oran-ric-test-head:     
	- VTH that enables interaction with xAPP manager
	- Functionality includes list, deploy, delete xApps
        
otf-aaf-credential-generator:      
	- contains helm chart for AAF information
        
otf-camunda:
	- Test Control Unit Engine       
	- Application handles deployment and execution of OTF test strategies        
        
otf-cert-secret-builder:      
	- contains helm chart for certificate and credential information
        
otf-frontend:        
	- OTF Portal / GUI
	- Application provides portal for OTF and allows users to deploy, execute, schedule, and view test executions
        
otf-ping-test=head:    
	- VTH that capability to ping a server
     
otf-robot-test-head:    
	- VTH that enables the execution of Robot tests
    
otf-service-api:
	- Test Control Unit API
	- Application exposes apis that allow clients to execute test instances, create test instances, and query execution status. 
    
otf-sst-test-head:    
	- VTH that enables ssh capability to remote server
    


Instructions on how to build and run these applications can be found in the otf-installation.txt file located in the it/otf repository.

Documentation Deliverables
++++++++++++++++++++++++++

OTF Documentation can be found in the link below:

Documentation: https://wiki.o-ran-sc.org/pages/viewpage.action?pageId=10715484

The videos and documents located here contain information about how to use the OTF platform, create and execute tests, and troubleshoot workflows.


Known Limitations, Issues and Workarounds
-----------------------------------------

System Limitations
^^^^^^^^^^^^^^^^^^


Known Issues
^^^^^^^^^^^^


**JIRA TICKETS:**

+--------------------------------------+--------------------------------------+
| **JIRA REFERENCE**                   | **SLOGAN**                           |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| 		                       | 				      |
|                                      | 				      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| 	                               |  				      |
|                                      |  				      |
|                                      |                                      |
+--------------------------------------+--------------------------------------+

Workarounds
^^^^^^^^^^^



References
----------


