###############
# Backup
###############
 
# Stopping Server
docker exec thelink_neo4j_1 /var/lib/neo4j/bin/neo4j stop
 
# Zipping all files of $NEO4J_HOME/data/
cd /data 
zip -r backup.zip ./*
 
# Starting Server again
docker exec thelink_neo4j_1 /var/lib/neo4j/bin/neo4j start

