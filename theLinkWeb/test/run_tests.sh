#! /bin/sh

echo "Preprocessing WebService"
grunt buildDev

echo "Running Tests"
/srv/theLink/node_modules/mocha/bin/mocha /srv/theLink/test
