#! /bin/sh
# This should be run outside of the container.
docker exec thelinkcommunity_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkHNI/setupNeo4j.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p un1Ball! "   
docker exec thelinkcommunity_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkHNI/ImportWellLocations.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p un1Ball! "   
docker exec thelinkcommunity_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkHNI/generateTimeTree.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p un1Ball! "   
docker exec thelinkcommunity_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkHNI/generateAlphabetGroups.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p un1Ball! "
docker exec thelinkcommunity_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkHNI/generateLocationGroups.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p un1Ball! "


# generate help documenation
docker exec thelinkcommunity_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkHNI/generateHelpTree.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p un1Ball! "

# generate sample SOP
docker exec thelinkcommunity_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkHNI/generateSoilSop.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p un1Ball! " 

