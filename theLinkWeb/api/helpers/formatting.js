var sconf = require("../../config/server-conf.js");

var camelCaseToSpaces = function (str) {
  return str.split(/(?=[A-Z])/).join(' ');
};

//Helper function. Used to help make the HTTP call case-insensitive.
var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

//Check if we've got a date object. Just guess by the name of the property.
var isProbablyDate = function (string) {
  if (typeof (string) !== "string") return false;
  return string.match(/date/i);
};

var longIntToDate = function (integer) {
  if (typeof (integer) !== "number") return integer;
  var date = dateStrToDate(integer.toString());
  return new Date(date.year, date.month - 1, date.day).toDateString();
};

//Takes strings of the form YYYYMMDD, YYYYMM, or YYYY and turns them into {year: int, month: int, day: int}
var dateStrToDate = function (str) {
  if (typeof (str) !== "string") return null;
  if ([4, 6, 8].indexOf(str.length) == -1) return null; //Only accept strings of these lengths.

  return {
    year: str.substring(0, 4),
    month: str.length > 4 ? parseInt(str.substring(4, 6)) : null,
    day: str.length > 6 ? parseInt(str.substring(6, 8)) : null,
  };
};

//Helper function. Used to help make the HTTP call case-insensitive.
var cleanCase = function (string) {
  var allLower = string.toLowerCase();
  return allLower.charAt(0).toUpperCase() + allLower.slice(1);
};

//
var getReadableNameForRelationship = function (relname, singular, forward, itemName) {
  if (!(relname in sconf.relationships))
    return camelCaseToSpaces(relname);

  var relObj = sconf.relationships[relname];
  var retStr;
  if (forward && singular && 'fSingName' in relObj) retStr = relObj.fSingName;
  else if (forward && !singular && 'fPluralName' in relObj) retStr = relObj.fPluralName;
  else if (!forward && singular && 'rSingName' in relObj) retStr = relObj.rSingName;
  else if (!forward && !singular && 'rPluralName' in relObj) retStr = relObj.rPluralName;
  else return camelCaseToSpaces(relname);

  return retStr.replace('{itemName}', itemName);
};

// Parses strings of the form 'key:val,key2:val2' into a javascript map.
var parseSearchParams = function (paramStr) {
  if (!paramStr) return {};

  var ret = {};
  var params = paramStr.split(',');
  for (var param in params) {
    var split = params[param].split(':');
    ret[split[0]] = split[1];
  }

  return ret;
};

module.exports = {
  getReadableNameForRelationship: getReadableNameForRelationship,
  capitalizeFirstLetter: capitalizeFirstLetter,
  cleanCase: cleanCase,
  isProbablyDate: isProbablyDate,
  longIntToDate: longIntToDate,
  dateStrToDate: dateStrToDate,
  parseSearchParams: parseSearchParams,
};