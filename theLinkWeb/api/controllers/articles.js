var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");
var ehelper = require("../helpers/endpoint-helper");
var db = require('../helpers/database');
var thisNodeType = "Article";

module.exports = {
  post: newArticle,
};

// Creates an Article
function newArticle(req, res) {
  // Make sure we have all the required params
  // TODO: Make sure they can't do any XSS stuff! Or insert terrible things into the DB!
  var uuid = db.genUuid();

  var queryParams = {
    uuid: uuid,
    name: req.body.name,
    summary: req.body.summary,
    source: req.body.source,
    photourl: req.body.photourl
  };

  // Uuid, Summary, PhotoUrl, Source, Name
  var queryStr = "CREATE (a:Article { Uuid: {uuid}, Name: {name}, Summary: {summary}, Source: {source}, PhotoUrl: {photourl} }) return a";

  if (req.body.topicid) {
    queryParams.topicUuid = req.body.topicid;
    queryStr = "OPTIONAL MATCH (t:Topic) WHERE t.Uuid = {topicUuid} CREATE (a:Article { Uuid: {uuid}, Name: {name}, Summary: {summary}, Source: {source}, PhotoUrl: {photourl} }), (a)-[r:ClassifiedAsTopic]->(t) return a";
  }

  db.query(queryStr, queryParams, function (err, results) {
    if (err) res.status(500).json(err);

    //Try to link it to the appropriate card
    db.query("MATCH (t:Article) WHERE t.Uuid = {uuid} WITH t, upper(left(t.Name,1)) as sym MATCH (ln:AlphabetGroup) WHERE sym in ln.Symbols CREATE (t)-[:IsInAlphabetGroup]->(ln)", {
      uuid: uuid
    }, function (err, results) {
      if (err) res.status(500).json(err);
    });

    var response = new ehelper.response(results.records[0].get('a').properties, "Result");
    res.status(201).send(response);
  });
}