////////////////
//Authentication
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var conf = require('../../config/conf');
var db = require('../helpers/database');
var stat = require('../helpers/stat');

module.exports = {
  post: register,
  get: getUserDetails,
  delete: deleteUser,
  getAuthToken: getAuthToken,
  completeTutorial: completeTutorial,
  logout: logout,
  login: redirectOnSuccess,
  ssoCallback: redirectOnSuccess,
};

// Register a new user.
// New users are automatically registered with the searcher role.
function register(req, res) {
  var email = req.swagger.params.email.value;
  var password = bcrypt.hashSync(req.swagger.params.password.value, bcrypt.genSaltSync(10));
  db.createUser(email, password, function (err, result) {
    if (err) {
      // If it fails due to a constraint, they've tried to register an
      // email that has already been registered. Give them 409 conflict.
      if (err.signature == 127)
        return res.status(409).json({
          message: "Email already in use!"
        });

      //Otherwise just give them that sweet 500 server error.
      return res.status(500).json(err);
    }

    if (result !== null)
      return res.status(201).json({
        message: "User registered"
      });

    return res.status(500).json({
      message: "User not registered. Honestly no idea why."
    });
  });
}

// Delete your account.
function deleteUser(req, res) {
  if (!req.user || !req.user.Uuid)
    res.status(400).json({
      message: "Make sure you are logged in!"
    });

  var queryStr = 'OPTIONAL MATCH (u:User)-[r]->() WHERE u.Uuid = {Uuid} DELETE r, u';
  var params = {
    Uuid: req.user.Uuid
  };

  db.query(queryStr, params, function (err, result) {
    if (err) res.status(500).json(err);
    res.json({
      message: "User deleted."
    });
  });
}

// Get user details
function getUserDetails(req, res) {
  res.json({
    "Uuid": req.user.Uuid,
    "Email": req.user.Email,
    "EmailVerified": req.user.EmailVerified,
    "LastLogin": req.user.LastLogin,
    "CompletedTutorial": req.user.CompletedTutorial,
    "Roles": req.user.roles,
  });
}

//Allow the user to grab their authentication token
function getAuthToken(req, res) {
  if (!req.user)
    res.status(403).json({
      message: "Could not get authentication token for user!"
    });

  var token = jwt.encode({
    "Email": req.user.Email,
    "Uuid": req.user.Uuid,
    "exp": (Date.now() + 86400),
  }, conf.secret);

  res.json({
    token: 'JWT ' + token
  });
}

// Called when the user completes the training.
// Sets a flag for the user so the help will never auto-launch again.
function completeTutorial(req, res) {
  if (!req.user || !req.user.Uuid)
    return res.status(400).json({
      message: "Make sure you are logged in!"
    });
  if (req.user.Email === 'anon@menome.com')
    return res.status(200).json({
      message: "Not supported for anonymous user."
    });

  var queryStr = 'OPTIONAL MATCH (u:User) WHERE u.Uuid = {Uuid} SET u.CompletedTutorial = true';
  var params = {
    Uuid: req.user.Uuid
  };

  db.query(queryStr, params, function (err, result) {
    if (err) res.status(500).json(err);
    res.json({
      message: "User has completed the tutorial."
    });
  });
}

// Log the user out.
function logout(req, res) {
  if (req.user) stat.logEvent("Logout for username " + req.user.Email, "", {
    tags: ["username:" + req.user.Email]
  });
  req.logout();
  req.session.destroy();
  res.redirect('/index.html');
}

// Function that redirects the user to theLink on success.
function redirectOnSuccess(req, res) {
  res.redirect('/app.html');
}