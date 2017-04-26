var express = require("express");
var questions = express.Router();
var db = require('../helpers/database');
var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");
var ehelper = require("../helpers/endpoint-helper");
var stat = require("../helpers/stat");

module.exports = {
  get: getQuestions,
  ask: askQuestion,
  dashboard: dashboardQuestion,
};

// Get all the questions for a node type.
function getQuestions(req, res) {
  var nodeType = null;
  if (req.swagger.params.nodetype.value)
    nodeType = fmt.cleanCase(req.swagger.params.nodetype.value);

  var matchingQuestions = [];

  for (var k in sconf.questions) {
    if (sconf.questions[k].Dashboard === false) {
      if (!nodeType || sconf.questions[k].NodeType === nodeType) {
        var q = sconf.questions[k];
        matchingQuestions.push({
          Name: k,
          FriendlyName: q.FriendlyName,
          NodeType: q.NodeType,
          Dashboard: q.Dashboard
        });
      }
    }
  }

  var response = new ehelper.response(matchingQuestions);
  return res.json(response);
}

function askQuestion(req, res) {
  if (!(req.swagger.params.questionstr.value in sconf.questions))
    res.status(404).json("Could not answer unknown question '" +
      req.swagger.params.questionStr.value + "'!");

  var question = sconf.questions[req.swagger.params.questionstr.value];
  var nodeId = req.swagger.params.id.value.toLowerCase();

  if (typeof (nodeId) === 'undefined')
    res.status(400).json("Please enter a valid node ID");

  var queryStr = question.Query;
  var queryParams = {
    NodeId: nodeId
  };

  //Log the pivot.
  stat.logEvent(req.user.Email + " asked question " + req.swagger.params.questionstr.value + " all on node " + nodeId, "", {
    tags: ["username:" + req.user.Email]
  });

  db.query(queryStr, queryParams, function (err, result) {
    if (err) return res.status(500).json(err);

    resultList = [];
    for (i = 0; i < result.records.length; i++) {

      // get the main result item
      var item = result.records[i];
      var record = item.get(0).properties;

      // pickup any additional results
      if (item.length > 1) {
        for (j = 1; j < item.length; j++) {
          var additionalItems = item.get(j);
          record[item.keys[j]] = additionalItems.toString();
        }
      }
      //We can make sure everything has a name field.
      if (!record.Name && record.FirstName && record.LastName)
        record.Name = record.FirstName + ' ' + record.LastName;

      //Try to guess the nodeType based on the node's labels.
      record.NodeType = "none";
      var labelList = result.records[i].get(0).labels;
      for (j = 0; j < labelList.length; j++)
        if (sconf.nodeTypes.indexOf(labelList[j]) != -1)
          record.NodeType = labelList[j];

      resultList.push(record);
    }

    var response = new ehelper.response(resultList);
    res.json(response);
  });
}

function dashboardQuestion(req, res) {
  if (!(req.swagger.params.questionstr.value in sconf.questions))
    res.status(404).json("Could not answer unknown question '" +
      req.swagger.params.questionStr.value + "'!");

  var question = sconf.questions[req.swagger.params.questionstr.value];
  var label = req.swagger.params.label.value;

  if (typeof (label) === 'undefined')
    res.status(400).json("Please enter a valid label");

  var queryStr = question.Query;
  var queryParams = {
    Label: label
  };

  //Log the pivot.
  stat.logEvent(req.user.Email + " asked question " + req.swagger.params.questionstr.value + " dashboard for label " + label, "", {
    tags: ["username:" + req.user.Email]
  });

  db.query(queryStr, queryParams, function (err, result) {
    if (err) return res.status(500).json(err);

    resultList = [];
    for (i = 0; i < result.records.length; i++) {

      // get the main result item
      var item = result.records[i];
      var record = item.get(0).properties;

      // pickup any additional results
      if (item.length > 1) {
        for (j = 1; j < item.length; j++) {
          var additionalItems = item.get(j);
          record[item.keys[j]] = additionalItems.toString();
        }
      }
      //We can make sure everything has a name field.
      if (!record.Name && record.FirstName && record.LastName)
        record.Name = record.FirstName + ' ' + record.LastName;

      //Try to guess the nodeType based on the node's labels.
      record.NodeType = "none";
      var labelList = result.records[i].get(0).labels;
      for (j = 0; j < labelList.length; j++)
        if (sconf.nodeTypes.indexOf(labelList[j]) != -1)
          record.NodeType = labelList[j];

      resultList.push(record);
    }

    var response = new ehelper.response(resultList);
    res.json(response);
  });
}