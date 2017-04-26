// Builds up the test DB from scratch.
// This should be done when the docker container is first created.
// It should not be done every time it is set up.

// Clear the Database
MATCH (n) OPTIONAL MATCH (n)-[r]-()WITH n,r
DELETE n,r
RETURN count(n) as deletedNodesCount;


// indexes
CREATE INDEX ON :Article(Uuid);
CREATE INDEX ON :Trail(Uuid);
CREATE INDEX ON :Help(Uuid);
CREATE INDEX ON :Person(Uuid);
CREATE INDEX ON :Team(Uuid);
CREATE INDEX ON :Office(Uuid);
CREATE INDEX ON :Company(Uuid);
CREATE INDEX ON :User(Uuid);
CREATE INDEX ON :Role(Uuid);

CREATE INDEX ON :Project(Uuid);

// constraints
CREATE CONSTRAINT ON (user:User) ASSERT user.Email IS UNIQUE;


// NodePerson.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodePerson.csv' AS line
CREATE (c:Person {
    Uuid: line.PersonId,
    Email: line.Email,
    FirstName: line.FirstName,
    LastName: line.LastName,
    CellPhone: line.CellPhone,
    PhotoUrl: line.PhotoUrl,
    Address: line.Address,
    City: line.City,
    PostalCode:line.PostalCode
});

// load NodeTeam.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeTeam.csv' AS line
CREATE (c:Team {
    Uuid: line.TeamId,
    Name: line.Name
});

// load NodeCompany.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeCompany.csv' AS line
CREATE (c:Company {
    Uuid: line.CompanyId,
    Name: line.Name,
    Code: line.Code,
    Website: line.Website,
    ImageUrl: line.ImageUrl,
    Phone: line.Phone,
    Fax: line.Fax,
    Email: line.Email
});

// load NodeOffice.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeOffice.csv' AS line
CREATE (c:Office {
    Uuid: line.OfficeId,
    Name: line.Name
});

// load NodeUser.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeUser.csv' AS line
CREATE (c:User {
    Uuid: line.UserId,
    Email: line.Email,
    Password: line.Password,
    EmailVerified: true
});

// load NodeRole.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeRole.csv' AS line
CREATE (c:Role {
    Uuid: line.RoleId,
    Name: line.Name
});

// load NodeArticle.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeArticle.csv' AS line
CREATE (c:Article {
    Uuid: line.ArticleId,
    Name: line.Name,
    Summary: line.Summary,
    Source: line.Source,
    PhotoUrl: line.PhotoUrl,
    DatePublished: toInt(substring(line.DatePublished,0,2))+toInt(substring(line.DatePublished,3,2))*100 + toInt(substring(line.DatePublished,6,4))*10000
});

// load NodeTopic.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeTopic.csv' AS line
CREATE (c:Topic {
    Uuid: line.TopicId,
    Name: line.Name
});

// load NodeDiscipline.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeDiscipline.csv' AS line
CREATE (c:Discipline {
    Uuid: line.DisciplineId,
    Name: line.Name,
    Code: line.Code
});

// load NodePosition.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodePosition.csv' AS line
CREATE (c:Position {
    Uuid: line.PositionId,
    Name: line.Name,
    Code: line.Code
});

// load NodeEducation.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeEducation.csv' AS line
CREATE (c:Education {
    Uuid: line.EducationId,
    Name: line.Name,
    Code: line.Code,
    Description: line.Description
});

// load NodeProject.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeProject.csv' AS line
CREATE (c:Project {
    Uuid: line.ProjectId,
    Name: line.PrimaryName,
    AlternateName: line.AlternateName,
    Code: line.Code,
    Description: line.Description,
    Status: line.Status,
    StartDate: toInt(substring(line.StartDate,0,2))+toInt(substring(line.StartDate,3,2))*100 + toInt(substring(line.StartDate,6,4))*10000 ,
    EndDate: line.EndDate,
    Address: line.Address,
    City: line.City,
    Province: line.Province,
    Country: line.Country,
    ImageUrl: line.ImageUrl,
    ProjectUrl: line.ProjectUrl,
    FileUrl: line.FileUrl
});

// load NodeClient.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/NodeClient.csv' AS line
CREATE (c:Client {
    Uuid: line.ClientId,
    FirstName: line.FirstName,
    LastName: line.LastName,
    Code: line.Code,
    Alias: line.Alias,
    CellPhone: line.CellPhone,
    WorkPhone: line.WorkPhone,
    WorkEmail: line.WorkEmail
});

// load Relationship: Article -> ClassifiedAsTopic -> Topic
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipArticleClassifedAsTopic.csv' AS line
MATCH (c:Article {Uuid: line.ArticleId })
MATCH (a:Topic {Uuid : line.TopicId })
MERGE (c)-[:ClassifiedAsTopic]->(a);

// load Relationship: Person -> IsAuthor -> Article
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonIsAuthorOfArticle.csv' AS line
MATCH (c:Person {Uuid: line.PersonId })
MATCH (a:Article { Uuid : line.ArticleId })
MERGE (c)-[:IsAuthorOf]->(a);

// load Relationship: Person -> Member of -> Team
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonMemberOfTeam.csv' AS line
MATCH (c:Person {Uuid: line.PersonId })
MATCH (a:Team { Uuid : line.TeamId })
MERGE (c)-[:MemberOfTeam]->(a);

// load Relationship: Person -> works for -> Company
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonWorksForCompany.csv' AS line
MATCH (c:Person { Uuid: line.PersonId })
MATCH (a:Company { Uuid : line.CompanyId })
MERGE (c)-[:WorksFor]->(a);

// load Relationship: Person -> located in -> Office
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonLocatedInOffice.csv' AS line
MATCH (c:Person { Uuid: line.PersonId })
MATCH (a:Office { Uuid : line.OfficeId })
MERGE (c)-[:LocatedInOffice]->(a);

// load Relationship: User -> HasRole -> Role
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipUserHasRole.csv' AS line
MATCH (c:User { Uuid: line.UserId })
MATCH (a:Role { Uuid : line.RoleId })
MERGE (c)-[:HasRole]->(a);

// load Relationship: Persion -> IsInPosition -> Position
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonIsInPosition.csv' AS line
MATCH (c:Person {Uuid: line.PersonId })
MATCH (a:Position {Uuid : line.PositionId })
MERGE (c)-[:IsInPosition]->(a);

// load Relationship: Persion -> HasEducationIn -> Education
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonHasEducationIn.csv' AS line
MATCH (c:Person {Uuid: line.PersonId })
MATCH (a:Education {Uuid : line.EducationId })
MERGE (c)-[:HasEducationIn]->(a);

// load Relationship: Person -> IsInDiscipline -> Discipline
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonIsInDiscipline.csv' AS line
MATCH (c:Person {Uuid: line.PersonId })
MATCH (a:Discipline {Uuid : line.DisciplineId })
MERGE (c)-[:IsInDiscipline]->(a);

// load Relationship: Person -> IsProjectManagerOf -> Project
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonIsProjectManagerOf.csv' AS line
MATCH (c:Person {Uuid: line.PersonId })
MATCH (a:Project {Uuid : line.ProjectId })
MERGE (c)-[:IsProjectManagerOf {DateActive: line.DateActive}]->(a);

// load Relationship: Person -> WorkedOn -> Project
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipPersonWorkedOnProject.csv' AS line
MATCH (c:Person {Uuid: line.PersonId })
MATCH (a:Project {Uuid : line.ProjectId })
MERGE (c)-[:WorkedOn {Hours: line.Hours}]->(a);

// load Relationship: Project -> IsInDiscipline -> Discipline
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipProjectIsInDiscipline.csv' AS line
MATCH (c:Project {Uuid: line.ProjectId })
MATCH (a:Discipline {Uuid : line.DisciplineId })
MERGE (c)-[:IsInDiscipline]->(a);

// load Relationship: Client -> WorksFor -> Company
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipClientWorksForCompany.csv' AS line
MATCH (c:Client {Uuid: line.ClientId })
MATCH (a:Company {Uuid : line.CompanyId })
MERGE (c)-[:WorksFor]->(a);

// load Relationship: Project -> IsFor -> Client
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipProjectIsForClient.csv' AS line
MATCH (c:Project {Uuid: line.ProjectId })
MATCH (a:Client {Uuid : line.ClientId })
MERGE (c)-[:IsFor]->(a);

// load Relationship: Article -> IsInProject -> Project
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkBase/RelationshipArticleIsInProject.csv' AS line
MATCH (c:Project {Uuid: line.ProjectId })
MATCH (a:Article {Uuid : line.ArticleId })
MERGE (a)-[:IsInProject]->(c);