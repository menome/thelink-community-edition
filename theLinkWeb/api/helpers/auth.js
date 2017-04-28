////////////////
//Authentication
var BasicStrategy = require('passport-http').BasicStrategy;
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var passport = require("passport");
var bcrypt = require('bcryptjs');
var conf = require('../../config/conf');
var db = require('../helpers/database');
var stat = require('../helpers/stat');

// Sets up all the security middleware
exports.setupSecurity = function (app) {
  // Web frontend security.
  // This doesn't actually provide security. Just a system of convenient redirects.
  if (!conf.apiOnly) {
    app.get('/app.html', exports.isAuthenticated, function (req, res, next) {
      next();
    });
    app.get('/', function (req, res, next) {
      if (req.user)
        return res.redirect('/app.html');

      // Decide how to handle automatic login.
      switch (conf.autoLogin) {
        case 'anon':
          if (!conf.anonAccess) break;
          var user = {
            Email: 'anon@menome.com',
            roles: ['searcher']
          };

          req.login(user, function (err) { //Log them in anonymously.
            if (err) return next(); //If there's an error, just don't. Go to the next part of the middleware.
            return res.redirect('/app.html');
          });
          break;
        case 'none':
          break;
        default:
          stat.logEvent("No autologin option for " + conf.autoLogin + " not using autologin.");
      }

      next();
    });
  }

  app.get('/user', exports.isAuthenticated, function (req, res, next) {
    next();
  });
  app.delete('/user', exports.isAuthenticated, function (req, res, next) {
    next();
  });
  app.get('/user/gettoken', passport.authenticate(['basic'], {
    session: false
  }), function (req, res, next) {
    next();
  });
  app.post('/user/login', passport.authenticate('local', {
    session: true,
    failureRedirect: '/index.html',
    failureFlash: true
  }));

  app.get('/api/*', exports.isAuthenticated, function (req, res, next) {
    next();
  });
  app.get('/api/*', exports.isSearcher, function (req, res, next) {
    next();
  });
  app.post('/api/*', exports.isAuthenticated, function (req, res, next) {
    next();
  });
  app.post('/api/*', exports.isContributor, function (req, res, next) {
    next();
  });
  app.delete('/api/*', exports.isAuthenticated, function (req, res, next) {
    next();
  });
  app.delete('/api/*', exports.isContributor, function (req, res, next) {
    next();
  });

  // If we're allowing an anonymous account, make sure it lives in the DB beore we start.
  if (conf.anonAccess) {
    var queryStr = "MATCH (r:Role) WHERE r.Name = 'searcher' MERGE (u:User {Uuid: {Uuid}, Email: {Email}, EmailVerified: true})-[hr:HasRole]->(r) RETURN u";
    var params = {
      Email: 'anon@menome.com',
      Uuid: '54e7c654-c037-49af-a192-b55811581e3d'
    };
    db.query(queryStr, params, function (err, result) {
      if (err) {
        console.log("Failed to set up anonymous user.");
      }
    });
  }
};

///////////////////
// Middleware Stuff

//Auth Function
var authFunc = function (username, password, done) {
  db.getUserAndRolesByEmail(username, function (err, user) {
    if (!conf.anonAccess && username === 'anon@menome.com') return done(null, false);

    if (err) {
      stat.logEvent("Failed Login for username " + username, "Failed with error: " + err, {
        tags: ["username:" + username]
      });
      return done(err, false);
    }
    if (!user) {
      stat.logEvent("Failed Login for username " + username, "", {
        tags: ["username:" + username]
      });
      return done(null, false);
    }

    if (user.Email !== 'anon@menome.com' && !bcrypt.compareSync(password, user.Password)) {
      stat.logEvent("Failed Login for username " + username, "", {
        tags: ["username:" + username]
      });
      return done(null, false);
    }

    stat.logEvent("Login for username " + username, "", {
      tags: ["username:" + username]
    });
    db.updateLastLogin(username); // Set the time of their last login.
    return done(null, user);
  });
};

// Let us use basic auth
passport.use(new BasicStrategy(authFunc));
passport.use(new LocalStrategy(authFunc));

// Route Middleware. Gives HTTP unauthorized on fail.
// Use sessions if we're also running a webapp.

// We use this middleware for stateless auth.
var statelessAuth = passport.authenticate(['basic']);

// This one just checks that we're already logged in.
var statefulAuth = function (req, res, next) {
  // If there's an authorization header, use stateless auth.
  if (req.get('Authorization'))
    return statelessAuth(req, res, next);

  // Otherwise proceed with stateful.
  if (req.user)
    next();
  else
    res.redirect('/');
};

exports.isAuthenticated = conf.apiOnly ? statelessAuth : statefulAuth;

// Makes sure we are authorized to perform this request.
exports.isSearcher = function (req, res, next) {
  if (req.user.roles.indexOf('searcher') == -1)
    return res.status(401).json({
      message: "This resource requires the role: 'searcher' which this user does not have."
    });

  next();
};

exports.isContributor = function (req, res, next) {
  if (req.user.roles.indexOf('contributor') == -1)
    return res.status(401).json({
      message: "This resource requires the role: 'contributor' which this user does not have."
    });

  next();
};

//////////////////////
// User session stuff.
// The web app will use HTTP sessions so we may as well utilize this.
// Other consumers of the API will still be used sessionless.
passport.serializeUser(function (user, done) {
  done(null, user.Email);
});

passport.deserializeUser(function (email, done) {
  db.getUserAndRolesByEmail(email, function (err, user) {
    if (err) {
      return done(err, false);
    }
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  });
});