var request = require('supertest');
var app = require('../server');
var token = "";

describe('User Authorization Tests', function() {
  describe('Unauthorized Request on resource that requires Authorization', function() {
    it('Respond with 401 Unauthorized', function(done) {
      request(app)
        .get('/auth')
        .set('Accept', 'application/json')
        .expect(401, done)
    });
  });

  describe('Unauthorized request on a resource that does not require Auth', function() {
    it('Respond with 200 OK', function(done) {
      request(app)
        .get('/')
        .expect(200, done)
    });
  });

  describe('Authorized Request for user details', function() {
    it('Respond with 200 OK and JSON', function(done) {
      request(app)
        .get('/auth')
        .set('Accept', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200, done)
    });
  });

  describe('New User Registration', function() {
    describe('Register with incomplete data.', function() {
      it('Respond with 400 Bad Request', function(done) {
        request(app)
          .post('/auth')
          .set('Accept', 'application/json')
          .expect(400, done)
      });
    });

    describe('Register an already registered email address', function() {
      it('Respond with 409 Conflict', function(done) {
        request(app)
          .post('/auth')
          .set('Accept', 'application/json')
          .send('email=konrad.aust@gmail.com')
          .send('password=somepassword')
          .expect(409, done)
      });
    });

    describe('Register a new user', function() {
      it('Create New User', function(done) {
        request(app)
          .post('/auth')
          .set('Accept', 'application/json')
          .send('email=newuser@newdomain.com')
          .send('password=somepassword')
          .expect(201, done)
      });

      it('Verify info for new user', function(done) {
        request(app)
          .get('/auth')
          .set('Accept', 'application/json')
          .set('Authorization', 'Basic bmV3dXNlckBuZXdkb21haW4uY29tOnNvbWVwYXNzd29yZA==')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if(err) return done(err);

            if(res.body.Email != 'newuser@newdomain.com')
              return done(new Error("Returned email did not match."));

            if(res.body.EmailVerified != false)
              return done(new Error("Email for new user is verified! It should not be."));

            done();
          });
      });

      it('Get auth token for new user.', function(done) {
        request(app)
          .get('/auth/gettoken')
          .set('Accept', 'application/json')
          .set('Authorization', 'Basic bmV3dXNlckBuZXdkb21haW4uY29tOnNvbWVwYXNzd29yZA==')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if(err) return done(err);

            if(!res.body.token)
              return done(new Error("No token was returned."));

            token = res.body.token;

            done();
          });
      });

      it('Use auth token for new user instead of BASIC auth.', function(done) {
        request(app)
          .get('/auth')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if(err) return done(err);

            if(res.body.Email != 'newuser@newdomain.com')
              return done(new Error("Returned email did not match."));

            if(res.body.EmailVerified != false)
              return done(new Error("Email for new user is verified! It should not be."));

            done();
          });
      });

      it('Delete New User', function(done) {
        request(app)
          .delete('/auth')
          .set('Accept', 'application/json')
          .set('Authorization', 'Basic bmV3dXNlckBuZXdkb21haW4uY29tOnNvbWVwYXNzd29yZA==')
          .expect(200, done)
      });
    });

  });


});

