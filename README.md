# Simple AWS Tutorial

The simple idea is to provide a step by step tutorial to get a simple application into Amazon Web Services (AWS).

When I came across the need to deploy my applications somewhere I found myself overwhelmed with the options AWS provides. Therefore, I looked around for simple solutions and yet was not successful.

The premise is to create a "simple" client-server-database application and deploy it into the Amazon Cloud. In my case, I will use JavaScript and furthermore Angular to provide the basic application. You can choose whatever language and framework you like. I should not change a lot. (Maybe the database connection will get a bit different.)

The Basic Application will be split into three parts. It will have a WebClient Application on top of a REST API. The REST API will be provided by a Server Application and a Database will provide the Data for the REST API.

The Client will be built in the latest vanilla Angular. The Server will be using the ExpressJS Framework. The database will be a MongoDB.

You can check out each step see what will cover its goals or you can check out the master to see the latest result. Every step will be built on top of each other. Some things might slightly change between steps. The goal here is to no remove any features. So the app will run locally at first and should stay runnable locally for the rest of the steps.

## Step1 Simple App (v1.x.x)

**Goal: Create simple application running locally**

Note: Please bear in mind, that I try to develop all my application test-driven. So I will provide unit tests for all software features. Even if I don't mention it in the descriptions of the processes.

First of all, I started with the server so I can use the REST API as the central feature all other things are built around.

The REST API should provide the usual **C**reate**R**eas**U**pdate**D**elete interface. Therefore, I needed at least one list endpoint and a child endpoint. With these endpoints, I can provide GET to load data, POST to create data, PUT to change data and DELETE to remove data in a restful way. So I hit for `/entries` and `/entries/:id` as my REST API.

With ExpressJS it is really easy to create this API. Just create an object of `express` and add the endpoints via method functions to the object. (see [documentation](http://expressjs.com/en/api)) At first, I used a simple array as a data container. After finishing everything I manually tested the API via Postman.

(The full server development process is: init npm, add dependencies, add node scripts, create ExpressJS server)

Creating a simple application with Angular is really easy with the CLI. I didn't use many additional things except the `HttpClientModule` and `FormsModule`. I try to separate the files a bit. Therefore, I created a service next to the initial `app.component`. The service will encapsulate the API into usable functions. The component will provide the form needed to get inputs and list the data of the API. All used features of Angular are very basic. (see [hero tutorial](https://angular.io/tutorial))

I have very good experiences with using a reverse proxy to avoid Same-Origin-Policy Problems with the API. Angular provides the `proxy-config` feature for this. The setup is really easy. You just need to keep in mind that the "server" providing the client no provides the public API as well. All requests will be tunnelled through the client to the backend service provided by the ExpressJS application. On the other hand, you can implement Same-Origin-Policy into the ExpressJS application. (I will not cover this!)

(The full client development process is: generate a new angular app, add dependencies, generate a new service, add the proxy config, implement the service, implement the component)

So after finishing the client and running it with the proxy it can use the running server and do all data manipulation. I additionally checked the reverse proxy via Postman.

Unfortunately, there is no simple mongo server runnable from npm. So I just added the latest MongoDB to my running docker service. You can just add a mongo instance to your system as well. It should have the same result which is an unrestricted MongoDB on the usual port.

To connect the server with the database I used the official library. I removed the array implementation as a data container and replaced it with a mongo implementation. This is fairly a bit complicated. You should just redesign the API to directly use the MongoDB. this would reduce the need to fit the array interface as I did here.

Running everything now I am able to manipulate data and store them into the mongo as documents. All things should have a good amount of test coverage. A simple CRUD application. You can extend the features in any dimension. Most likely you will have a much more complex application.

## Step2 Dockerify (v2.x.x)

**Goal: Put all into docker container to be started with one command**

*COMING SOON*

## Step3 Continuous Integration (v3.x.x)

**Goal: run all the development scripts to ensure stability and provide artefacts for the cloud**

*COMING SOON*

## Step4 Amazon Cloud (v4.x.x)

**Goal: put all into an Amazon provided docker instance to have it run all the time**

*COMING SOON*

## Step5 Amazon Features (v5.x.x)

**Goal: replace MongoDB with DynamoDB to better usage of Amazon services**

*COMING SOON*
