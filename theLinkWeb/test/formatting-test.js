var fmt = require("../api/helpers/formatting");

describe('Utility Functions', function() {

  describe('Get Readable Name for Relationship', function() {
    it('Converts a camelcase string to a space separated one.', function(done) {
      var val = fmt.getReadableNameForRelationship("TestRelationship");
      if(val != "Test Relationship")
        return done(new Error("Result invalid: " + val));

      return done();
    });

    it('Returns forward and reverse singular and plural names for a known relationship.', function(done) {
      var val1 = fmt.getReadableNameForRelationship("WorksFor", false, false, "Dave");
      var val2 = fmt.getReadableNameForRelationship("WorksFor", false, true, "Dave");
      var val3 = fmt.getReadableNameForRelationship("WorksFor", true, false, "Dave");
      var val4 = fmt.getReadableNameForRelationship("WorksFor", true, true, "Dave");
      if(val1.length < 0) return done(new Error("Result invalid: " + val1));
      if(val2.length < 0) return done(new Error("Result invalid: " + val2));
      if(val3.length < 0) return done(new Error("Result invalid: " + val3));
      if(val4.length < 0) return done(new Error("Result invalid: " + val4));

      return done();
    });
  });

  describe('Capitalize First Letter', function() {
    it('Capitalizes the first letter of a string', function(done) {
      var val = fmt.capitalizeFirstLetter("theCakeIsALie");
      if(val !== "TheCakeIsALie") return done(new Error("Result invalid: " + val));

      return done();
    });
  });

  describe('Is Probably Date', function() {
    it('Correctly identifies fields that are probably dates.', function(done) {
      ["dateDay","startedDate","endDate","thisisadate"].forEach(function(str) {
        var val = fmt.isProbablyDate(str);
        if(!val) return done(new Error("Result invalid: " + val));
      });

      return done();
    });

    it('Correctly identifies fields that are probably not dates.', function(done) {
      ["taxes","adultstuff","hogwarts","email"].forEach(function(str) {
        var val = fmt.isProbablyDate(str);
        if(val) return done(new Error("Result invalid: " + val));
      });

      return done();
    });
  });

  describe('Long Int to Date', function() {
    it('Does not convert passed objects that are not integers.', function(done) {
      var val = fmt.longIntToDate("notadateint");
      if(val !== "notadateint") return done(new Error("Result invalid: " + val));
      return done();
    });

    it('Correctly converts a long integer to a date.', function(done) {
      var val = fmt.longIntToDate(19940904);
      var testDate = new Date(1994,08,04);
      if(val !== testDate.toDateString()) return done(new Error("Result invalid: " + val));
      return done();
    });
  });

  describe('Date String to Date', function() {
    it('Does not convert passed objects that are not strings, or are not the right length', function(done) {
      var val = fmt.dateStrToDate(21);
      var val2 = fmt.dateStrToDate("199");
      if(val !== null) return done(new Error("Result invalid: " + val));
      if(val2 !== null) return done(new Error("Result invalid: " + val2));
      return done();
    });

    it('Correctly converts a long integer to a date.', function(done) {
      var val = fmt.dateStrToDate("19940904");
      var val2 = fmt.dateStrToDate("199409");
      if(val.year != 1994 || val.month != 9 || val.day != 4) return done(new Error("Result invalid: " + val.year + " " + val.month + " " +val.day));
      if(val2.year != 1994 || val2.month != 9 || val2.day !== null) return done(new Error("Result invalid: " + val.year + " " + val.month + " " +val.day));
      return done();
    });
  });
});
