var db = require('../helpers/database');
var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");

module.exports = {
  response: responseConstructor,
  getNodesByRelationship: getNodesByRelationship,
  groupTypes: ['alphabet', 'date', 'location'], // The valid ways of grouping returned nodes
  locationParameterWrapper: locationParameterWrapper, // Wraps location params into an object
};

//Creates a response.
function responseConstructor(data, type, nodeType) {
  this.data = data;
  this.type = typeof type !== 'undefined' ? type : "ResultSet";
  if (typeof nodeType !== 'undefined') this.nodeType = nodeType;
}

//Wraps swagger location parameters (city, country, region) into a single object.
function locationParameterWrapper(params) {
  if (!params.country.value && !params.region.value && !params.city.value) return null;

  return {
    country: params.country.value ? params.country.value : null,
    region: params.region.value ? params.region.value : null,
    city: params.city.value ? params.city.value : null,
  };
}

function getNodesByRelationship(req, res, nodeType, relName, relNodeId) {
  //var queryParams = {Uuid: req.swagger.params.id.value.toLowerCase()};
  var queryParams = {
    Uuid: relNodeId.toLowerCase()
  };
  var date = req.swagger.params.date ? fmt.dateStrToDate(req.swagger.params.date.value) : null;
  var matchClauses = ["(node)-[:" + relName + "]->(o)"];
  var whereClauses = ["o.Uuid = {Uuid}"];

  var options = {
    nodeType: nodeType,
    queryParams: queryParams,
    groupBy: module.exports.groupTypes.indexOf(req.swagger.params.group.value) != -1 ? grouping : 'none',
    firstLetter: req.swagger.params.firstletter.value ? req.swagger.params.firstletter.value.toUpperCase() : null,
    matchClauses: matchClauses,
    whereClauses: whereClauses,
    dateRelationship: sconf.dateRels[nodeType],
    date: date,
    extended: req.swagger.params.extended && req.swagger.params.extended.value &&
      sconf.extendedProperties[nodeType] ? sconf.extendedProperties[nodeType] : [],
  };

  var callbackFunc = function (err, results, resultsType) {
    if (err) res.status(500).json(err);

    var response = new responseConstructor(results, resultsType);
    res.json(response);
  };

  db.nodeSearch(options, callbackFunc);
}