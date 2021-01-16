## IAM User

* Administrator Id/Key für Push ins Amazon Registry
* Project User Id/Key für Push ins Amazon Registry
  - Richtlinie: AmazonEC2ContainerRegistryPowerUser

## Amazon ECR (Repositories)

_aka. Docker Registry_

* je ein Repository pro Container


## Amazon ECS Cluster

* Anlegen eines Cluster mit t2.micro
  - 30GB Volume wird automatisch angelegt




### Ansatz Elastic Beanstalk

* "Hochladen" von "statischem Code"



## Ansatz 15.06.20

* Schlüssel anlegen (https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#KeyPairs:)
* Cluster anlegen (https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/clusters) - "simple-aws-cluster", t2.micro, keypair auswählen, new VPC, Security group inbound rules Port: 0 - 65535, new IAM role, CloudWatch Container Insights
  * ECS AMI: IDami-00b639818e857a757
  * VPC: vpc-0c31be1dfffdc445d
* Task für Datenbank anlegen (https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/taskDefinitions) - "simple-aws-database-task", container: simple_aws_database, Memory 256, port: 27017
* Loadbalancer für Datenbank anlegen (https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#LoadBalancers:sort=loadBalancerName) - "simple-aws-database-lb", internal, port: 27017, alle subnetze, alle security gruppen, Target group: new, "simple-aws-database-target", Port: 27017, /test, unhealthy: 5, timeout: 20, instance hinzugefügt
* Service in Cluster für Datenbank anlegen - "simple-aws-database-service", task: "simple-aws-database-task", number: 1, Application Load Balancer, AIM: "AWSServiceRoleForECS", Load Balancer: "simple-aws-database-lb", add "simple_aws_database : 27017", listener port: 27017:http, target group: "simple-aws-database-target"
* Task für APIService anlegen (https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/taskDefinitions) - "simple-aws-service-task", container: simple_aws_server, Memory 256, port: 8200
* Loadbalancer für APIService anlegen (https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#LoadBalancers:sort=loadBalancerName) - "simple-aws-service-lb", internal, port: 8200, alle subnetze, alle security gruppen, Target group: new, "simple-aws-service-target", Port: 8200, /health, unhealthy: 5, timeout: 20, instance hinzugefügt
* Name des Loadbalancer für Datenbank merken: internal-simple-aws-database-lb-496511763.eu-central-1.elb.amazonaws.com
* Service in Cluster für APIService anlegen - "simple-aws-service-service", task: "simple-aws-service-task", number: 1, Application Load Balancer, AIM: "AWSServiceRoleForECS", Load Balancer: "simple-aws-service-lb", add "simple_aws_server : 8200", listener port: 8200:http, target group: "simple-aws-service-target", Environment: "DB_HOST":"internal-simple-aws-database-lb-496511763.eu-central-1.elb.amazonaws.com"
* Task für Client anlegen (https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/taskDefinitions) - "simple-aws-client-task", container: simple_aws_client, Memory 256, port: 8200
* Loadbalancer für Client anlegen (https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#LoadBalancers:sort=loadBalancerName) - "simple-aws-client-lb", internet, port: 80, alle subnetze, alle security gruppen, Target group: new, "simple-aws-client-target", Port: 80, unhealthy: 5, timeout: 20, instance hinzugefügt
* Name des Loadbalancer für APIService merken: internal-simple-aws-service-lb-1676721038.eu-central-1.elb.amazonaws.com
* Service in Cluster für Client anlegen - "simple-aws-client-service", task: "simple-aws-client-task", number: 1, Application Load Balancer, AIM: "AWSServiceRoleForECS", Load Balancer: "simple-aws-client-lb", add "simple_aws_server : 80", listener port: 80:http, target group: "simple-aws-client-target", Environment: "API_HOST":"internal-simple-aws-service-lb-1676721038.eu-central-1.elb.amazonaws.com"

### Probleme

* ELB Health Checks fail
  * database rejected
  * apiservice 504
  * client 

## offene Fragen