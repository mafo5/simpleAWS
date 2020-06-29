# Simple AWS Tutorial

The simple idea is to provide a step by step tutorial to get a simple application into Amazon Web Services (AWS).

When I came across the need to deploy my applications somewhere I found myself overwhelmed with the options AWS provides. Therefore, I looked around for simple solutions and yet was not successful.

The premise is to create a "simple" client-server-database application and deploy it into the Amazon Cloud. In my case, I used JavaScript and Angular to provide the basic application. You can choose whatever language and framework you like. It should not have much impact on this tutorial. (Maybe the database connection will get a bit different.)

The Basic Application is split into three parts. It has a WebClient Application on top of a REST API. The REST API is provided by a Server Application and a Database provides the Data for the REST API.

The Client is built in the latest vanilla Angular. The Server uses the ExpressJS Framework. The database is a MongoDB.

You can check out each step to see what will cover its goals or you can check out the master to see the latest result. Every step will be built on top of each other. Some things might slightly change between steps. The goal here is to no remove any features. So e.g. the app will run locally at first and should stay runnable locally for the rest of the steps.

## Step1 Simple App (v1.x.x)

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

## Step2 Dockerify (v2.x.x)
 
**Goal: Put all into docker container to be started with one command**

Till now the server had a hardcoded URL of the database. To make it changeable I read the environment variables and used the hardcoded values as a fallback. I added a `Dockerfile` configuration with the latest node image as a basis. The configuration copies the needed files and installs the dependencies. In the end, it runs the `npm start` command to start the server.

For the client, we have to replace the currently local reverse proxy from Angular and it's web container with a separate one. It is not recommended to run Angular in production state in a docker container and instead use a separate web container like Nginx. I added an `nginx/default.conf` file in which I created a `/api` location with a reverse proxy entry. This covers the same feature as the `proxy-conf` of Angular. As a target URL, I used an alias for the server. This will later be resolved by the docker container environment. Additionally, I added a `Dockerfile` to the client as well. It copies the `default.conf` as well as the generated `dist` from Angular to its purposeful folder in the latest Nginx image.

Because we have three different system - the client, the server and the database - to interact with each other we will use `docker-compose` to create a bundle of containers. There are surely other ways to achieve this as well but this is the easiest way to get the connection between the containers.  So in the root of the project itself, I created a `docker-compose.yml` to combine both created containers with a MongoDB container. All containers got their name set and for the server, I set the name of the database as an environment variable. Additionally, I added a port forwarding from the client to the same port Angular uses to have the same effect when starting the docker-compose as when the Angular client was started alone. 

To speed up the process I created a `.dockerignore` next to the created `Dockerfile` files. 

After all, I now can start everything with just one command. The compose starts all three containers. I tested it manually.

## Step3 Continuous Integration (v3.x.x)

**Goal: run all the development scripts to ensure stability and provide artefacts for the cloud**

*COMING SOON*

## Step4 Amazon Cloud (v4.x.x)

**Goal: put all into an Amazon provided docker instance to have it run all the time**

*COMING SOON*

## Step5 Amazon Features (v5.x.x)

**Goal: replace MongoDB with DynamoDB to better usage of Amazon services**

*COMING SOON*