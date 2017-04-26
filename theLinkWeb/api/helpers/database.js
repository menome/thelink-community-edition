/*
 * database.js
 * Copyright (C) 2016 Menome Technologies.
 *
 * Contains shared code for contacting the Neo4j Database.
 *
 * All other API code references this so that we only have one session open per API instance.
 */

var neo4j = require('neo4j-driver').v1;
var fmt = require("../helpers/formatting");
var sconf = require("../../config/server-conf");
var uuid = require('node-uuid');
var conf = require('../../config/conf');

//bolt://neo4j connects to our neo4j docker container (via hostname) using bolt protocol.
var driver = neo4j.driver("bolt://neo4j", neo4j.auth.basic(conf.dbuser, conf.dbpass));

// Formats a string for searching within and cypher query.
exports.searchRegex = function (str) {
  if (typeof (str) === "string")
    return '(?i).*' + str + '.*';

  return '.*';
};

//Options is a special object that holds all optional parts of the query.
exports.nodeSearch = function (options, cb) {
  var nodeType = (typeof options.nodeType !== 'undefined') ? options.nodeType : null;
  var queryParams = (typeof options.queryParams !== 'undefined') ? options.queryParams : {};
  var groupType = (typeof options.groupBy !== 'undefined') ? options.groupBy : "none"; //Can be 'none', 'alphabet', 'time'
  var groupCutoff = (typeof options.groupCutoff !== 'undefined') ? options.groupCutoff : conf.defaultGroupCutoff; //Don't group when we have less than this many results.
  var extended = (typeof options.extended !== 'undefined') ? options.extended : []; //List of secondary relationships to retrieve the names of.
  var firstLetter = (typeof options.firstLetter !== 'undefined') ? options.firstLetter : null; //The alphabet group we're querying for. null for none.
  var date = (typeof options.date !== 'undefined') ? options.date : null; //The alphabet group we're querying for. null for none.
  var location = (typeof options.location !== 'undefined') ? options.location : null; //The alphabet group we're querying for. null for none.
  var matchClauses = (typeof options.matchClauses !== 'undefined') ? options.matchClauses : []; //Match clauses for the query.
  var whereClauses = (typeof options.whereClauses !== 'undefined') ? options.whereClauses : []; //Where clauses for the query.
  var guessTypes = (typeof options.guessTypes !== 'undefined') ? options.guessTypes : false; //If we guess our return types.
  var dateRelationship = (typeof options.dateRelationship !== 'undefined') ? options.dateRelationship : "OnDate"; //Relationship to search by date.
  var matchStmt = "";
  whereStmt = "";
  retStmt = "";
  var resultHandlerFunc = groupType === 'none' ? resultFunc : groupResultFunc;

  var queryBuilderOptions = {
    matchClauses: matchClauses,
    whereClauses: whereClauses,
    groupType: groupType,
    firstLetter: firstLetter,
    extended: extended,
    dateRelationship: dateRelationship,
    date: date,
    location: location,
  };

  var queryObj = exports.generateQuery(nodeType, queryBuilderOptions);
  // return cb(null,queryObj);

  process.nextTick(function () {
    var session = driver.session();
    resultHandlerOptions = {
      nodeType: nodeType,
      groupCutoff: groupCutoff,
      queryParams: queryParams,
      groupType: groupType,
      queryObj: queryObj,
      session: session,
      guessTypes: guessTypes,
      extended: extended
    };

    session //Only add extended attribute query if we're not querying by group.
      .run(queryObj.matchStmt + ' ' + queryObj.whereStmt + ' ' + (groupType === 'none' ? queryObj.extStmt : '') + ' ' + queryObj.retStmt, queryParams)
      .then(function (result) {
          resultHandlerFunc(result, resultHandlerOptions, cb);
          session.close();
        },
        function (err) {
          session.close();
          return cb(err, null);
        })
      .catch(function (err) {
        session.close();
        return cb(err, null);
      });
  });
};

exports.generateQuery = function (nodeType, options) {
  var matchStmt = "";
  whereStmt = "";
  extStmt = "";
  retStmt = "";
  var matchNode = nodeType ? "(node:" + nodeType + ")" : "(node)";

  //Build the match statement.
  switch (options.groupType) {
    case "alphabet":
      matchStmt = "MATCH (l:AlphabetGroup) WITH l as letter " +
        "MATCH " + matchNode + "-[:IsInAlphabetGroup]->(letter)";
      break;
    case "date":
      matchStmt = "MATCH (date_y:Year)-[:HasMonth]->(date_m:Month)-[:HasDay]->(date_d:Day)<-[:" + options.dateRelationship + "]-" + matchNode;
      break;
    case "location":
      matchStmt = "MATCH (loc_country:Country)<-[:IsIn]-(loc_region:Region)<-[:IsIn]-(loc_city:City)<-[:IsIn]-" + matchNode;
      break;
    default:
      matchStmt = "MATCH " + matchNode;
  }

  if (options.matchClauses.length > 0) {
    matchStmt += ", ";
    options.matchClauses.forEach(function (val, idx, arr) {
      matchStmt += val;
      if (idx < arr.length - 1)
        matchStmt += " , ";
    });
  }

  //If we're querying by first letter.
  if (options.groupType === 'none' && options.firstLetter) {
    matchStmt += " MATCH (node)-[:IsInAlphabetGroup]->(ag:AlphabetGroup {Name: '" + options.firstLetter + "'})";
  }

  //If we're querying by date.
  if (options.groupType === 'none' && options.date) {
    matchStmt += " MATCH (node)-[:" + options.dateRelationship + "]->(date_d:Day";
    matchStmt += options.date.day !== null ? " {day: " + options.date.day + "})" : ")";

    matchStmt += "<-[:HasDay]->(date_m:Month";
    matchStmt += options.date.month !== null ? " {month: " + options.date.month + "})" : ")";

    matchStmt += "<-[:HasMonth]->(date_y:Year";
    matchStmt += options.date.year !== null ? " {year: " + options.date.year + "})" : ")";
  }

  //If we're querying by location.
  if (options.groupType === 'none' && options.location) {
    matchStmt += " MATCH (node)-[:IsIn]->(loc_city:City";
    matchStmt += options.location.city !== null ? " {Name: '" + options.location.city + "'})" : ")";

    matchStmt += "<-[:IsIn]->(loc_region:Region";
    matchStmt += options.location.region !== null ? " {Name: '" + options.location.region + "'})" : ")";

    matchStmt += "<-[:IsIn]->(loc_country:Country";
    matchStmt += options.location.country !== null ? " {Name: '" + options.location.country + "'})" : ")";
  }

  //Build the Where statement
  if (options.whereClauses.length > 0) {
    whereStmt += "WHERE ";
    options.whereClauses.forEach(function (val, idx, arr) {
      whereStmt += val;
      if (idx < arr.length - 1)
        whereStmt += " AND ";
    });
  }

  // Optional match clauses. Used for extended parameters.
  if (options.extended.length > 0) {
    extStmt += " OPTIONAL MATCH (node)-[r:";
    extStmt += options.extended.join('|');
    extStmt += "]-(s) WITH node, COLLECT({reltype: type(r), relname: s.Name}) as extended ";
  }

  //Build the return statement
  switch (options.groupType) {
    case 'alphabet':
      retStmt += "RETURN DISTINCT letter.Name as letter, count(node) as count";
      break;
    case 'date':
      //retStmt += "RETURN DISTINCT date_y.year as year, date_m.month as month, date_d.day as day, count(node) as count";
      retStmt += "WITH date_y.year as year, date_m.month as month, date_d.day as day, count(node) as count " +
        "WITH year, month, COLLECT({day: day, count: count}) as days " +
        "RETURN DISTINCT year as year, COLLECT({month: month, days: days}) as months";
      break;
    case 'location':
      matchStmt = "MATCH (loc_country:Country)<-[:IsIn]-(loc_region:Region)<-[:IsIn]-(loc_city:City)<-[:IsIn]-" + matchNode;
      retStmt += "WITH loc_country.Name as country, loc_region.Name as region, loc_city.Name as city, count(node) as count " +
        "WITH country, region, COLLECT({city: city, count: count}) as cities " +
        "RETURN DISTINCT country, COLLECT({region: region, cities: cities}) as regions";
      break;
    default:
      retStmt += "RETURN DISTINCT node";
      if (options.extended.length > 0)
        retStmt += ", extended";
      retStmt += " ORDER BY node.Name";
  }

  return {
    matchStmt: matchStmt,
    whereStmt: whereStmt,
    extStmt: extStmt,
    retStmt: retStmt
  };
};

//Parses results with grouping.
function groupResultFunc(result, options, cb) {
  var retObj = {
    count: 0
  };
  var retTypeName = null;
  var sortFunc = null;
  if (options.nodeType) retObj.NodeType = options.nodeType;
  var groupList = [];

  switch (options.groupType) {
    case 'alphabet':
      retTypeName = "LetterGroup";
      sortFunc = function (a, b) {
        return a.letter.localeCompare(b.letter);
      };
      for (i = 0; i < result.records.length; i++) {
        var letter = result.records[i].get("letter");
        var count = result.records[i].get("count").toInt();
        groupList.push({
          letter: letter,
          count: count
        });
        retObj.count += count;
      }
      break;

    case 'date':
      retTypeName = "DateGroup";
      sortFunc = function (a, b) {
        return b.year - a.year;
      };
      for (i = 0; i < result.records.length; i++) {
        var year = result.records[i].get("year").toNumber();
        var months = result.records[i].get("months");

        //This is terrible.
        //Loop through each month. Convert stuff to numbers.
        //Loop through each day of each month. Convert stuff to numbers and record our total node count.
        //This will need to nest further for each level of granularity we add to the time tree.
        //Maybe a recursive approach is possible with some refactor? Doesn't help runtime much...
        for (var monthIdx = 0; monthIdx < months.length; monthIdx++) {
          months[monthIdx].month = months[monthIdx].month.toNumber();
          for (var dayIdx = 0; dayIdx < months[monthIdx].days.length; dayIdx++) {
            months[monthIdx].days[dayIdx].day = months[monthIdx].days[dayIdx].day.toNumber();
            months[monthIdx].days[dayIdx].count = months[monthIdx].days[dayIdx].count.toNumber();
            retObj.count += months[monthIdx].days[dayIdx].count;
          }

          months[monthIdx].days = months[monthIdx].days.sort(function (a, b) {
            return a.day - b.day;
          });
        }

        groupList.push({
          year: year,
          months: months.sort(function (a, b) {
            return a.month - b.month;
          }),
        });
      }
      break;
    case 'location':
      retTypeName = "LocationGroup";
      sortFunc = function (a, b) {
        return a.country.localeCompare(b.country);
      };
      for (i = 0; i < result.records.length; i++) {
        var country = result.records[i].get("country");
        var regions = result.records[i].get("regions");

        //This is terrible for similar reasons to the date.
        for (var reIdx = 0; reIdx < regions.length; reIdx++) {
          for (var citIdx = 0; citIdx < regions[reIdx].cities.length; citIdx++) {
            regions[reIdx].cities[citIdx].count = regions[reIdx].cities[citIdx].count.toNumber();
            retObj.count += regions[reIdx].cities[citIdx].count;
          }
          regions[reIdx].cities = regions[reIdx].cities.sort(function (a, b) {
            if (a.city && b.city) {
              return a.city.localeCompare(b.city);
            }
            return 0;
          });
        }

        groupList.push({
          country: country,
          regions: regions.sort(function (a, b) {
            if (a.region && b.region) {
              return a.region.localeCompare(b.region);
            }
            return 0;
          }),
        });
      }
      break;
  }

  //If we're under the threshold, run a normal query to get all the nodes.
  //Do some extra stuff if we're getting the extended parameters as well.
  if (retObj.count < options.groupCutoff || retObj.count < 2) {
    process.nextTick(function () {
      options.session
        .run(options.queryObj.matchStmt + ' ' + options.queryObj.whereStmt +
          ' ' + options.queryObj.extStmt + ' RETURN DISTINCT node' +
          (options.extended.length > 0 ? ", extended" : "" + " ORDER BY node.Name"), options.queryParams)
        .then(function (result) {
            resultFunc(result, options, cb);
            options.session.close();
          },
          function (err) {
            options.session.close();
            return cb(err, null);
          })
        .catch(function (err) {
          options.session.close();
          return cb(err, null);
        });
    });
  } else {
    retObj.groups = groupList.sort(sortFunc);
    return cb(null, retObj, retTypeName);
  }
}

//Parses results without grouping.
function resultFunc(result, options, cb) {
  resultList = [];
  for (i = 0; i < result.records.length; i++) {
    var record = result.records[i].get('node').properties;

    //Hack for returning numbers.
    for (var k in record) {
      if (neo4j.isInt(record[k])) {
        if (fmt.isProbablyDate(k)) //Check if it's a date.
          record[k] = fmt.longIntToDate(record[k].toNumber());
        else //If not, just cast to a number.
          record[k] = record[k].toNumber();
      }
    }

    // If we have extended parameters, add them to the record.
    // Transform the data a little bit.
    if (options.extended.length > 0) {
      record.extended = {};
      for (var l = 0; l < result.records[i].get('extended').length; l++) {
        var val = result.records[i].get('extended')[l];

        if (!record.extended[val.reltype]) record.extended[val.reltype] = [];
        record.extended[val.reltype].push(val.relname);
      }
    }

    //We can make sure everything has a name field.
    if (!record.Name && record.FirstName && record.LastName)
      record.Name = record.FirstName + ' ' + record.LastName;

    if (options.guessTypes) {
      //Try to guess the nodeType based on the node's labels.
      record.NodeType = "none";
      var labelList = result.records[i].get(0).labels;
      for (var j = 0; j < labelList.length; j++)
        if (sconf.nodeTypes.indexOf(labelList[j]) != -1)
          record.NodeType = labelList[j];
    } else if (options.nodeType) {
      record.NodeType = options.nodeType; //Add this for classification purposes.
    }

    resultList.push(record);
  }

  return cb(null, resultList);
}

// Generates a unique ID for creating new nodes.
exports.genUuid = function () {
  return uuid.v4();
};

// Finds a user and their roles from an email address.
// Used for auth purposes.
// Unlike the /users api enpoint, this returns every attribute of the user.
// (Including the hashed and salted password)
exports.getUserAndRolesByEmail = function (email, cb) {
  process.nextTick(function () {
    var session = driver.session();
    session
      .run("MATCH (a:User) OPTIONAL MATCH (a)-[:HasRole]->(r:Role) WITH r, a WHERE a.Email = {email} RETURN a, r.Name as role", {
        email: email
      })
      .then(function (result) {
        var roles = [];
        if (result.records.length === 0)
          return cb(null, false);

        var user = result.records[0].get("a").properties;

        result.records.forEach(function (val) {
          roles.push(val.get("role"));
        });

        user.roles = roles;

        session.close();
        return cb(null, user);
      }, function (error) {
        session.close();
        return cb(error, null);
      })
      .catch(function (err) {
        session.close();
        return cb(err, null);
      });
  });
};

// Creates a new user.
// Returns the newly created user object to the callback.
exports.createUser = function (email, pass, cb) {
  process.nextTick(function () {
    var queryStr = "MATCH (r:Role) WHERE r.Name = 'searcher' CREATE (u:User {Uuid: {Uuid}, Email: {Email}, Password: {Password}, EmailVerified: false, CompletedTutorial: false}), (u)-[hr:HasRole]->(r) RETURN u";
    var session = driver.session();
    session
      .run(queryStr, {
        Email: email,
        Password: pass,
        Uuid: exports.genUuid()
      })
      .then(function (result) {
        if (result.records.length > 0)
          return cb(null, result.records[0].get("u").properties);
        else
          return cb(null, null);

        session.close();
      }, function (err) {
        session.close();
        return cb(err, null);
      })
      .catch(function (err) {
        session.close();
        return cb(err, null);
      });
  });
};

//Get user info. But creates the user if we don't find them.
exports.findOrCreateUser = function (email, cb) {
  exports.getUserAndRolesByEmail(email, function (err, user) {
    if (err) return cb(err, false);
    if (!user) { // If we didn't find the user, create them.
      exports.createUser(email, null, function (err, user) {
        if (err) return cb(err, false);

        if (user === null)
          return cb(new Error("Could not create new user"), false);

        // If we created them properly, return them.
        return cb(null, user);
      });
    } else
      return cb(null, user); //If we did find the user, we can return them
  });
};

// Update the date of the last login
// This is very much a 'fire and forget' method.
exports.updateLastLogin = function (email) {
  process.nextTick(function () {
    var session = driver.session();
    session
      .run("MATCH (a:User) WHERE a.Email = {email} SET a.LastLogin={date}", {
        email: email,
        date: new Date().toISOString()
      })
      .then(function (result) {
        session.close();
      }, function (error) {
        session.close();
      })
      .catch(function (err) {
        session.close();
      });
  });
};

//Generic way for app to schedule queries, while getting passed any errors.
exports.query = function (queryStr, queryParams, cb) {
  process.nextTick(function () {
    var session = driver.session();
    session
      .run(queryStr, queryParams)
      .then(function (result) {
          session.close();
          return cb(null, result);
        },
        function (err) {
          session.close();
          return cb(err, null);
        })
      .catch(function (err) {
        session.close();
        return cb(err, null);
      });
  });
};