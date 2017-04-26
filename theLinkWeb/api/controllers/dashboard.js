var ehelper = require("../helpers/endpoint-helper");
var db = require('../helpers/database');
var sconf = require('../../config/server-conf');
var dashconf = require('../../config/dashboard-conf');
var neo4j = require('neo4j-driver').v1;

module.exports = {
  getGraphs: getGraphs,
  getMetrics: getMetrics,
  getUserPivot: getUserPivot,
};

function getMetrics(req, res) {
  var pendingLoads = 0;
  var resp = [{

    // displayName: 'Total Questions',
    // displayVal: Object.keys(sconf.questions).length,
  }];

  dashconf.quickMetrics.forEach(function (metric) {
    pendingLoads += 1;
    db.query(metric.query, {}, function (err, result) {
      var value = null;
      if (err) return res.status(500).json(err);

      if (result.records.length > 0) {
        var qResult = result.records[0].get("res");
        if (neo4j.isInt(qResult)) qResult = qResult.toInt();
        value = ({
          displayName: metric.name,
          displayVal: qResult
        });
      }

      if (value) resp.push(value);
      pendingLoads -= 1;

      if (pendingLoads < 1) //Last result? Send the response.
        res.json(new ehelper.response(resp, "Metrics"));
    });

  });
}

function getGraphs(req, res) {
  var pendingLoads = 0;
  var resp = [];

  dashconf.graphMetrics.forEach(function (val) {
    pendingLoads += 1;
    db.query(val.query, {}, function (err, result) {
      var graph = null;
      if (err) return res.status(500).json(err);
      if (result.records.length == 1) {

        // TODO: Add support for graph series. (1 series per row of returned query.)
        var labels = result.records[0].get('labels');
        var data = result.records[0].get('data');
        for (var i = 0; i < labels.length; i++) {
          if (neo4j.isInt(labels[i]))
            labels[i] = labels[i].toInt();
          if (neo4j.isInt(data[i]))
            data[i] = data[i].toInt();
        }

        graph = {
          chartType: val.chartType,
          question: val.question,
          click: val.click,
          colspan: val.colspan,
          rowspan: val.rowspan,
          title: val.title,
          labels: labels,
          data: data,
        };
      }

      if (graph) resp.push(graph);
      pendingLoads -= 1; // We've finished loading this graph.

      if (pendingLoads < 1) // If we're totally done loading graphs, quit.
        res.json(new ehelper.response(resp, "Graphs"));
    });
  });
}

// Returns the data for a visual graph showing things immediately connected to a user.
function getUserPivot(req, res) {
  var userEmail = req.user.Email;

  var resp = {
    nodes: [{
      id: 1,
      label: 'You!',
      size: 10,
      color: "#93D276",
      shape: "circle"
    }],
    edges: []
  };

  var queryStr = "MATCH (p:Person)-[r]-(n) WHERE p.Email = {email} RETURN p.Uuid as uid, labels(n)[0] as label, count(n) as count";
  db.query(queryStr, {
    email: userEmail
  }, function (err, result) {
    if (err) return res.status(500).json(err);
    if (result.records.length < 1)
      return res.json(new ehelper.response(resp, "UserPivot"));

    resp.nodes[0].uuid = result.records[0].get('uid');

    for (var i = 0; i < result.records.length; i++) {
      var label = result.records[i].get('label');
      if (sconf.unpivotableNodes.indexOf(label) != -1) continue;

      resp.nodes.push({
        id: i + 2,
        nodeType: label,
        label: label + ": " + result.records[i].get("count"),
        type: "RelatedNode"
      });
      resp.edges.push({
        from: 1,
        to: i + 2
      });
    }

    return res.json(new ehelper.response(resp, "UserPivot"));
  });

}