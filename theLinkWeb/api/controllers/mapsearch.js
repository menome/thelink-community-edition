var db = require('../helpers/database');
var sconf = require("../../config/server-conf");
var ehelper = require("../helpers/endpoint-helper");

module.exports = {
  get: getMapSearch,
};


//Gets apoc full text search
function getMapSearch(req, res) {

  var queryStr = 'WITH point({latitude: ' + req.swagger.params.latitude.value.toLowerCase() + ', \
                  longitude: ' + req.swagger.params.longitude.value.toLowerCase() + '}) AS mapcenter \
                  MATCH (a) \
                  WHERE exists(a.Latitude) AND exists(a.Longitude) \
                            WITH a, distance (point({latitude: a.Latitude, longitude: a.Longitude}), mapcenter) as distance \
                            WHERE distance < ' + req.swagger.params.distance.value.toLowerCase() + ' \
                    RETURN a \
                  order by distance LIMIT 1000'

  var queryParams = {
    Distance: req.swagger.params.distance.value.toLowerCase()
  };

  db.query(queryStr, queryParams, function (err, result) {
    if (err !== null)
      res.status(500).json(err);

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