# -->theLink<--
Docker Setup:

###Build for dev:
docker-compose up

###Build for Prod:

docker-compose -f docker-compose-prod.yml  -f docker-compose-common.yml build


### Run for Prod:
docker-compose -f docker-compose-prod.yml  -f docker-compose-common.yml up -d

### Docker-compose for datadog:
<https://github.com/DataDog/docker-compose-example>

### Build -->theLink<-- Docker Image locally

**Install Docker CLI:**
docker run dockercloud/cli -h

**Validate the Install:** docker-cloud -v

**Login to docker cloud** docker login *username password*

**build theLink prod container**: (from dir with dockerfile - NOTE tags must be lowercase!) docker build -f DockerfileProd -t thelink . 

**generate tag:** docker tag thelink menome/thelink

**Push image to docker cloud:** docker push menome/thelink


**theLink lives in the Menome dockerhub private repo:** <https://hub.docker.com/r/menome/thelink/>

**Now the image can be pulled:** docker pull menome/thelink

### Docker Cloud Node and Service Setup ###

Docker Cloud is linked to the menome/theLink repository
Repository entries have been made to watch the four container source dockerfile directories.
Whenever code is checked in on the Production or Dialog branches, the appropriate docker cloud build will be triggeredd.


### Updating Neo4j Database in the Cloud ###
Login to https://cloud.docker.com
Go into the Containers list and select the Neo4j container
Activate the terminal mode
CD into the import folder
run 
/var/lib/neo4j/bin/neo4j-shell -file /var/lib/neo4j/import/importQueries.cql
/var/lib/neo4j/bin/neo4j-shell -file /var/lib/neo4j/import/generateTimeTree.cql
=======

### Movie as Projects Sample Database ###
Movies are very much like projects - they have a start, they have objectives, they have people who work on them (actors), people who project manage them (directors) etc. 

We have taken the standard neo4j movies sample, and reframed it using project management terms for demonstrating -->theLink<--. 

#### Setting up the Movie Project Sample ####

** Build theLink: ** docker-compose build
 
** Bring the containers up: ** docker-compose up

** Delete the graph.db directory: ** Once the neo4j database is up, delete the graph.db directiory from the /data/databases location. This will create a clean instance of the neo4j database

** Run the MovieProjectSample.sh shell script: ** from the /theLink/neo4j/import/movieSample directory. This will import the CSV files for the nodes and relationships. 

** Stop and Restart the docker-compose instance ** to re-initialize neo4j post import. 

** Log into the link ** Use the REGISTER function to create a new user, since the database will not contain any users post import. 

