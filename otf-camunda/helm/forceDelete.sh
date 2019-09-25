#/bin/bash
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