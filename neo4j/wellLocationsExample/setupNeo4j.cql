

// load NodeUser.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/NodeUser.csv' AS line
CREATE (c:User {
    Uuid: line.UserId,
    Email: line.Email,
    Password: line.Password,
    EmailVerified: true
});

// load NodeRole.csv
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/NodeRole.csv' AS line
CREATE (c:Role {
    Uuid: line.RoleId,
    Name: line.Name
});


// load Relationship: User -> HasRole -> Role
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/RelationshipUserHasRole.csv' AS line
MATCH (c:User { Uuid: line.UserId })
MATCH (a:Role { Uuid : line.RoleId })
MERGE (c)-[:HasRole]->(a);

