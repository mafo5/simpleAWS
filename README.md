# Simple AWS Tutorial

* [Step1 Simple App](#step1)
* [Step2 Dockerify](#step2)
* [Step3 Continuous Integration](#step3)
* [Step4 Amazon Cloud](#step4)
* [Step5 Amazon Features](#step5)
* [Step6 Amazon Costs](#step6)

The simple idea is to provide a step by step tutorial to get a simple application into Amazon Web Services (AWS).

When I came across the need to deploy my applications somewhere I found myself overwhelmed with the options AWS provides. Therefore, I looked around for simple solutions and yet was not successful.

The premise is to create a "simple" client-server-database application and deploy it into the Amazon Cloud. In my case, I used JavaScript and Angular to provide the basic application. You can choose whatever language and framework you like. It should not have much impact on this tutorial. (Maybe the database connection will get a bit different.)

The Basic Application is split into three parts. It has a WebClient Application on top of a REST API. The REST API is provided by a Server Application and a Database provides the Data for the REST API.

The Client is built in the latest vanilla Angular. The Server uses the ExpressJS Framework. The database is a MongoDB.

You can check out each step to see what will cover its goals or you can check out the master to see the latest result. Every step will be built on top of each other. Some things might slightly change between steps. The goal here is to no remove any features. So e.g. the app will run locally at first and should stay runnable locally for the rest of the steps.

## Step1 Simple App ([v1.x.x](https://github.com/mafo5/simpleAWS/tree/v1.0.2))
<a name="step1"></a>

**Goal: Create simple application running locally**

Note: Please bear in mind, that I try to develop all my application test-driven. So I will provide unit tests for all the software features. Even if I don't mention it in the descriptions of the processes.

First of all, I started with the server so I can use the REST API as the central feature all other things are built around.

The REST API should provide the usual **C**reate**R**eas**U**pdate**D**elete interface. Therefore, I needed at least one list endpoint and a child endpoint. With these endpoints, I can provide GET to load data, POST to create data, PUT to change data and DELETE to remove data in a restful way. So I hit for `/entries` and `/entries/:id` as my REST API.

With ExpressJS it is really easy to create this API. Just created an object of `express` and added the endpoints via method functions to the object. (see [documentation](http://expressjs.com/en/api)) At first, I used a simple array as a data container. After finishing everything I manually tested the API via Postman.

(The full server development process was: init npm, add dependencies, add node scripts, create ExpressJS server)

Creating a simple application with Angular is easy with the CLI. I didn't use many additional things except the `HttpClientModule` and `FormsModule`. I tried to separate the files a bit. Therefore, I created a service next to the initial `app.component`. The service encapsulates the API into usable functions. The component provides the form needed to get inputs and lists the data of the API. All used features of Angular are very basic. (see [hero tutorial](https://angular.io/tutorial))

I have very good experiences with using a reverse proxy to avoid Same-Origin-Policy Problems with the API. Angular provides the `proxy-config` feature for this. The setup is really easy. You just need to keep in mind that the "server" providing the client no provides the public API as well. All requests will be tunnelled through the client to the backend service provided by the ExpressJS application. On the other hand, you can implement Same-Origin-Policy into the ExpressJS application. (I will not cover this!)

(The full client development process was: generate a new angular app, add dependencies, generate a new service, add the proxy config, implement the service, implement the component)

So after finishing the client and running it with the proxy it uses the running server and does all data manipulation. I additionally checked the reverse proxy via Postman.

Unfortunately, there is no simple mongo server runnable from npm. So I just added the latest MongoDB to my running docker service. You can just add a mongo instance to your system as well. It should have the same result which is an unrestricted MongoDB on the usual port.

To connect the server with the database I used the official library. I removed the array implementation as a data container and replaced it with a mongo implementation. Frankly, this is a bit complicated. You should just redesign the API to directly use the MongoDB. this would reduce the need to fit the array interface as I did here.

(The full database process was: install MongoDB, add the dependency to the server, implement database interface)

Running everything now I can manipulate data and store them into the mongo as documents. A simple CRUD application. All things should have a good amount of test coverage. You can extend the features in any dimension. Most likely you will have a much more complex application.

## Step2 Dockerify ([v2.x.x](https://github.com/mafo5/simpleAWS/tree/v2.0.1))
<a name="step2"></a>
 
**Goal: Put all into docker container to be started with one command**

Till now the server had a hardcoded URL of the database. To make it changeable I read the environment variables and used the hardcoded values as a fallback. I added a `Dockerfile` configuration with the latest node image as a basis. The configuration copies the needed files and installs the dependencies. In the end, it runs the `npm start` command to start the server.

For the client, we have to replace the currently local reverse proxy from Angular and it's web container with a separate one. It is not recommended to run Angular in production state in a docker container and instead use a separate web container like Nginx. I added an `nginx/default.conf` file in which I created a `/api` location with a reverse proxy entry. This covers the same feature as the `proxy-conf` of Angular. As a target URL, I used an alias for the server. This will later be resolved by the docker container environment. Additionally, I added a `Dockerfile` to the client as well. It copies the `default.conf` as well as the generated `dist` from Angular to its purposeful folder in the latest Nginx image.

Because we have three different system - the client, the server and the database - to interact with each other we will use `docker-compose` to create a bundle of containers. There are surely other ways to achieve this as well but this is the easiest way to get the connection between the containers.  So in the root of the project itself, I created a `docker-compose.yml` to combine both created containers with a MongoDB container. All containers got their name set and for the server, I set the name of the database as an environment variable. Additionally, I added a port forwarding from the client to the same port Angular uses to have the same effect when starting the docker-compose as when the Angular client was started alone. 

To speed up the process I created a `.dockerignore` next to the created `Dockerfile` files. 

After all, I now can start everything with just one command. The compose starts all three containers. I tested it manually.

## Step3 Continuous Integration ([v3.x.x](https://github.com/mafo5/simpleAWS/tree/v3.0.0))
<a name="step3"></a>

**Goal: run all the development scripts to ensure stability and provide artefacts for the cloud**

Note: Because I have all my codebase in GitHub. I will use GitHub to store the source code and AWS only to provide the deployment infrastructure. So from now on, I assume you got a GitHub account and an AWS account. Additionally, I used `eu-central-1` as my region. This will have consequences in pricing. Please see the regions for more information. 

First of all, I created a new repository for the server container and the client container at [ECR](https://eu-central-1.console.aws.amazon.com/ecr/repositories?region=eu-central-1). This will create a docker registry for a single image. So you can push images with the same name to the same URL but should use different URLs for different named containers. That's why I created two.

For security purpose, I created a new group and user for my GitHub actions in [AWS User Management](https://console.aws.amazon.com/iam/home?#/users). As the policy for the user, I selected `AmazonEC2ContainerRegistryPowerUser`. ATTENTION: The id and key on the success page needed to be noted, because you will not see them again. Both are put into the secret panel in GitHub Repository Settings Page as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

To ensure the stability of the code I created a GitHub workflow action to run the test command on every push. This script failed at first because the client Angular application uses Chrome as the default browser. This browser is not accessible in the GitHub environment. Therefore, I created an additional script for the CI in the `karma.conf` using the `ChromeHeadless` setting.

To access the created docker container in AWS later, I used the [official AWS publish workflow action](https://github.com/actions/starter-workflows/blob/master/ci/aws.yml). I extended it with the usage of [package version action](https://github.com/marketplace/actions/package-version) to extract the version from the `package.json` to not use the SHA value of the commit as a tag. Also, I needed to copy the built part to cover both images I created.

After the next commit, both actions are executed and the images are now pushed into the Amazon Repository.

## Step4 Amazon Cloud ([v4.x.x](https://github.com/mafo5/simpleAWS/tree/v4.0.0))
<a name="step4"></a>

**Goal: put all into an Amazon provided docker instance to have it run all the time only via website**

This part dives deep into AWS. There is a [very good tutorial](https://aws.amazon.com/getting-started/hands-on/break-monolith-app-microservices-ecs-docker-ec2/) for AWS in general. I can highly recommend using this tutorial to gain all the needed knowledge. The problem with this tutorial is that it uses a "monolith" as start and is a bit complicated to extend to a usual client-server-database architecture and also not addresses a database. Nevertheless, I will use this AWS tutorial as a basis. Will you face problems with my description look into the AWS tutorial to find the current AWS provided solution. This step here is more or less [the Module2 of the AWS Tutorial](https://aws.amazon.com/getting-started/hands-on/break-monolith-app-microservices-ecs-docker-ec2/module-two/)

Attention: The pricing of AWS is quite complicated. Some features have a free forever contingent and some have a first 12 months free contingent. Even though of free contingent some part may cost anyway. So I can only recommend to always check your [last 7 days in the cost monitor](https://console.aws.amazon.com/cost-management/home?#/custom?groupBy=Service&excludeDiscounts=false&timeRangeOption=Last7Days&granularity=Daily).

First of all, we create a key pair to be able to access the to be created computer instance. The creation is not needed but enables you to debug a bit better if you face any problems. It is impossible to add a key pair after creating an instance. You only need to add a name for the key pair and download it for later usage on the [key page of the EC2 service page]((https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#KeyPairs:)).

With this created key we now create a cluster. On the [ECS cluster page](https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/clusters) by clicking the create cluster button, you can enter all needed information for the cluster. I used the "EC2 Linux + Networking" template, picked a name, selected the t2.micro instance because the first 12 months of this is free, selected the created key pair, selected to create a new VPC, changed the Security group inbound rules to "0-65535" to enable all ports to be accessible, selected to create a new IAM role and selected to enabled CloudWatch Container Insights. After creating, you should note the VPC number. Later you will need to select the correct VPC in other wizards to see all your created instances and services etc. This wizard now has created a VPC with an EC2 instance in it, two subnets, two routing tables, an internet gateway, two security groups, an auto scale and starting config, a volume and some security roles. If you try to revert all your doings, keep in mind track the deletion of everything created by the wizard. In some cases, the deletion wizard doesn't fully remove all of it.

After the creation, we have to extend the service rules to enable the correct connection of the MongoDB. Therefore got to the [ServiceRule page](https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#SecurityGroups:) and select the rule with the description "ECS Allowed Ports". In the details below on the tab for incoming traffic you can edit the rule and select all incoming sources which adds "::/0" as source.

Now is the time to make an infrastructural decision: Do you want to scale the set of services together or independent of each other?

The easy (and mostly described) is the bundled service answer. Here you just need the create one task for all three containers and one service for the task. Each container in the task can be linked via the "link" property in the "Network Settings" section. The property is a comma-separated string. (Attention: array able properties just need to be a comma-separated string. Please take a look at the JSON view of the task to confirm the correct usage.) With the linkage, all containers can find each other and the task can be started as a service in the cluster. After all, you need a load balancer to access the application for the internet. For the explicit steps read the next part of the complex answer because the basic creation is the same. Just add all containers to one task.

We will dive deeper into the more complex answer of running each container as a single task to scale each one independently. 

First of all, we need a discovery system for each container to find the others because the UI needs to know the IP of the API and the API need to know the IP of the database. There are [many different ways](https://github.com/nathanpeck/awesome-ecs#implementation-guides) to achieve the same goal. I decided to use the Load Balancer for this purpose because it's the more convenient way from my architectural view. (attention: Each LB will cost around 25$ per month just to exist and an additional fee for each transferred byte. This might get cost-intensive. I will look at the costs [later](#step6).) Each LB will create a target while creation. But it will not delete the target when it will be deleted. So bare in mind to delete the targets you don't need.

Because the MongoDB will be accessed via the mongo protocol which is not HTTP the database needs a TCP Load Balancer. So you can create one Network Load Balancer for the database and an Application Load Balancer for the UI and API, or you create separate Application Load Balancer for the UI and API, or you create one Classic Load Balancer for all parts together, or one Classic Load Balancer for API and database and one Application Load Balancer for the UI. Because I like to reduce public access and don't want to use legacy usage I picked the three Load Balancer solution. For the database and API LB I selected the internal usage. For the UI the LB needs to be internet accessible. All LBs gets a unique name and it's appropriated port in the listeners, all subnets selected in the VPC created for the cluster, all existing security groups selected, a unique new target name and the VPC instance registered. The API gets the "/health" path and the UI keeps the default path as a health check for the target. On the [list view for the Load Balancers](https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#LoadBalancers:), you need to note the DNS name for the database and the service as the name for the environment properties of the API and the UI container.

Now we will create a task for each container in the [task overview](https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/taskDefinitions). Each task gets a unique name. You get the image URL from the [registry page](https://eu-central-1.console.aws.amazon.com/ecr/repositories?region=eu-central-1#). Just add the latest tag name (e.g. version number) to the URI. Each container needs its dedicated port map and max memory set. For the MongoDB, I picked 256 for memory and 27017 as the port. For the API, I picked 128 for memory and 8200 as the port. And finally, for the UI I picked 128 again and 80 as the port. Because of the micro instance, the maximum memory for everything can't exceed 512MB. That's why I picked 256 once and 128 twice. Regarding the [documentation of MongoDB](https://learn.fotoware.com/On-Premises/FotoWeb/05_Configuring_sites/Setting_the_MongoDB_instance_that_FotoWeb_uses/MongoDB_disk_and_memory_requirements), this will enable ca 2560 entries in the database. You can tweak the memory settings for your desire.
The API needs the Load Balancer DNS name of the database as "DB_HOST" environment variable and the UI needs the Load Balancer DNS name of the API as "API_HOST" environment variable.
(Changing Task configurations result in a new revision is a bit painful. Usually, I create 3 revisions because I always forget something.)

With all three tasks, we now can create a service for each task. Each service is an EC2 one, with a unique name, with 1 as the number of tasks and its appropriated load balancer. For each load balancer, you need to add the port mapping appropriately. Select the already created AWSServiceRoleForECS as Service IAM role as well as the existing port listener and the existing target in the port map.

After all three services are running you can test the app via the DNS name of the UI Load Balancer. When you can enter entries and put them into the list, everything went well.

## Step5 Amazon Features ([v5.x.x](https://github.com/mafo5/simpleAWS/tree/v5.0.0))
<a name="step5"></a>

**Goal: replace MongoDB with DynamoDB to better usage of Amazon services**

*COMING SOON*

## Step6 Amazon Costs ([v6.x.x](https://github.com/mafo5/simpleAWS/tree/v6.0.0))
<a name="step6"></a>

**Goal: get a cost overview for a usual website in this setup**

*COMING SOON*