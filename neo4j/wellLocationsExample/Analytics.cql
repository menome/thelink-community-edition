// count wells and spills for licensees
MATCH (l:Licensee)<-[:LicensedTo]-(li:License)<-[:HasLicense]-(w:Well) 
WITH l,w
OPTIONAL MATCH (l)-[:Spilled]->(s:Spill) 
return l.Name, count(distinct w), count(distinct s)  order by count(distinct w) descending

// count wells and spills for fields:
MATCH(w:Well)-[:IsInField]->(f:Field) 
WITH f, count(distinct w) as wellCount

OPTIONAL MATCH (f)-[:IsCenteredIn]->(fc:FieldCenter)<-[:IsInFieldCenter]-(s:Spill) 
return f.Name, wellCount,count(distinct s) order by wellCount descending

