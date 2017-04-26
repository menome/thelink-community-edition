var express = require("express");
var db = require('../helpers/database');
var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");
var ehelper = require("../helpers/endpoint-helper");
var conf = require('../../config/conf');

module.exports = function (nodeType) {
  var nodeRouter = express.Router();
  nodeRouter.nodeType = nodeType;

  //Basic Query
  nodeRouter.get('/', function (req, res) {
    var grouping = req.query.group;
    var date = fmt.dateStrToDate(req.query.date);
    var groupCutoff = req.query.groupcutoff ? req.query.groupcutoff : conf.defaultGroupCutoff;
    var matchClauses = [];
    var whereClauses = [];
    var queryParams = {};
    var queryStr;
    var queryFunc;

    var options = {
      nodeType: nodeRouter.nodeType,
      queryParams: queryParams,
      groupBy: ehelper.groupTypes.indexOf(grouping) != -1 ? grouping : 'none',
      groupCutoff: groupCutoff,
      date: date,
      firstLetter: req.query.firstletter ? req.query.firstletter.toUpperCase() : null,
      matchClauses: matchClauses,
      whereClauses: whereClauses,
      dateRelationship: sconf.dateRels[nodeRouter.nodeType],
      //extended: req.swagger.params.extended.value ? extendedProperties : []
    };

    var callbackFunc = function (err, results, resultsType) {
      if (err) res.status(500).json(err);
      var response = new ehelper.response(results, resultsType);
      res.json(response);
    };

    db.nodeSearch(options, callbackFunc);
  });

  //Specific Query
  nodeRouter.get('/:id', function (req, res) {
    var queryStr = "MATCH (a:" + nodeRouter.nodeType + ") WHERE a.Uuid = {id} RETURN a.Name as Name, a.Uuid as Uuid, a.FirstName as FirstName, a.LastName as LastName";
    var params = {
      id: req.params.id
    };
    db.query(queryStr, params, function (err, result) {
      var name = result.records[0].get('Name');
      if (!name) name = result.records[0].get('FirstName') + ' ' +
        result.records[0].get('LastName');

      var response = new ehelper.response({
        Name: name,
        Uuid: result.records[0].get("Uuid"),
        NodeType: nodeRouter.nodeType
      }, "Result");

      res.send(response);
    });
  });

  return nodeRouter;
};