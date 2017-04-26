#! /bin/sh
# Requires that the container is running and connected to the Database container
docker exec thelink_thelinkweb_1 /srv/theLink/node_modules/mocha/bin/mocha /srv/theLink/test
