var express = require("express");
var fs = require('fs');
var passport = require("passport");
var bodyParser = require('body-parser');
var SwaggerExpress = require('swagger-express-mw');
var favicon = require('serve-favicon');
var app = express();
var port = process.env.PORT || 3000;
var sslport = 443;
var https = require('https');
var http = require('http');
var conf = require('./config/conf');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('cookie-parser')());
app.use(favicon('app/dist/assets/favicon.ico'));
app.use(require('express-session')({
  secret: conf.sessionSecret,
  cookie: { secure: false }, //For use when we're sure to be running HTTPs.
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('flash')());

// Adds headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    var origin = req.headers.origin;
    if(conf.allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', conf.allowedOrigins.join(','));
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

///////////////////////////////
// Handle Authentication stuff.
var authMiddleware = require('./api/helpers/auth');
authMiddleware.setupSecurity(app);

////////////////
// Swagger Stuff
var config = {
    appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  //Use Swagger's UI
  app.use(swaggerExpress.runner.swaggerTools.swaggerUi());

  // install middleware
  swaggerExpress.register(app);
});

////////////////////////
// Start instrumentation
if(conf.instrumentation.enable) {
  var stat = require('./api/helpers/stat');
  stat.initialize();
  app.use(stat.middleware);
}

/////////////
// API Layers

// An echo endpoint.
app.get('/api', function(req, res, next) {
  return res.send("This is a healthy theLink API service!");
});



// Image management.
//app.use('/api/images', require('./api/images')); // Endpoint for uploading images.

/////////////////////
// Web Frontend Stuff

// Serve the 'app' directory as a normal static webserver.
if(!conf.apiOnly) {
  app.use(express.static('app/dist/'));
  app.use('/images', express.static('images/'));
}

///////////////
// Start the App

// Check if we're using SSL
var ssl_opts = {};
if(conf.ssl.enable) {
  try {
    ssl_opts.key = fs.readFileSync(conf.ssl.keyFile);
    ssl_opts.cert = fs.readFileSync(conf.ssl.certFile);
  }
  catch (e) {
    conf.ssl.enable = false;
  }
}

// If we're not being imported, just run our app.
if (!module.parent) {
    http.createServer(app).listen(port);
    console.log("Listening on " + port);

    if(conf.ssl.enable) {
      https.createServer(ssl_opts, app).listen(sslport);
      console.log("SSL Service listening on: " + sslport);
    }
}

// Export the app. This makes it easier to pack into other things. (Like testing frameworks!)
module.exports = app;
