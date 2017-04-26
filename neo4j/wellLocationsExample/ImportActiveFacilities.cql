

// constraints
CREATE CONSTRAINT ON (f:Facility) ASSERT f.Code IS UNIQUE;
CREATE CONSTRAINT ON (e:Edct) ASSERT f.Code IS UNIQUE;
CREATE CONSTRAINT ON (s:SubType) ASSER s.Code IS UNIQUE;
// indexes
CREATE INDEX ON :Facility(Uuid);
CREATE INDEX ON :Facility(Name);
CREATE INDEX ON :Facility(LSD);
CREATE INDEX ON :Operator(Code);
CREATE INDEX ON :SubType(Name)

// Energy Development Category Type (EDCT)
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ActiveFacility_edctCodes.csv' AS line // with line limit 100
// create uuid
CALL apoc.create.uuids(1) YIELD uuid as wuuid

MERGE (c:Edct {  Code: line.EDCT   })
ON CREATE set
    c.Uuid = wuuid,
    c.Name =  line.ShortDescription,
    c.Summary = line.Description;

// Facility 
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ActiveFacility.csv' AS line //with line limit 100
CALL apoc.create.uuids(1) YIELD uuid as fuuid

MERGE (f:Facility {Code: line.FacilityID})
ON CREATE set
f.Uuid= fuuid,
f.Name= line.FacilityName,
f.LSD= line.LSD,
f.Status= line.OperationalStatus;

// Facility Has EdctCode EdctCodes
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ActiveFacility.csv' AS line //with line limit 100
CALL apoc.create.uuids(1) YIELD uuid as fuuid

// facility HasEdct Edct 
WITH  line
where line.EDCTCode <> ''
MATCH(e:Edct {Code:line.EDCTCode}) 
MATCH(f:Facility {Code:line.FacilityID})
MERGE(f)-[:HasEdct]->(e);

// Operator
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ActiveFacility.csv' AS line 
WITH line 
where line.OperatorCode <> ''

MATCH (l:Operator {Name: line.OperatorCode})
set
l.Name= line.OperatorName,
l.Code= line.OperatorCode

// Operator
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ActiveFacility.csv' AS line 
WITH line 
where line.OperatorCode <> ''

// Facility HasOperator Operator
WITH line 
MATCH(o:Operator {Code:line.OperatorCode})
MATCH(f:Facility {Code:line.FacilityID})
MERGE (f)-[:HasOperator]->(o)

// Facility SubType
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ActiveFacility.csv' AS line 
WITH line 
where line.SubTypeCode <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid
MERGE (l:SubType {Code: line.SubTypeCode})
ON CREATE set
l.Uuid = line.Uuid
l.Name= line.SubType
ON MATCH SET
l.Uuid = line.Uuid
l.Name=line.SubType;

// Facility SubType
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ActiveFacility.csv' AS line 
WITH line 
where line.SubTypeCode <> ''

// Facility HasOperator Operator
WITH line 
MATCH(s:SubType {Code:line.SubTypeCode})
MATCH(f:Facility {Code:line.FacilityID})
MERGE (f)-[:IsSubType]->(s)

// generate APOC Lucene full text indexes
CALL apoc.index.addAllNodes('Names',{ Facility: ["Name","Code","LSD"], Licensee: ["Name","Code"], Operator: ["Name","Code"], Well: ["Name","LSD","Uwi"], Article:["Name","Summary"],Task:["Name","Summary"], Trail:["Name", "Summary"],Spill:["LSD","EnvironmentAffected","SubstanceReleased","Source"] });
