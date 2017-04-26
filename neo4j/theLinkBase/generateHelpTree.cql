// clear help tree
MATCH (n:Trail) OPTIONAL MATCH (n)-[r]-() WITH n,r
DELETE n,r
RETURN count(n) as deletedNodesCount;

// clear help tree
MATCH (n:Help) OPTIONAL MATCH (n)-[r]-() WITH n,r
DELETE n,r
RETURN count(n) as deletedNodesCount;

CREATE (h:Trail {
    Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01',
    DatePublished: '20170110',
    Name: '-->theLink<-- User Documentation',
    Summary: 'User documentation for -->theLink<--',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'User Documentation'
});

CREATE (h:Help {
    Uuid: 'db4bf610-d7ad-11e6-bf26-cec0c932ce01',
    DatePublished: '20170110',
    Name: 'Introduction to -->theLink<--',
    Summary: '-->theLink<-- helps organizations harness their critical knowledge',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Introduction',
   
MarkdownContent:

'# Menome Technologies -->theLink<--#
![menomelogo](images/161119 theLink search logo neo4j.jpg)
## Overview 

Experience is the best teacher.

Every project your company does, every task a person undertakes as they work to bring a project to life, contains valuable insight and lessons as to how to do things better.

This valuable experience forms the foundation of your organization’s knowledge. The challenge is that the lessons people learn as they do their work ends up being scattered across disconnected, difficult to use systems: thus these valuable lessons are often lost.

Menome Technologies Knowledge Discovery Platform –>theLink<– will help capture and retain those valuable lessons learned and bring them together so that they can be shared by all employees.

By connecting data and knowledge from the systems and documents your company uses using descriptions and terms your people are familiar with, –->theLink<–- makes it simple for those lessons to be shared and accessed by everyone in your organization, so that they can deliver the best possible project to your clients in the least amount of time, every time.

Our goal is to help you give your employees one place to go to easily access the experience your organization possesses to ensure everyone has the shortest distance between a question and the knowledge required to answer it.

## How -->theLink<-- helps make your life better

**–>theLink<–**  Enables you to access to your company’s knowlege.

Many organizations have unique types of knowledge assets that are specifically suited to a particular purpose.

Examples include:

* Employees with specific training or certifications
* Employees with specific experience (in a location, working for a client, working on a type of job)
* Equipment or people in a certain location

In many business, the relevance of an knowledge asset, project, or event depends on its relationships to other knowledge assets, projects, or events.

For example, if you are looking for someone to staff a project for a particular client, you likely want to find someone who has worked on similar projects in the past.

This may be projects that
* Constitute the same type of work
* Are concerned with the same or similar location, facility, or other knowledge asset
* Were for the same or similar client

Thelink is a system that will allow your organization to capture these important relationships and leverage them support future decision making. With theLink you are a few clicks away from

* Finding the best employee for a job
* Finding the nearest equipment to a site
* Seeing the entire work history on a facility
* Seeing all the past projects an employee has worked on
* Seeing all the projects you have done for a particular customer
* Seeing who has done the most work for a particular client, on a particular asset, or both
* Finding the documents associated with a particular asset

For professional service firms, theLink puts strategic intelligence about your own organizations asset at your fingertips so you can deploy and develop those assets in the smartest way possible.

**-->thelink<--** doesnt replace your existing systems, it links the valuable knowledge they contain together using language and terminology that your business uses. **-->thelink<--** makes it easy for people to find and discover the knowledge that your business possesses. 

**-->thelink<--** is designed you see the business the way your people do - not the way your systems do.
'
});

CREATE (h:Help {
    Uuid: 'db4bfa7a-d7ad-11e6-bf26-cec0c932ce01',
    DatePublished: '20170110',
    Name: 'Desgin of -->theLink<--',
    Summary: 'The foundation of -->theLink<-- is a Knowledge Web that links Index Cards together with Relationships.',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Design',
   
MarkdownContent:
'##The Knowledge Web:
The reason that Google search works as well as it does is because it indexes the World Wide Web. Google indexes billions of web pages and documents and accepts 5 billion queries per day. Those huge numbers and the hyperlinked nature of web pages make it possible for them to create the search experience they have. 

Business does not have an equivalent web: at least not one that can be seen or indexed. The Knowledge Web instead exists, but it in employees minds as they describe and store the knowledge they work with. 

This Knowledge Web must be created by by talking to people from teams around the business to find out how they classiy people, projects, files, customer business objects and documents they manage. 

The business entities are then mapped out and connected together to form a **Knowledge Web**:  

![the Knowledge Web](images/dialogKnowledgeWeb.png)'
});

CREATE (h:Help {
    Uuid: 'db4c0178-d7ad-11e6-bf26-cec0c932ce01',
    DatePublished: '20170110',
    Name: 'Toolbar and Card Explorer Tools',
    Summary: 'The Card Explorer Tools help you find the cards you are looking for',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Toolbar',
   
MarkdownContent:
'## Card Explorer

The Card Explorer section is the group of icons on the left side of the toolbar. 

![the Knowledge Web](images/toolbar1.png)

These tools give you several paths thgrough which to find the Index Cards you are looking for. 

These are designed to function like the File Explorer you are used to, but improved in that they are able to provide a few different ways of getting to the knowledge you need quickly. 

####Home Button: 
The Home Button takes you back to the main page of **-->theLink<--** with the Dashboards. 

 ![the Knowledge Web](images/HomeButton2.png)
 
 The Dashboards show various metrics that answer questions about the knowledge stored in **-->theLink<--**. More questions can be added if needed. 

####Card Explorer Tools:

The **Card Explorer** is designed to help you find **Index Cards**. There are several types of Card Explorer tools to help you find of finding the cards you are looking for:

* **Card Explorer: List** : Find cards using a folder style drill-down
* **Card Explorer: Text** : Find cards by using their properties 
* **Card Explorer: Map**  : Find cards by their location using a map
* **Card Explorer: Name** : Find cards by using all or part of their name

####Card Explorer: List
 
Clicking the Card Explorer List Button will open the Card Explorer on the Left Side Menu. The top half of the Card Explorer shows a list of Index Card types such as Companies, Projects and People. 

![the Knowledge Web](images/CardExplorerList6.png )

Clicking on a card type will display collections that you can return cards by. Clicking on the Projects card type, will display a list of collections:

* **All Projects By Letter:** returns a list of projects grouped by letter with a count of the number of projects for that letter
* **All Projects By Date:** returns a list of projects  grouped by Year. Further refinment can be made to filter by Month and Day  
* **All Projects by Location:** returns a list of projects grouped by Country. Further refinement can be made to filter down to Region or City. 
* **Tag Cards:** the Card Explorer List tool can also display Tag Cards. This allows Index Cards to be return corrsponding to the Tag Card selected. 

#### Tag Cards: 

The bottom half of the Card Explorer shows a list of Tag Cards. 

These cards are tags that used to help classify Index or Content Cards. Clicking on a Tag Card will return a list of Tags associated with the Tag Card Group. 

![the Knowledge Web](images/CardExplorerTag1.png )

Selecting a tag will display the **Link Explorer** that will show all Index Cards that are linked to the Tag Card. '
});


CREATE (h:Help {
    Uuid: 'cbd04e5e-dc38-11e6-bf26-cec0c932ce01',
    DatePublished: '20170110',
    Name: 'Toolbar and Card Explorer Tools',
    Summary: 'The Card Explorer Tools help you find the cards you are looking for',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Toolbar',
   
MarkdownContent:'

'


// load Relationship: Trail -> LinksTo -> Help
MATCH (a:Trail { Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01'})
MATCH (c:Help {Uuid: 'db4bf610-d7ad-11e6-bf26-cec0c932ce01' })
CREATE (a)-[:LinksTo { Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01'}]->(c);

// load Relationship: Trail -> LinksTo -> Help
MATCH (a:Help { Uuid: 'db4bf610-d7ad-11e6-bf26-cec0c932ce01'})
MATCH (c:Help {Uuid: 'db4bfa7a-d7ad-11e6-bf26-cec0c932ce01' })
CREATE (a)-[:LinksTo { Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01'}]->(c);

// load Relationship: Trail -> LinksTo -> Help
MATCH (a:Help { Uuid: 'db4bfa7a-d7ad-11e6-bf26-cec0c932ce01'})
MATCH (c:Help {Uuid: 'db4c0178-d7ad-11e6-bf26-cec0c932ce01' })
CREATE (a)-[:LinksTo { Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01'}]->(c);

// load Relationship: Person -> AuthorOf -> Help
MATCH (a:Help { Uuid: 'db4bf610-d7ad-11e6-bf26-cec0c932ce01'})
MATCH (c:Help {Uuid: 'db4bfa7a-d7ad-11e6-bf26-cec0c932ce01' })
CREATE (a)-[:LinksTo { Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01'}]->(c);
