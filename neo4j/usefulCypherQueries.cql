// update properties on CSV import: eg photoURL
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///csv/NodeEmployee.csv' AS line
MERGE (c:Person {
    Uuid: line.EmployeeId
   })
   ON CREATE set c.PhotoUrl= line.PhotoUrl
ON MATCH set c.PhotoUrl= line.PhotoUrl


// employees who worked on the same phase as specified employee, with percentage calculation being percentage hours are similar in value. 
MATCH (employee:Person)-[:WorkedOn]->(a:Work)-[:IsOn]->(ph:Phase)<-[:IsOn]-(b:Work)<-[:WorkedOn]-(coWorker:Person) where employee.Uuid='8e3f4a39-d462-4e0b-ad98-157dc4db1748' and a.TotalHours > 0 and b.TotalHours > 0 
WITH  ph, employee, coWorker, sum(a.TotalHours)  as employeeHours, sum(b.TotalHours) as coWorkedHours
return distinct ph, coWorker, (employeeHours/(employeeHours+coWorkedHours+.01))*100 as percent order by percent desc

// match employees who worked on the same phase and rank them by percentage hours out of the total hours for specifed employee
MATCH (employee:Person)-[:WorkedOn]->(w:Work) where employee.Uuid='8e3f4a39-d462-4e0b-ad98-157dc4db1748' and w.TotalHours > 0
WITH employee, sum(w.TotalHours) as allEmployeeHours
OPTIONAL MATCH (employee)-[:WorkedOn]->(a:Work)-[:IsOn]->(ph:Phase)<-[:IsOn]-(b:Work)<-[:WorkedOn]-(coWorker:Person) where b.TotalHours > 0
WITH distinct  ph, coWorker , toInt( (sum(b.TotalHours+.01)/(allEmployeeHours+.0001))*100 ) as percent where percent > 5 
RETURN coWorker, percent  order by percent desc

// find companies with similar addresses for companies in the same city
MATCH (company:Company {Uuid:'ac292b52-1418-43bb-b86e-b8e303a63f4e'}) 
WITH company, company.Address + ',' +company.City + ',' + company.Province + ',' + company.Country as companyAddress   
MATCH (c:Company) where c.City=company.City 

with company, companyAddress, collect(c) as companies
UNWIND companies as companyToCompare
  WITH company, companyToCompare, companyAddress
  CALL apoc.text.phoneticDelta(companyAddress, companyToCompare.Address + ',' +companyToCompare.City + ',' + companyToCompare.Province + ',' + companyToCompare.Country ) yield phonetic1, phonetic2, delta
  return company, companyToCompare, delta order by delta descending

// find companies with similar names in the same city
MATCH (company:Company {Uuid:'ac292b52-1418-43bb-b86e-b8e303a63f4e'}) 
WITH company, company.Name  as companyAddress   
MATCH (c:Company) where c.Name starts with 'S' and c.City = company.City

with company, companyAddress, collect(c) as companies
UNWIND companies as companyToCompare
  WITH company, companyToCompare, companyAddress
  CALL apoc.text.phoneticDelta(companyAddress,companyToCompare.Name  ) yield phonetic1, phonetic2, delta
  return company, companyToCompare, delta order by delta descending    


// find company addresses 
MATCH (c:Company {Uuid:{NodeId}}) WITH c 
              CALL apoc.spatial.geocodeOnce(c.Address + "," + c.City + "," + c.Province + "," + c.Country) YIELD location 
              RETURN c, location.latitude + "," + location.longitude as Location

// find people who have worked with these people where their name is sort of like the one specified
CALL apoc.index.search("Names", ' kim') YIELD node as employee
MATCH (employee)-[:WorkedOn]->(w:Work) where  w.TotalHours > 0 
 WITH employee, sum(w.TotalHours) as allEmployeeHours 
 OPTIONAL MATCH (employee)-[:WorkedOn]->(a:Work)-[:IsOn]->(ph:Phase)<-[:IsOn]-(b:Work)<-[:WorkedOn]-(coWorker:Person) where b.TotalHours > 0 
              WITH  distinct ph, coWorker, toInt( (sum(b.TotalHours+.01)/(allEmployeeHours+.0001))*100 ) as PercentWorkedWith, employee where PercentWorkedWith > 5 
              RETURN distinct coWorker, employee.Name as PersonName, PercentWorkedWith  order by PercentWorkedWith desc limit 20

// APOC geocoding query
match (p:Project)-[]-(c:Company)-[]->(a:City {Name:'Vancouver'}) 
WITH c,p limit 25
CALL apoc.spatial.geocodeOnce(c.Address + ',' + c.City + ',' + c.Province + ',' + c.Country) YIELD location
RETURN p, location.latitude, location.longitude

// set lat long on nodes
match (p:Project)-[]-(c:Company)-[]->(a:City {Name:'Vancouver'}) 
WITH c,p limit 25
CALL apoc.spatial.geocodeOnce(c.Address + ',' + c.City + ',' + c.Province + ',' + c.Country) YIELD location
WITH c, location
SET c.Latitude=location.latitude, c.Longitude= location.longitude
RETURN c, location

// return nodes distance from specified point:
WITH point({latitude: 49.21166952010481, 
                  longitude: -124.46200561523438}) AS mapcenter 
                  MATCH (a:Company) 
				WHERE exists(a.Latitude) AND exists(a.Longitude)
                  WITH a, distance (point({latitude: a.Latitude, longitude: a.Longitude}), mapcenter) as distance 
                  WHERE distance < 500000
				  RETURN a
                  order by distance LIMIT 100

// geocode any address with no latitude on it
// set lat long on nodes
match (c:Company) where c.City = 'Vancouver' and not exists (c.Latitude) and c.Address <> '' 
WITH c, c.Address + ' ' + c.City + ' ' + c.Province + ' ' + c.Country as address  
CALL apoc.spatial.geocodeOnce(address) YIELD location
WITH c, location, address
SET c.Latitude=location.latitude, c.Longitude= location.longitude

RETURN c, location, address


// set lat long on site nodes
match (c:Site)  where not exists (c.Latitude) 
WITH c, c.Name as  address  limit 100
CALL apoc.spatial.geocodeOnce(address) YIELD location
WITH c, location, address
SET c.Latitude=location.latitude, c.Longitude= location.longitude

RETURN c, location, address

// encode site code for spectified city 
match (s:Site)<-[IsAt]-(p:Project)-[IsIn]->(c:City) where c.Name = 'CALGARY' and not exists (s.Latitude) 
WITH s, s.Name as address  
CALL apoc.spatial.geocodeOnce(address) YIELD location
WITH s, location, address
SET s.Latitude=location.latitude, s.Longitude= location.longitude

RETURN s, location, address


// generate APOC Lucene full text indexes
CALL apoc.index.addAllNodes('Names',{ Company: ["Name"], Person: ["Name"], Contact: ["Name"], Project: ["Name"], Description: ["Name"], Article:["Name","Summary"],Task:["Name","Summary"], Trail["Name", "Summary"] });


// generate APOC Lucene full text indexes
CALL apoc.index.addAllNodes('Help',{ Help:["Name","Summary","MarkdownContent"] });

// Basic return linked Trail list:
MATCH(t:Trail {Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01'})-[r:LinksTo* {Uuid: 'db4bfe80-d7ad-11e6-bf26-cec0c932ce01'}]-(h:Help) return h

// count of expertise occurrence by market sector
MATCH (expertise:Expertise)<-[:HasExpertise]-(p:Person)-[:WorkedOn]->(w:Work)-[:IsOn]->(ph:Phase)-[:BelongsTo]->(project:Project)-[:PartOf]->(marketSector:MarketSector) with expertise,marketSector RETURN marketSector, count(expertise) as ExpertiseForMarketSector

// count of people who have worked in a market sector:
MATCH (person:Person)-[:WorkedOn]->(w:Work)-[:IsOn]->(ph:Phase)-[:BelongsTo]->(project:Project)-[:PartOf]->(marketSector:MarketSector) with person,marketSector RETURN marketSector, count(person) as PeopleWorkingInMarketSector

// Find second degree network for person excluding specified relationships
MATCH network = (p:Person {Name:"Jeff DiBattista"})-[g*..2]-(b) WHERE NONE (r in g where type(r)='IsInAlphabetGroup' OR type(r)='HasDay' or type(r)='StartedOn' or type(r)='DescriptionIsFor')
RETURN network


// things that two people have relationships in common in 4 degrees:
MATCH (p1:Person {Name:"tim boser"})
MATCH (p2:Person {Name:"Ronnie Dungor"})
MATCH path = (p1)-[g*..4]-(p2)
WHERE NONE (r in g where type(r)='IsInAlphabetGroup' OR type(r)='HasDay' or type(r)='StartedOn' or type(r)='DescriptionIsFor' or type(r)='IsIn')
RETURN path

// cleaner method - 
WITH ['IsInAlphabetGroup', 'HasDay', 'StartedOn', 'DescriptionIsFor', 'IsIn', 'PartOf'] as excluded
MATCH (p1:Person {Name:"Bob Smith"})
MATCH (p2:Person {Name:"Ted Roberts"})
MATCH path = (p1)-[g*..4]-(p2)
WHERE NONE (r in g where type(r) in excluded)
RETURN path

// Extract Articles to file
WITH ['IsInAlphabetGroup', 'HasDay','PublishedOn', 'StartedOn', 'DescriptionIsFor', 'IsIn', 'PartOf'] as excluded
MATCH (a:Article)-[g*..1]-(p) 
WHERE NONE (r in g where type(r) in excluded)
WITH collect(a) + collect(p) as n, g
CALL apoc.export.cypherData(n, g, '/var/lib/neo4j/import/articles.cql', {batchSize:1000})
YIELD nodes, relationships, properties, time
RETURN nodes, relationships, properties, time