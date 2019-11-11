#/bin/bash
#   Copyright (c) 2019 AT&T Intellectual Property.                             #
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
################################################################################


podName=$1
echo $podName
podInfo=$(kubectl get pods -l app=$1 -o custom-columns=:metadata.name)
echo $podInfo
podArray=(`echo ${podInfo}`)
for var in "${podArray[@]}"
do
  echo "Force deleting pod ${var}"
  kubectl delete pods ${var} --grace-period=0 --force --ignore-not-found=true
done