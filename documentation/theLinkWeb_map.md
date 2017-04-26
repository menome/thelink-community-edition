# TheLinkWeb Code Map

Here's a brief explanation of every file in theLink's web frontend.

## Main Directory
* app.html
    * The main application's HTML page. Includes all relevant javascript files. This is the starting point for basically everything in the webapp.
* index.html
    * The entry point to theLink. This page basically just serves up a login prompt to the user. 
    * If the user is booted out of the app for authentication reasons, they'll be redirected here. 
    * If they have valid auth cookies, they'll be redirected to the app when they land here.

## Assets Directory

This directory contains all non-code for theLink. app.css is the stylesheet, everything else is static images (mostly logos). 

The static images here don't have anything to do with the actual data. There will be no employee portraits here, for example. Those are housed elsewhere.

## src Directory

This is where all the code for theLink lives.

### src/common

This is where common modules, controllers, and functions are stored, so they can be loaded by any components of the webapp.

 * infinite-scroll.js
    * This is an angular module that can be included in another angular module. It provides a directive for an infinite scrolling list.
 * theLinkConfig.js
    * This contains some global config that should be used for any of our angular modules.
    * Currently it sets up the menome logo as an icon, and defines the basic angular material color palettes.
    * Both the login page and the main app page use this config.
 * theLinkWebService.js
    * Provides an interface for making calls to the API
    * Configures how we store user authentication data, and abstracts that away.
    * Allows the user to login, logout, get information about themself, and make generic API calls.
    * Also includes a base64 encoder and decoder for HTTP basic auth (which is not used by default)

### src/login

This is all the code for the login page of theLink. (ie. what gets loaded from index.html)

 * LoginController.js
    * The main controller of the login module.
    * Does normal controller things. Makes calls to the webService to login and register users.
    * Controls any dialogue boxes that pop up. (eg. register new user form)
 * LoginDirective.js
    * Contains all custom directives used for the login page
    * Currently we only have one, which checks if passwords entered in two text fields are the same, and if not, outputs standard angular-material verification errors.
 * Login.js
    * Defines the angular module, loads all its module dependencies, and loads up the shared configuration.
 * templates (Angular templates for embedded page content)
    * register.tmpl.html - When the user hits the 'register new user button' a modal window is shown, with this as its contents.
    
### src/thelink
 * LeftPanelController.js
    * The controller for the left sidepanel (The search panel)
    * Manages the information that the user has entered, what menus they have open, etc.
    * Populates the list search when it first loads. (In the future may populate this based on lazy loading.)
    * Loads searching metadata from the API
 * RightPanelController.js
    * The controller for the right sidepanel (The node info panel)
    * Listens for a change in the user's selection. Based on this selection, it will open or close itself, and load relevant display information.
    * When a new node is selected, it will also retrieve pivot info about the node, as well as retrieve a list of questions that can be asked about the node.
 * TheLinkController.js
    * Main controller for the entire operation.
    * When ran, it does some housekeeping stuff like ensuring the user is authenticated, and redirecting them to login if they're not.
    * Handles most backend logic of UI elements. (Search result filter, Breadcrumb trail, infinite scroll, etc.
    * Handles all communication with the webService. 
    * All methods that return a list of nodes to be displayed (text search, list search, search by groups of time, location, alphabet, and all pivots) reside here.
    * Contains the handlers for getting back a list of nodes or groups and deciding how to display them.
    * Handles events regarding user selection.
 * TheLinkDirective.js
    * Contains all the definitions for directives.
    * Many of these use the templates found in the templates directory below.
    * These definitions are what allow us to provide a context to the templates in the form of HTML DOM attributes.
    * Using one of these directives usually means invoking them as an HTML tag.
 * TheLink.js
    * Defines the angular module, loads all its module dependencies, and loads up the shared configuration.
 * TheLinkService.js
    * All angular services used by theLink reside here.
    * Contains some metadata for each type of node we recognize.
        * This can be thought of as the list of all nodes that our web frontend recognizes. If it encounters a node that has no info here, it will default to a fairly informationless default template for display, so be sure to register the node types here.
        * This includes the icon, name, api endpoint, and other metadata.
        * Can define functions for getting key-value pairs for display on a node-by-node basis.
        * Can define custom functions for getting display name and display summary
    * Contains an angular service that keeps track of which node the user has currently selected.
        * All controllers in the project can hook into this service, and listen for changes in the user's selection.
        * Selecting a new card will use the node type's metadata described above to get all the display info we need from it.
    * Contains an angular service for handling dialogue boxes. (For creating nodes, displaying error messages, etc.


#### src/theLink/templates
This is where all our templates live. Templates are basically just little snippets of HTML that can be inserted into other pages using angular directives.

Most of these don't actually contain any data. They're instead given a context in the form of a javascript object, and display that context in a nice, human readable way.

 * card-Dates.tmpl.html
    * The card that shows when the user searches grouped by date.
    * Shows the year, and has dropdowns for searching by month and day.
 * card-Generic.tmpl.html
    * Generic card for theLink. Given an arbitrary node, shows the card's picture (or icon) as well as any other display info such as summary or any key value pairs. Clicking the information icon, the title, or the main icon will fire an event. (Which is handled to bring up the right side pane)
 * card-Group.tmpl.html
    * The card that shows when the user searches grouped by alphabet. It shows the alphabet group, and the number of items in that group.
    * Clicking this card fires an event back to the controller (namely, display all node cards that are in this alphabet group)
 * card-Locations.tmpl.html
    * The card that shows when the user searches grouped by date.
    * Shows the country, and has dropdowns for searching by region and city.
 * dialog-create-article.tmpl.html
    * This is the dialogue box shown when the user clicks 'create new article.'
 * display-pair-list.tmpl.html
    * This is the container for displaying key-value pairs that are associated with a node. It's used on the card, as well as on the details pane of the right sidebar.
 * leftpanel-menu.tmpl.html
    * This is an alternative left sidepanel for use on devices with little horizontal screen space. It allows access to all the search functionality from a collapsible side panel.
    * This is never used on desktop. When something new is added to the top menu bar on the desktop layout, it should also be added in here.
 * rightpanel-node-digest.tmpl.html
    * This is shown on the right sidebar when a node is selected.
    * It shows the summary, key-value pairs, and a view original source button if the node has a source URL.
 * search-list.tmpl.html
    * The sidepanel menu for searching nodes by clicking on categories. Categories are nested in dropdown menus.
 * search-text.tmpl.html
    * The sidepanel menu for searching for nodes via text fields. The text fields are nested in dropdown menus.

#### Dashboard and Charts
We are using D3 through Angular Nvd3 to get anuglar versions of d3 directives http://krispo.github.io/angular-nvd3/#/.
