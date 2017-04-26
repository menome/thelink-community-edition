/** 
 * Gets information about the dataset in the DB.
 * eg. What nodes/relationships exist? Which nodes are queryable?
 *
 * Copyright (c) 2016 Menome Technologies Inc.  
 */
var db = require('../helpers/database');
var ehelper = require("../helpers/endpoint-helper");
var searchConf = require("../../config/search-config");
var conf = require("../../config/conf");

module.exports = {
  getSearchInfo: getSearchInfo,
  getConfigInfo: getConfigInfo,
  getUserPivot: getUserPivot,
};

//Gets all the info that we need for searching (think from a UI perspective)
function getSearchInfo(req, res) {
  var retObj = {
    simpleSearches: searchConf.simpleSearchList,
    mainSearches: searchConf.searchList,
  };

  var response = new ehelper.response(retObj, "SearchInfo");
  res.json(response);
}

//Give the consumer some bookkeeping info about the API.
function getConfigInfo(req, res) {
  var resp = {
    anonAccess: conf.anonAccess,
  };
  res.json(new ehelper.response(resp, "ApiMetadata"));

}

function getUserPivot(req, res) {
  //var query = "MATCH (p:Person {Email: 'kaust@menome.com'})-[r]-(n) RETURN n"

}