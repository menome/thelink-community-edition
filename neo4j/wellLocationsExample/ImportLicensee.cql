

// indexes
CREATE INDEX ON :Licensee(Address);

// Well head identifier
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///theLinkHNI/LicenseeAgent_Codes.csv' AS line 
with line

// generate guid if we need to create
CALL apoc.create.uuids(1) YIELD uuid as Uuid
WITH Uuid, line

MERGE (l:Licensee {  Name: line.Code   })
ON CREATE set
l.Uuid= Uuid,
l.Code = line.Code,
l.Name = line.Licensee,
l.Abbreviation = line.Abbreviation,
l.Address = line.Address
ON MATCH set
l.Code = line.Code,
l.Name = line.Licensee,
l.Abbreviation = line.Abbreviation,
l.Address = line.Address;


// geocode addresses on licensees
// geocode any address with no latitude on it
// set lat long on nodes
match (l:Licensee) where not exists (l.Latitude) and l.Address <> '' 
WITH l 
CALL apoc.spatial.geocodeOnce(l.Address) YIELD location
WITH l, location
SET l.Latitude=location.latitude, l.Longitude= location.longitude

RETURN count(*)


// this call does a periodic transaction commit using batches of 10000, so is much more memory efficient
call apoc.periodic.commit("
MATCH (l:Licensee) where exists(l.Address) and length(l.Address) > 5 and (not l.Address contains 'not found') 
WITH l limit {limit}
match (l) where not exists (l.Latitude) and l.Address <> '' 

CALL apoc.spatial.geocodeOnce(l.Address) YIELD location
WITH l, location
SET l.Latitude=location.latitude, l.Longitude= location.longitude

RETURN count(*)

",{limit:500})
