#! /bin/sh
#
# Runs the unit tests in their own container, as should happen with automated repo testing.


docker-compose -f docker-compose.test.yml up --abort-on-container-exit
