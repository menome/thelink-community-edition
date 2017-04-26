// constraints
CREATE CONSTRAINT ON (m:Meridian) ASSERT m.Code IS UNIQUE;
CREATE CONSTRAINT ON (r:Range) ASSERT r.Code IS UNIQUE;
CREATE CONSTRAINT ON (t:Township) ASSERT t.Code IS UNIQUE;
CREATE CONSTRAINT ON (s:Section) ASSERT s.Code IS UNIQUE;
CREATE CONSTRAINT ON (q:QuarterSection) ASSERT q.Code IS UNIQUE;

// indexes
CREATE INDEX ON :Meridian(Name);
CREATE INDEX ON: Range(Name);
CREATE INDEX ON: Township(Name);
CREATE INDEX ON: Section(Name);
CREATE INDEX ON :QuarterSection(Latitude);
CREATE INDEX ON :QuarterSection(Longitude);
CREATE INDEX ON :QuarterSection(LSD);
CREATE INDEX ON :QuarterSection(Name);

// Import ATS line data
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/ATS_V4_1_processed_wgs84.csv' AS line 
WITH line limit 10
CALL apoc.create.uuids(1) YIELD uuid as Uuid
WITH line, Uuid, 
CASE length(line.M)
WHEN 1 THEN "0" + line.M
ELSE line.M
END as name

MERGE (m:Meridian {Code: line.M})
ON CREATE set
m.Name= name,
m.LSD= m.Name 
ON MATCH SET
m.Name=name,
m.LSD= m.Name

// ----- Range ----
WITH line, m 

CALL apoc.create.uuids(1) YIELD uuid as Uuid
WITH line, Uuid, m,
CASE length(line.RGE)
WHEN 1 THEN "0" + line.RGE
ELSE line.RGE
END as name

MERGE (r:Range {Code: line.RGE})
ON CREATE set
r.Name= name,
r.LSD= m.Name + '-' + r.Name
ON MATCH SET
r.Name=name,
r.LSD= m.Name + '-' + r.Name 

WITH line,m,r 
MERGE(m)-[:HasRange]->(r)

// ----- Township ----
WITH line, m,r 

CALL apoc.create.uuids(1) YIELD uuid as Uuid
WITH line, Uuid, m,r,
CASE length(line.TWP)
WHEN 1 THEN "00" + line.TWP
WHEN 2 THEN "0" + line.TWP
ELSE line.TWP
END as name

MERGE (t:Township {Code: line.TWP})
ON CREATE set
t.Uuid=Uuid,
t.Name= name,
t.LSD= m.Name + '-' + r.Name +'-' + name
ON MATCH SET
t.Uuid=Uuid,
t.Name=name,
t.LSD= m.Name + '-' + r.Name +'-' + name

WITH line,m,r 
MERGE(r)-[:HasTownship]->(t)

// ----- Section ----
WITH line, m,r, t

CALL apoc.create.uuids(1) YIELD uuid as Uuid
WITH line, Uuid, m,r,t,
CASE length(line.SEC)
WHEN 1 THEN "0" + line.SEC
ELSE line.SEC
END as name

MERGE (s:Section {Code: line.SEC})
ON CREATE set
s.Uuid = Uuid,
s.Name= name,
s.LSD= m.Name + '-' + r.Name +'-' + t.Name + '-' + name
ON MATCH SET
s.Uuid = Uuid,
s.Name=name,
s.LSD= m.Name + '-' + r.Name +'-' + t.Name + '-' + name

WITH line,m,r,t,s
MERGE(t)-[:HasSection]->(s)

// ----- Quarter Section ----
WITH line, m,r, t,s

CALL apoc.create.uuids(1) YIELD uuid as Uuid
WITH line, Uuid, m,r,t,s

MERGE (qs:QuarterSection {Code: line.QS})
ON CREATE set
qs.Uuid = Uuid,
qs.Name= line.QS,
qs.Latitude=toFloat(line.Y),
qs.Longitude=toFloat(line.X),
qs.LSD= (m.Name + '-' + r.Name +'-'+ t.Name + '-' + s.Name + line.QS)
ON MATCH SET
qs.Uuid = Uuid,
qs.Name= line.QS,
qs.Latitude=toFloat(line.Y),
qs.Longitude=toFloat(line.X),
qs.LSD= (m.Name + '-' + r.Name +'-' + t.Name + '-' + s.Name + line.QS)

WITH line,m,r,t,s,qs
MERGE(s)-[:HasQuarterSection]->(qs)







08-27-016-11W4
X
Y
FILE_NAME
TRM
M
RGE
TWP
SEC
QS
RA
PID
DESCRIPTOR
