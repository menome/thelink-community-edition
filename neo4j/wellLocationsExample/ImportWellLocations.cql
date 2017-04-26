
// Clear the Database
MATCH (n) OPTIONAL MATCH (n)-[r]-()WITH n,r
DELETE n,r
RETURN count(n) as deletedNodesCount;

// constraints
CREATE CONSTRAINT ON (well:Well) ASSERT well.Uwi IS UNIQUE;
CREATE CONSTRAINT ON (field:Field) ASSERT field.Name IS UNIQUE;
CREATE CONSTRAINT ON (pool:Pool) ASSERT pool.Name IS UNIQUE;
CREATE CONSTRAINT ON (license:License) ASSERT license.Name IS UNIQUE;
CREATE CONSTRAINT ON (agent:Agent) ASSERT agent.Name IS UNIQUE;
CREATE CONSTRAINT ON (operator:Operator) ASSERT operator.Name IS UNIQUE;
CREATE CONSTRAINT ON (licensee:Licensee) ASSERT licensee.Name IS UNIQUE;
CREATE CONSTRAINT ON (licenseStatus:LicenseStatus) ASSERT licenseStatus.Name IS UNIQUE;

// indexes
CREATE INDEX ON :Well(Uuid);
CREATE INDEX ON :Well(LSD);
CREATE INDEX ON: Well(Latitude);
CREATE INDEX ON: Well(Longitude);
CREATE INDEX ON :Field(Uuid);
CREATE INDEX ON :Pool(Uuid);
CREATE INDEX ON :License(Uuid);
CREATE INDEX ON :Agent(Uuid);
CREATE INDEX ON :Operator(Uuid);
CREATE INDEX ON :Licensee(Uuid);
CREATE INDEX ON :LicenseStatus(Uuid);
CREATE INDEX ON :AlphabetGroup(Name);

// Well head identifier
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line // with line limit 100
// create uuid
CALL apoc.create.uuids(1) YIELD uuid as wuuid

MERGE (c:Well {  Uwi: line.UWI   })
ON CREATE set
    c.Uuid = wuuid,
    c.LSD = (substring(line.UWI,3,14)),
    c.Keylist = line.Keylist,
    c.Name= line.Name,
    c.TotalDepth= line.TotalDep,
    c.WellStat= line.WellStat,
    c.StatDate= line.StatDate,
    c.FDDate= line.FDDate,
    c.Latitude= toFloat(line.Y),
    c.Longitude= toFloat(line.X);

// Field Name
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
CALL apoc.create.uuids(1) YIELD uuid as fuuid

MERGE (f:Field {Name: line.Field})
ON CREATE set
f.Uuid= fuuid; 

// Well isInField Field
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
MATCH(w:Well {Uwi:line.UWI})
MATCH(f:Field {Name: line.Field})
MERGE (w)-[:IsInField]->(f);

// Pool Name
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
CALL apoc.create.uuids(1) YIELD uuid as Uuid

MERGE (p:Pool {Name: line.Pool})
ON CREATE set
p.Uuid= Uuid; 

// Well IsIsPool Pool
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
MATCH(w:Well {Uwi:line.UWI})
MATCH(p:Pool {Name: line.Pool})
MERGE (w)-[:IsInPool]->(p);


// License 
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line 
WITH line 
where line.License <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid

MERGE (l:License {Name: line.License})
ON CREATE set
l.Uuid= Uuid,
l.LicenseDate  =line.LicDate
ON MATCH set
l.Uuid= Uuid,
l.LicenseDate  =line.LicDate;

// Well HasLicense License
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
MATCH(w:Well {Uwi:line.UWI})
MATCH(l:License {Name: line.License})
MERGE (w)-[:HasLicense]->(l);

// Licensee 
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line 
WITH line 
where line.Licensee <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid

MERGE (l:Licensee {Name: left(line.Licensee,length(line.Licensee)-1)})
ON CREATE set
l.Uuid= Uuid
ON MATCH set
l.Uuid= Uuid; 

// License LicensedTo Licensee
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
MATCH(w:License {Name:line.License})
MATCH(l:Licensee {Name: left(line.Licensee,length(line.Licensee)-1)})
MERGE (w)-[:LicensedTo]->(l);

// License Status 
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line 
WITH line 
where line.LicStatus <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid

MERGE (l:LicenseStatus {Name: line.LicStatus})
ON CREATE set
l.Uuid= Uuid
ON MATCH set
l.Uuid= Uuid; 

// License HasStatus LicenseStatus
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
MATCH(w:License {Name:line.License})
MATCH(l:LicenseStatus {Name: line.LicStatus})
MERGE (w)-[:HasStatus]->(l);

// Agent
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
WITH line 
where line.Agent <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid

MERGE (a:Agent {Name: line.Agent})
ON CREATE set
a.Uuid= Uuid 
ON MATCH set
a.Uuid= Uuid; 

// Well HasAgent Agent
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
MATCH(w:Well {Uwi:line.UWI})
MATCH(a:Agent {Name: line.Agent})
MERGE (w)-[:HasAgent]->(a);

// Operator
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
WITH line 
where line.Operator <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid

MERGE (a:Operator {Name: line.Operator})
ON CREATE set
a.Uuid= Uuid
ON MATCH set
a.Uuid= Uuid; 

// Well HasOperator Operator
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/WellListLocationsWGS84.csv' AS line //with line limit 100
MATCH(w:Well {Uwi:line.UWI})
MATCH(a:Operator {Name: line.Operator})
MERGE (w)-[:HasOperator]->(a);

// FieldList 
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/FieldList.csv' AS line //with line limit 100
CALL apoc.create.uuids(1) YIELD uuid as Uuid

MERGE (f:Field {Name: line.FieldCode})
ON CREATE set
f.Uuid= Uuid,
f.Name = line.FieldName,
f.Code = line.FieldCode,
f.Summary = line.FieldAbbrev,
f.FieldCenter = line.FieldCentre
ON MATCH set
f.Name = line.FieldName,
f.Code = line.FieldCode,
f.Summary = line.FieldAbbrev,
f.FieldCenter = line.FieldCentre;

