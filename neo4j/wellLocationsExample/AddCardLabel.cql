

match(n:Agent) set n :Card;
match (n:Edct) set n :Card;


CALL apoc.periodic.iterate(
"MATCH (p:Facility) RETURN p",
"WITH {p} as p SET p:Card", {batchSize:10000, parallel:true});

CALL apoc.periodic.iterate(
"MATCH (p:Field) RETURN p",
"WITH {p} as p SET p:Card", {batchSize:10000, parallel:true});

CALL apoc.periodic.iterate(
"MATCH (p:License) RETURN p",
"WITH {p} as p SET p:Card", {batchSize:10000, parallel:true});

CALL apoc.periodic.iterate(
"MATCH (p:Operator) RETURN p",
"WITH {p} as p SET p:Card", {batchSize:10000, parallel:true});

CALL apoc.periodic.iterate(
"MATCH (p:Pool) RETURN p",
"WITH {p} as p SET p:Card", {batchSize:10000, parallel:true});

CALL apoc.periodic.iterate(
"MATCH (p:Well) RETURN p",
"WITH {p} as p SET p:Card", {batchSize:10000, parallel:true});

CALL apoc.periodic.iterate(
"MATCH (p:Spill) RETURN p",
"WITH {p} as p SET p:Card", {batchSize:10000, parallel:true});

// would a constraint be better? 
CREATE INDEX ON :Card(Uuid);
CREATE INDEX ON :Card(Name);