
###############
# Restore
###############
 
# Stopping Server
$ launchctl stop org.neo4j.server.7474
 
# Unzipping backup archive
$ cd $NEO4J_HOME
$ unzip backup.zip
 
# Starting Server again
$ launchctl start org.neo4j.server.7474
