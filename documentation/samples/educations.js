var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");
var ehelper = require("../helpers/endpoint-helper");
var db = require('../helpers/database');
var thisNodeType = "Education";

module.exports = {
  get: educations,
  getExtended: getExtended,
};

//Gets educations
function educations(req, res) {
  var grouping = req.swagger.params.group.value;
  var date = fmt.dateStrToDate(req.swagger.params.date.value);
  var matchClauses = [];
  var whereClauses = [];
  var queryParams = {};
  var queryStr;

  if(req.swagger.params.name.value) {
    whereClauses.push("node.Name =~ {Name}");
    queryParams.Name = db.searchRegex(req.swagger.params.name.value);
  }

  var options = {
    nodeType: thisNodeType,
    queryParams: queryParams,
    groupBy: ehelper.groupTypes.indexOf(grouping) != -1 ? grouping : 'none',
    dateRelationship: sconf.dateRels[thisNodeType],
    date: date,
    firstLetter: req.swagger.params.firstletter.value ? req.swagger.params.firstletter.value.toUpperCase() : null,
    matchClauses: matchClauses,
    whereClauses: whereClauses
  };

  var callbackFunc = function(err, results, resultsType) {
    if(err) res.status(500).json(err);
    var response = new ehelper.response(results, resultsType);
    res.json(response);
  };

  db.nodeSearch(options, callbackFunc);
}

//Gets extended attributes for a education.
function getExtended(req, res) {
  var queryParams = {Uuid: req.swagger.params.id.value.toLowerCase()};
  var queryStr = "MATCH (n:Document {Uuid: {Uuid}})-[r:"+sconf.extendedProperties[thisNodeType].join('|')+"]-(s) RETURN type(r) as rel,s.Name as name";

  db.query(queryStr, queryParams, function(err, result) {
    if(err !== null)
      res.status(500).json(err);

    resultObj = {};

    for (i=0;i<result.records.length;i++)
      resultObj[result.records[i].get('rel')] = result.records[i].get('name');

    var response = new ehelper.response(resultObj);
    res.json(response);
  });
}
