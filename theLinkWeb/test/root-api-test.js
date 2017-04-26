var request = require('supertest');
var app = require('../server');

describe('Basic Server Tests', function() {
  describe('Responds with correct CORS headers', function() {
    it('Correct CORS headers found', function(done) {
      request(app)
        .get('/')
        .expect('Access-Control-Allow-Origin', /.*/) //We just want this header present.
        .expect('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        .expect('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization')
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect(200, done);
    });
  });

  describe('Get Service Health', function() {
    it('Respond with meaningful status message', function(done) {
      request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);

          if(res.text != "This is a healthy theLink API service!")
            return done(new Error("Did not respond with status message. Got: " + res.body));

          done();
        });
    });
  });

});

