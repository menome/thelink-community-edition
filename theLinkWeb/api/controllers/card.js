/*
 * content.js
 * Copyright (C) 2017 Menome Technologies Inc
 *
 * A generic endpoint for getting any and all content cards from theLink.
 */

var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");
var ehelper = require("../helpers/endpoint-helper");
var db = require('../helpers/database');
var stat = require("../helpers/stat");

module.exports = {
  get: get,
  post: post,
  del: del,
  options: options,
};

function get(req, res) {
  var thisNodeType = req.swagger.params.nodeType.value;
  if (sconf.nodeTypes.indexOf(thisNodeType) === -1)
    return res.status(400).json({
      message: "Node Type: " + thisNodeType + " not found.",
      type: 'Message'
    });

  // The single searchparams query parameters.
  var queryVals = fmt.parseSearchParams(req.swagger.params.query.value);

  var grouping = req.swagger.params.group.value;
  var date = fmt.dateStrToDate(req.swagger.params.date.value);
  var matchClauses = [];
  var whereClauses = [];
  var queryParams = {};

  // If we're querying by relationship. Eg. "Find people by office." byreltype = "LocatedInOffice", byrelnode = "Office"
  if (req.swagger.params.byreltype.value || req.swagger.params.byrelnode.value) {
    if (req.swagger.params.byreltype.value && req.swagger.params.byrelnode.value)
      return ehelper.getNodesByRelationship(req, res, thisNodeType, req.swagger.params.byreltype.value, req.swagger.params.byrelnode.value);
    else
      return res.status(400).json({
        message: "Please specify both 'byreltype' and 'byrelnode' parameters.",
        type: 'Message'
      });
  }

  // Handle our search parameters.
  for (var paramName in sconf.searchParams[thisNodeType]) {
    //var param = req.swagger.params[paramName].value;
    //if(!param) param = queryVals[paramName]; //If that fails, try the one parsed from query
    var param = queryVals[paramName]; //If that fails, try the one parsed from query

    if (param) {
      if (sconf.searchParams[thisNodeType][paramName].matchClause)
        matchClauses.push(sconf.searchParams[thisNodeType][paramName].matchClause);

      if (sconf.searchParams[thisNodeType][paramName].whereClause)
        whereClauses.push(sconf.searchParams[thisNodeType][paramName].whereClause);

      queryParams[paramName] = db.searchRegex(param);
    }
  }

  // Options for searching the DB.
  var options = {
    nodeType: thisNodeType,
    queryParams: queryParams,
    groupBy: ehelper.groupTypes.indexOf(grouping) != -1 ? grouping : 'none',
    dateRelationship: sconf.dateRels[thisNodeType],
    date: date,
    firstLetter: req.swagger.params.firstletter.value ? req.swagger.params.firstletter.value.toUpperCase() : null,
    matchClauses: matchClauses,
    whereClauses: whereClauses,
    extended: req.swagger.params.extended.value ? sconf.extendedProperties[thisNodeType] : []
  };

  var callbackFunc = function (err, results, resultsType) {
    if (err) res.status(500).json(err);

    var response = new ehelper.response(results, resultsType, thisNodeType);
    res.json(response);
  };

  // Log it up
  stat.logEvent(
    req.user.Email + ": search for " + thisNodeType,
    "With Params: " + req.swagger.params.query.value, {
      tags: ["username:" + req.user.Email]
    }
  );

  db.nodeSearch(options, callbackFunc);
}

//Create a node
function post(req, res) {
  // Make sure the nodetype is on our whitelist. This prevents CQL injection.
  var thisNodeType = req.body.NodeType;
  if (sconf.nodeTypes.indexOf(thisNodeType) === -1)
    return res.status(400).json({
      message: "Node Type: " + thisNodeType + " not found.",
      type: 'Message'
    });

  // Validate our other body params. Swagger doesn't seem to do this for us sadly.
  if (typeof (req.body.Properties) !== 'object' || typeof (req.body.Name) !== 'string')
    return res.status(400).json({
      message: "Please include NodeType, Name, and Properties as properties.",
      type: 'Message'
    });

  if (req.body.Connections && Array.isArray(req.body.Connections.isArray))
    return res.status(400).json({
      message: "Connections must be an array.",
      type: 'Message'
    });

  // Set UUID and Name manually, as these are required.
  var props = req.body.Properties;
  props.Uuid = db.genUuid();
  props.Name = req.body.Name;

  var queryStr = "CREATE (a:" + thisNodeType + ":Card {props}) return a";

  // We're firing multiple queries. Only return to the user when we've completed all of them.
  var queryCount = 1;
  var retObj = {};
  var retFunc = function (err) {
    if (err) res.status(500).send(err);

    queryCount--;
    if (queryCount === 0)
      res.status(201).send(retObj);
  };

  // Make our node creation query.
  db.query(queryStr, {
    props: props
  }, function (err, results) {
    if (err) res.status(500).send(err);

    // Try to link it to the appropriate alphabet group
    queryCount++;
    db.query("MATCH (t:" + thisNodeType + ") WHERE t.Uuid = {uuid} WITH t, upper(left(t.Name,1)) as sym MATCH (ln:AlphabetGroup) WHERE sym in ln.Symbols CREATE (t)-[:IsInAlphabetGroup]->(ln)", {
      uuid: props.Uuid
    }, retFunc);

    // For each connection, we fire a query.
    req.body.Connections.forEach(function (connection) {
      var isForward = (connection.Direction !== 'reverse');
      var relName = connection.RelName.replace(/\W/g, ''); // Strip all non-alphanumeric characters from relationship names. Prevent code injection.
      var relStr = "MATCH (n:" + thisNodeType + " {Uuid: {uuid}}), (t {Uuid: {targetUuid}}) CREATE (n)" + (isForward ? "" : "<") + "-[:" + relName + "]-" + (isForward ? ">" : "") + "(t)";

      queryCount++;
      db.query(relStr, {
        uuid: props.Uuid,
        targetUuid: connection.RelNode
      }, retFunc);
    });

    // Log it up
    stat.logEvent(
      req.user.Email + ": created " + thisNodeType,
      "With Properties: " + props, {
        tags: ["username:" + req.user.Email]
      }
    );

    retObj = new ehelper.response(results.records[0].get('a').properties, "Result");
    retFunc(err);
  });
}

//Delete a node
function del(req, res) {
  var queryStr = "MATCH (a) OPTIONAL MATCH (a)-[r]->() WITH r, a WHERE a.Uuid = {Uuid} DELETE a, r";
  var queryParams = {
    Uuid: req.swagger.params.id.value.toLowerCase()
  };

  db.query(queryStr, queryParams, function (err, results) {
    if (err !== null) res.status(500).json(err);

    if (results.summary.updateStatistics._stats.nodesDeleted < 1)
      res.status(404).json({
        message: "Node Not Found"
      });

    res.status(200).json({
      message: "Node Deleted"
    });
  });
}

// Get search params for a node type.
function options(req, res) {
  var thisNodeType = req.swagger.params.nodeType.value;
  if (sconf.nodeTypes.indexOf(thisNodeType) === -1)
    return res.status(400).json({
      message: "Node Type: " + thisNodeType + " not found.",
      type: 'Message'
    });

  // If they're not logged in or they didn't give us a valid node type, just give them an empty response with CORS info.
  if (!req.user || !thisNodeType)
    return res.status(204).send();

  var paramNames = Object.keys(sconf.searchParams[thisNodeType]);
  res.status(200).json({
    searchparams: paramNames
  });
}