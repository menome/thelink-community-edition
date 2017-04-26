/*
 * smoke-test.js
 * Copyright (C) 2017 konrad <konrad@serenity>
 *
 * Distributed under terms of the MIT license.
 */

var request = require('supertest');
var app = require('../server');
var smokeEndpoints = [
  ['/', 302],
  ['/app.html', 302]
];

// Generates callback functions for user with supertest..
// idk why this was hard.
var callbackFunc = function(idx) {
  return function(done) {
    request(app)
      .get(smokeEndpoints[idx][0])
      .expect(smokeEndpoints[idx][1], done);
  };
};

describe('Smoke Tests', function() {
  for(var i=0;i<smokeEndpoints.length;i++) {
    it('Test: \'' + smokeEndpoints[i][0] + '\' expect ' + smokeEndpoints[i][1], callbackFunc(i));
  }
});
