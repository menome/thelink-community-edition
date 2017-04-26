var request = require('supertest');
var app = require('../server');

describe('Pivot API Endpoint', function() {

  describe('Get Pivot Info for a node', function() {
    it('Returns node\'s pivot info', function(done) {
      request(app)
        .get('/api/pivot/info/dc037ef4-4863-11e6-beb8-9e71128cae77')
        .set('Accept', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);
          if(res.body.data.length < 1)
            return done(new Error("Did not return any pivotable links!"));

          res.body.data.forEach(function(elem,idx,arr) {
            if(elem.Count < 1)
              return done(new Error("Returned a link type with no nodes!"));
            if(!elem.Label)
              return done(new Error("Returned a link type with no label!"));
          });

          done();
        });
    });
  });

  describe('Get all pivots for a node', function() {
    it('Returns all connected nodes', function(done) {
      request(app)
        .get('/api/pivot/dc037ef4-4863-11e6-beb8-9e71128cae77')
        .set('Accept', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);
          if(res.body.data.length < 1)
            return done(new Error("Did not return any nodes!"));

          res.body.data.forEach(function(elem,idx,arr) {
            if(!elem.Uuid)
              return done(new Error("Returned a node with no ID!"));
            else if(!elem.NodeType)
              return done(new Error("Returned a node with no type!"));
          });

          done();
        });
    });
  });

  describe('Get pivots of a certain type for a node', function() {
    it('Returns all connected nodes of a that type', function(done) {
      request(app)
        .get('/api/pivot/bytype/dc037ef4-4863-11e6-beb8-9e71128cae77/Topic')
        .set('Accept', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);
          if(res.body.data.length < 1)
            return done(new Error("Did not return any nodes!"));

          res.body.data.forEach(function(elem,idx,arr) {
            if(!elem.Uuid)
              return done(new Error("Returned a node with no ID!"));
            else if(elem.NodeType != 'Topic')
              return done(new Error("Returned a node that was the wrong type!"));
          });

          done();
        });
    });
  });

  describe('Get pivots of a certain relationship for a node', function() {
    it('Returns all connected nodes of a that type', function(done) {
      request(app)
        .get('/api/pivot/byrel/dc037ef4-4863-11e6-beb8-9e71128cae77/IsAuthorOf')
        .set('Accept', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);
          if(res.body.data.length < 1)
            return done(new Error("Did not return any nodes!"));

          res.body.data.forEach(function(elem,idx,arr) {
            if(!elem.Uuid)
              return done(new Error("Returned a node with no ID!"));
            else if(elem.NodeType != 'Person')
              return done(new Error("Returned a node that was the wrong type!"));
          });

          done();
        });
    });
  });

});
