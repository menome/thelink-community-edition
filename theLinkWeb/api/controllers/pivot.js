var db = require('../helpers/database');
var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");
var ehelper = require("../helpers/endpoint-helper");
var stat = require("../helpers/stat");

module.exports = {
  pivotAll: pivotAll,
  getInfo: getInfo,
  pivotByType: pivotByType,
  pivotByRel: pivotByRel,
};

// Returns the how many nodes of each type this node is linked to.
// TODO: If these two queries can be made into one, that'd be great. I haven't found a way to do that yet.
function getInfo(req, res) {
  var relsQuery = "MATCH (p:Card)-[r]-(n) WHERE p.Uuid = {NodeId} WITH labels(p) as srcType, labels(n) as labels, type(r) as rel, id(startNode(r)) as startNodeId, id(p) as pivotNodeId UNWIND labels as label RETURN label, count(label) as count, rel, (startNodeId = pivotNodeId) as forwardRelationship, srcType ORDER BY label";
  var countQuery = "MATCH (p:Card)-[r]-(n) WHERE p.Uuid = {NodeId} RETURN labels(n) as labels, count(distinct n) as count";
  var queryParams = {
    NodeId: req.swagger.params.id.value.toLowerCase()
  };

  // Query for how many nodes of each type of relationship.
  db.query(relsQuery, queryParams, function (err, result) {
    if (err) return res.status(500).json(err);

    var resultList = [];
    var resultAggregate = {};
    for (i = 0; i < result.records.length; i++) {
      var srcType = result.records[i].get('srcType');
      var label = result.records[i].get('label');
      var count = result.records[i].get('count').toInt();
      var relationship = result.records[i].get('rel');

      //Remove the 'card' type from the srcType
      var cardIdx = srcType.indexOf('Card');
      if(cardIdx !== -1) srcType.splice(cardIdx,1);

      if (label === 'Card' || sconf.unpivotableNodes.indexOf(label) != -1) continue;

      // Determine if it was (p)-[r]->(n) or (n)-[r]->(p). Used for human readable string fetching.
      var forwardRelationship = result.records[i].get('forwardRelationship');

      if (!resultAggregate[label])
        resultAggregate[label] = {
          Relationships: [],
          Count: 0
        };

      resultAggregate[label].Label = label;
      // Setting the total count doesn't work here. It'll count duplicates and we don't want that.
      //resultAggregate[label].Count += count;

      var relString = fmt.getReadableNameForRelationship(relationship, (count == 1), forwardRelationship, srcType);

      resultAggregate[label].Relationships.push({
        Name: relationship,
        HumanReadableName: relString,
        Count: count
      });
    }

    // Query for how many UNIQUE nodes of each type are connected.
    // Keyword UNIQUE. This second query was added because duplicate nodes were throwing off the count of connected nodes.
    db.query(countQuery, queryParams, function (err, result) {
      if (err) return res.status(500).json(err);

      // Loop through and set the count of each of these.
      for (i = 0; i < result.records.length; i++) {
        var labels = result.records[i].get('labels');
              
        var cardIdx = labels.indexOf('Card');
        if(cardIdx !== -1) labels.splice(cardIdx,1);

        var count = result.records[i].get('count').toInt();
        if (sconf.unpivotableNodes.indexOf(labels[0]) != -1) continue;
        resultAggregate[labels[0]].Count = count; //Set the count properly.
      }

      //Convert to list of results before we return.
      for (var k in resultAggregate)
        resultList.push(resultAggregate[k]);

      var response = new ehelper.response(resultList);
      res.json(response);
    });
  });
}

//Finds all related nodes, of any type.
function pivotAll(req, res) {
  var grouping = req.swagger.params.group.value;
  var matchClauses = ["(p:Card)--(node)"];
  var whereClauses = ["p.Uuid = {NodeId}"];

  var queryParams = {
    NodeId: req.swagger.params.id.value.toLowerCase()
  };

  var options = {
    guessTypes: true,
    queryParams: queryParams,
    groupBy: ehelper.groupTypes.indexOf(grouping) != -1 ? grouping : 'none',
    firstLetter: req.swagger.params.firstletter.value ? req.swagger.params.firstletter.value.toUpperCase() : null,
    matchClauses: matchClauses,
    whereClauses: whereClauses,
    //extended: req.swagger.params.extended.value ? sconf.extendedProperties[thisNodeType] : []
  };

  //Log the pivot.
  stat.logEvent(req.user.Email + " pivot all on node " + queryParams.NodeId, "", {
    tags: ["username:" + req.user.Email]
  });

  var callbackFunc = function (err, results, resultsType) {
    if (err) res.status(500).json(err);

    //Scrub out all the nodes that we can't pivot to.
    //Make a new list and copy them over. We don't want to delete items from a list we're iterating over.
    if (!resultsType || resultsType === "ResultSet") {
      var newResults = [];

      results.forEach(function (val, idx, obj) {
        if (sconf.unpivotableNodes.indexOf(val.NodeType) == -1)
          newResults.push(val);
      });

      results = newResults;
    }

    var response = new ehelper.response(results, resultsType);
    res.json(response);
  };

  db.nodeSearch(options, callbackFunc);
}

//Pivots on a given node.
//This should be safe, despite the fact that we're adding a string to a cypher query the normal way.
//The string should be one of a predefined set of strings.
function pivotByType(req, res) {
  var grouping = req.swagger.params.group.value === true;

  // node types are CamelCase
  var nodeType = req.swagger.params.nodetype.value; //fmt.capitalizeFirstLetter(req.swagger.params.nodetype.value.toLowerCase());
  if (sconf.nodeTypes.indexOf(nodeType) == -1)
    return res.status(400).json({
      "message": "Node Type: " + nodeType + " not Found!"
    });

  var matchClauses = ["(pnode:Card)--(node:Card)"];
  var whereClauses = ["pnode.Uuid = {NodeId}"];

  var queryParams = {
    NodeId: req.swagger.params.id.value.toLowerCase()
  };

  //Log the pivot.
  stat.logEvent(req.user.Email + " pivot by type " + nodeType + " on node " + queryParams.NodeId, "", {
    tags: ["username:" + req.user.Email]
  });

  var options = {
    nodeType: nodeType,
    queryParams: queryParams,
    groupBy: grouping ? 'alphabet' : 'none',
    firstLetter: req.swagger.params.firstletter.value ? req.swagger.params.firstletter.value.toUpperCase() : null,
    matchClauses: matchClauses,
    whereClauses: whereClauses,
    //extended: req.swagger.params.extended.value ? sconf.extendedProperties[thisNodeType] : []
  };

  var callbackFunc = function (err, results, resultsType) {
    if (err) res.status(500).json(err);

    var response = new ehelper.response(results, resultsType);
    res.json(response);
  };

  db.nodeSearch(options, callbackFunc);
}

//Pivots on a given relationship.
function pivotByRel(req, res) {
  // Check if we're restricting by nodeType
  var nodeType = req.swagger.params.nodetype.value;
  if (nodeType && sconf.nodeTypes.indexOf(nodeType) == -1)
    return res.status(400).json({
      "message": "Node Type: " + nodeType + " not Found!"
    });

  var grouping = req.swagger.params.group.value === true;
  var matchClauses = ["(p:Card)-[prel]-(node:Card)"];
  if (nodeType)
    matchClauses = ["(p:Card)-[prel]-(node:" + nodeType + ")"];
  var whereClauses = ["p.Uuid = {NodeId}", "type(prel) = {RelType}"];
  var queryParams = {
    NodeId: req.swagger.params.id.value.toLowerCase(),
    RelType: req.swagger.params.reltype.value
  }; 

  var options = {
    queryParams: queryParams,
    guessTypes: true,
    groupBy: grouping ? 'alphabet' : 'none',
    firstLetter: req.swagger.params.firstletter.value ? req.swagger.params.firstletter.value.toUpperCase() : null,
    matchClauses: matchClauses,
    whereClauses: whereClauses,
    //extended: req.swagger.params.extended.value ? sconf.extendedProperties[thisNodeType] : []
  };

  //Log the pivot.
  stat.logEvent(req.user.Email + " pivot by relationship " + queryParams.RelType + " on node " + queryParams.NodeId, "", {
    tags: ["username:" + req.user.Email]
  });

  var callbackFunc = function (err, results, resultsType) {
    if (err) res.status(500).json(err);

    var response = new ehelper.response(results, resultsType);
    res.json(response);
  };

  db.nodeSearch(options, callbackFunc);
}