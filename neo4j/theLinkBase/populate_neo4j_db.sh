#! /bin/sh
# This should be run outside of the container.
docker exec thelink_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkBase/importQueries.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p graphPaper! "   
docker exec thelink_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkBase/generateTimeTree.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p graphPaper! "   
docker exec thelink_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkBase/generateAlphabetGroups.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p graphPaper! "
docker exec thelink_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkBase/generateLocationGroups.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p graphPaper! "


# generate help documenation
docker exec thelink_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkBase/generateHelpTree.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p graphPaper! "

# generate sample SOP
docker exec thelink_neo4j_1 sh -c "cat /var/lib/neo4j/import/theLinkBase/generateSoilSop.cql | /var/lib/neo4j/bin/cypher-shell -u neo4j -p graphPaper! " 

