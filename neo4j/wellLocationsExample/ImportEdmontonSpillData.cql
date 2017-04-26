// Get Spill data from Edmonton Open Data Site example of direct data pull from JSON service
// illustration of graph refactoring 

// setup constraints
CREATE CONSTRAINT ON (s:Spill) ASSERT s.Code IS UNIQUE;
CREATE CONSTRAINT ON (s:SubstanceReleased) ASSERT s.Code IS UNIQUE;

// setup indexes
CREATE INDEX ON :Spill(Latitude);
CREATE INDEX ON :Spill(Longitude);
CREATE INDEX ON :Spill(Uuid);
CREATE INDEX ON :FieldCenter(Name);
CREATE INDEX ON :FieldCenter(Uuid);


// BENEFITS: Graph and sub-categories auto-resolve : no duplicates are created
// Graph can be extended and added to dynamically - either in batch, or in continous updates
// Duplicates can be detected, matched and reduced on the fly
// https://soda.demo.socrata.com/resource/earthquakes.json?$limit=1000&$offset=number&$order=:id

// Call below is designed to 
WITH 'yUEgWneqrRgNzGUIRQb7yW90M' as token,  1000 as pagesTotal
WITH token, RANGE(1,pagesTotal,1000) as fromNumber, "https://data.edmonton.ca/resource/xir8-nx6p.json?$limit=1000&$offset=number&$order=:id" as baseUrl

// loop through results by range step (500 records is max)
UNWIND fromNumber as from
WITH token, from, REPLACE(baseUrl,'number',toString(from)) as Url

CALL apoc.util.sleep(5)

CALL apoc.load.jsonParams(Url,
{`X-App-Token`:token}, null
) 
yield value as data 

// spill:
WITH data as record //limit 5 
CALL apoc.create.uuids(1) YIELD uuid as Uuid
WITH record, Uuid, record.location_1 as locations 

MERGE (s:Spill:Card {Code: record.incident_number}) 
ON CREATE 
set 
s.Uuid = Uuid,
s.Name =  record.incident_number,
s.IndicentId=record.incident_number, 
s.AreaAffected=record.area_affected,
s.EnvironmentAffected=record.environment_affected,
s.PublicAffected = record.PublicAffected,
s.WildlifeLivestockAffected = record.wildlife_livestock_affected,
s.LSD = record.location,
s.FailureType = record.failure_type,
s.FatalityCount = toInt(record.fatality_count),
s.InjuryCount = toInt(record.injury_count),
s.IncidentCompleteDate = replace(left(record.incident_complete_date,10), "-",""),
s.IncidentDate = replace(left(record.incident_date,10), "-",""),
s.IndicentNotificationCate =  replace(left(record.incident_notification_date,10), "-",""),
s.ReleaseCleanupDate = replace(left(record.release_cleanup_date,10), "-",""),
s.ReleaseOffsite = record.release_offsite,
s.SensitiveArea = record.sensitive_area,
s.Source = record.source,
s.StrikeArea = record.strike_area,
s.Latitude = toFloat(locations.coordinates[1]),
s.Longitude = toFloat(locations.coordinates[0]),
s.IncidentType = record.incident_type
ON MATCH 
set 
s.Uuid = Uuid,
s.Name =  record.incident_number,
s.IndicentId=record.incident_number, 
s.AreaAffected=record.area_affected,
s.EnvironmentAffected=record.environment_affected,
s.PublicAffected = record.PublicAffected,
s.WildlifeLivestockAffected = record.wildlife_livestock_affected,
s.LSD = record.location,
s.FailureType = record.failure_type,
s.FatalityCount = toInt(record.fatality_count),
s.InjuryCount = toInt(record.injury_count),
s.IncidentCompleteDate = replace(left(record.incident_complete_date,10), "-",""),
s.IncidentDate = replace(left(record.incident_date,10), "-",""),
s.IndicentNotificationCate =  replace(left(record.incident_notification_date,10), "-",""),
s.ReleaseCleanupDate = replace(left(record.release_cleanup_date,10), "-",""),
s.ReleaseOffsite = record.release_offsite,
s.SensitiveArea = record.sensitive_area,
s.Source = record.source,
s.StrikeArea = record.strike_area,
s.Latitude = toFloat(locations.coordinates[1]),
s.Longitude = toFloat(locations.coordinates[0]),
s.IncidentType = record.incident_type

// Substance Released Node:
WITH s, record
where record.substance_released <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid
MERGE (sr:SubstanceReleased:Card {Code: record.substance_released})
ON CREATE
set
sr.Uuid = Uuid,
sr.Name = record.substance_released,
sr.VolumeRecovered = toFloat(record.volume_recovered),
sr.VolumeReleased = toFloat(record.volume_released),
sr.Units = record.volume_units
ON MATCH
set
sr.Uuid = Uuid,
sr.Name = record.substance_released,
sr.VolumeRecovered = toFloat(record.volume_recovered),
sr.VolumeReleased = toFloat(record.volume_released),
sr.Units = record.volume_units

WITH sr, s, record
MERGE (s)-[:ReleasedSubstance]->(sr)

// merge field center
WITH record, s, upper(record.field_centre) as fieldCenter
where record.field_centre <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid
MERGE (f:Field:Card {FieldCenter: fieldCenter})
ON CREATE
set
f.Uuid = Uuid,
f.Name = record.field_centre

MERGE (s)-[:IsInField]->(f)

// Licensee 
WITH record, s
where record.licensee_id <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid
MERGE (l:Licensee {Name: record.licensee_name})
ON CREATE
set
l.Uuid = Uuid,
l.Code = record.licensee_code

MERGE (l)-[:Spilled]->(s);


// Spill FailureType - refactor property to Node
// lets say we want to convert a property to a node:
MATCH (s:Spill) 
where s.FailureType <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid
MERGE (f:FailureType:Card {Name:s.FailureType})
ON CREATE
set 
f.Uuid = Uuid

MERGE (s)-[:HasFailureType]->(f)
REMOVE s.FailureType;

// TOO MANY IsInField->Spill links
// Refactor Field Center out of Fields
MATCH (f:Field) 
where f.FieldCenter <> ''
CALL apoc.create.uuids(1) YIELD uuid as Uuid
MERGE (fc:FieldCenter:Card {Name:f.FieldCenter})
ON CREATE
set 
f.Uuid = Uuid

MERGE (f)-[:IsCenteredIn]->(fc)
REMOVE f.FieldCenter;

// remap relationship with spill: 
MATCH (s:Spill)-[d:IsInField]->(f:Field)
MATCH (fc:FieldCenter) where fc.Name=f.Name 

MERGE (s)-[:IsInFieldCenter]->(fc);

// now delete the spill-Field relationship
MATCH (s:Spill)-[d:IsInField]->(f:Field)
DELETE d
