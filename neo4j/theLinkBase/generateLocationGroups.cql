// Very simple CQL to generate some location nodes. 
// this will read the locations from the exisiting project nodes, and then auto-generate city/region/country nodes
// and then link them up 

MATCH (p:Project) WITH DISTINCT p, p.City as city, p.Province as province, p.Country as country
MERGE (p)-[:IsIn]->(cit:City {Name: city})-[:IsIn]->(reg:Region {Name: province})-[:IsIn]->(cou:Country {Name: country});
