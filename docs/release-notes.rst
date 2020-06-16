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
| 2020-06-16         | 0.1.2              | Jackie Chen (AT&T) | new VTH development|
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
|                    | 1.0                |                    |                    |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+


Summary
-------

This release(0.1.2) will include new VTHs that were developed for oran community.The following are VTHs were developed:

    - dmaap
    - A1-mediator
    - smo-o1
    - SDNC
    - A1-policy-manager

Most of the vth were built according to health-check use cases(Workflow #2,#3,#4) via: https://wiki.o-ran-sc.org/display/RSAC/Health-Check+Use+Case



Release Data
------------


+--------------------------------------+--------------------------------------+
| **Project**                          | OTF                                  |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Repo/commit-ID**                   | it/otf                               |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Release designation**              | Bronze                               |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Release date**                     | 2020-06-16                           |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
| **Purpose of the delivery**          | update repo with VTHs                |
|                                      |                                      |
+--------------------------------------+--------------------------------------+




Feature Additions
^^^^^^^^^^^^^^^^^


**JIRA BACK-LOG:**

+--------------------------------------+--------------------------------------+
| **JIRA REFERENCE**                   | **SLOGAN**                           |
|                                      |                                      |
+--------------------------------------+--------------------------------------+
|                                      |                                      |
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

dmaap-vth:
    - VTH used to subscribe and publish topics/message via dmaap api

a1-mediator-vth:
    - VTH used to communicate with A1-mediator
    - Built according to: https://gerrit.o-ran-sc.org/r/gitweb?p=ric-plt/a1.git;a=blob;f=a1/openapi.yaml
    - Functionality includes:
        - health-check on A1
        - list registered policy types
        - GET,DELETE,PUT policy types
        - list policy instance
        - GET,DELETE,PUT policy instance
        - Retrieve policy instance status

smo-o1-vth:
    - Performs health checks to verify that O1 interface is alive by getting alarm list

a1-policy-manager-vth:
    - Used to communicate with A1 policy management service api
    - Built according to: https://docs.o-ran-sc.org/projects/o-ran-sc-nonrtric/en/latest/policy-agent-api.html#policy-agent-api
    - Has all functionality that is available in the above link. The vth will require the action and method necessary information e.g. query values and json data and forward the request to the service

a1-sdnc-vth:
    - Used to communicate with SDNC A1 Controller api
    - built according to: https://docs.o-ran-sc.org/projects/o-ran-sc-nonrtric/en/latest/sdnc-a1-controller-api.html
    - Has all functionality that is available in the above link. The vth will require the action and method necessary information e.g. query values and json data and forward the request to the service

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


