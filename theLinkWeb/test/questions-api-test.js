var request = require('supertest');
var app = require('../server');

describe('Questions API Endpoint', function() {

  describe('Get All Questions', function() {
    it('Returns a list of questions', function(done) {
      request(app)
        .get('/api/questions')
        .set('Accept', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);
          if(res.body.data.length < 1)
            return done(new Error("Did not return any questions!"));

          for(var k in res.body.data) {
            var obj = res.body.data[k];
            if(!obj.FriendlyName || !obj.NodeType || !obj.Name)
              return done (new Error("Question did not have all required info!"));
          }

          done();
        });
    });
  });

  describe('Get Questions For NodeType', function() {
    it('Returns a list of questions for that node type.', function(done) {
      request(app)
        .get('/api/questions?nodetype=person')
        .set('Accept', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);
          if(res.body.data.length < 1)
            return done(new Error("Did not return any questions!"));

          for(var k in res.body.data) {
            var obj = res.body.data[k];
            if(!obj.FriendlyName || !obj.NodeType || !obj.Name)
              return done (new Error("Question did not have all required info!"));
            if(obj.NodeType != 'Person')
              return done (new Error("Returned a question that was not for the node type!"));

          }

          done();
        });
    });
  });

  describe('Ask a question of a node', function() {
    it('Returns nodes that answer the question', function(done) {
      request(app)
        .get('/api/questions/ask') //Konrad's UUID
        .query({ id: '8908ff76-42b9-11e6-beb8-9e71128cae77',
                 questionstr: 'pmsWorkedWith'})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic a29ucmFkLmF1c3RAZ21haWwuY29tOmhlbGxv')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);
          if(res.body.data.length < 1)
            return done(new Error("Did not return any results!"));

          var foundMike = false;

          for(var k in res.body.data) {
            var obj = res.body.data[k];
            if(obj.NodeType != 'Person')
              return done (new Error("Returned an answer that was not the correct type!"));

            if(obj.Email === 'mmorley@menome.com') foundMike = true;
          }

          if(!foundMike) return done(new Error("Failed to find one of the known results!"));

          done();
        });
    });
  });
});

