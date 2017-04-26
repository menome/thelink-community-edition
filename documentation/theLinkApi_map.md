# TheLinkApi Code Map

Here's a brief explanation of every file in theLink's API backend.

### api/controllers
All Swagger API controllers live in this folder. Basically, that's any meta-information about theLink, and any node endpoint that is not incredibly generic.

I have not listed all endpoints found in this folder, since many of them are self-explanatory Swagger API endpoints for nodes.

* auth.js
    * This contains all swagger API endpoints for authentication. This includes registration, user deletion, and token issuing. Also has a function to get user details.
    * No explicit login function. That's because REST calls are stateless. You're logged in if your request contained valid authentication data. (Usually a JWT token, issued by a call to getAuthToken).
    * Generally, user uses HTTP Basic auth to get a JWT token, and uses that from then on.
* fulltextsearch.js
    * Provides an endpoint for performing a full text search of theLink. Returns results as nodes.
* meta.js
    * Provides configuration information from the API.
    * getSearchInfo gives all the information that a client should need to diplay search tools to the user
    * getConfigInfo gives all the information that a client should need for non-search related configuration.
        * This is available without user authentication, so it can contain information about what authentication schemes are allowed.
* pivot.js
    * Endpoint that allows us to 'pivot' on a node given that node's ID.
    * Pivots are just immediate graph relationships.
    * There is a method to get all of a node's pivot information
    * Performing a pivot grabs immediate relationships according to the node type, relationship to the starting node, both, or neither.
* questions.js
    * Allows the user to ask questions about a node
    * Questions are just canned queries that are more complex than basic pivots.
    * The user can get a list of all questions that can be aked of a node of a given type.
    * They can ask the question by supplying the node's ID and the question string to another endpoint.

### api/helpers
This folder contains code that isn't directly served up by swagger. Helper functions and all that.

* auth.js
    * This contains basically everything authentication-related that is NOT part of a swagger API endpoint.
    * Set up all passport authentication schemes
    * Ensure that all paths are protected with authentication middleware
    * Determine roles for a given authenticated user
* database.js
    * This contains all functions for interacting with the DB. The largest function is nodeSearch, which takes a massive options object and parses it into a cypher query + method for dealing with whatever that query returns. 
    * It's largely general. Everything that deals with the Database will go through some code found in here.
    * Also manages DB sessions for safe transactions.
* endpoint-helper.js
    * Contains some useful helper functions for API endpoints. 
    * This includes wrapper functions for response messages.
    * And a generic function for getting nodes by their relationship to another node.
* generic-endpoint.js
    * This is all the code you need to set up a generic endpoint for a node type, given only the name of that node type.
    * In the future, this should probably go through Swagger. But as it is, this is just done using expressjs API endpoints. There's a section in server.js that shows how these are used.
* images.js
    * This was an early attempty to allow users to upload their own images when creating a new card. Images would be uploaded to the top-level 'images' directory, and could be served statically once uploaded.
    * Currently this is unused.
* models.js
    * This is the master list of nodes and their metadata.
    * Like this is the biggest config file in theLink.
    * Contains all node types, the names of relationships that give them their extended properties, human readable names for all relationships, and all defined questions.
    * Also contains a number of string converting helper functions.

### api/swagger
This folder contains our swagger configuration file.

Don't edit this directly. Instead, navigate to the root of the API project directory and use 'swagger project edit' to get a nice browser based editor.

## config
Configuration files go here.

* conf.js
    * This is the main configuration file of theLink. It exports a single javascript object of key/value pairs.
    * This controls things like whether theLink is set up for anonymous access, what SSL certs theLink uses, what credentials it uses to connect to the DB, and what secret it uses to sign its JWT auth tokens.
    * Also contains code for loading a config file of the same format from a different directory. If there is a file called conf.js mounted in a folder 'ext\_config' next to this one inside the docker container, the contents of that config file will override the contents of this one.
    * This means that to use a custom config file, configure docker to mount a folder to ext\_config and put your custom config file (and any SSL certs or other files you need) inside that folder.
* default.yaml
    * This is the default configuration file for Swagger. It has its own documentation inside.
* search-config.js
    * Contains the configuration for search display in the UI.
    * A giant list of every searchable node, and information about how you can search it.

## test

Unit tests live here. The frameworks we are using are Supertest and Mocha. 

The tests are mostly self describing. There is generally one test file per swagger API endpoint, with a couple little tests for the models and things that aren't surfaced directly by the API.

To run the tests, use the 'run\_tests.sh' shellscript found in this folder. This shellscript should be run inside the docker container.
