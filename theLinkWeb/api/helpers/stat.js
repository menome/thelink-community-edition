/*
 * Instrumentation / Stat Tracking
 * Copyright (C) 2016 Menome Technologies Inc.
 *
 * Gives us an interface to track metrics with datadog, and log things to system log.
 */

var StatsD = require('dogstatsd-node').StatsD;
var conf = require('../../config/conf');
var client;

// Records a number of performance metrics.
// Meant to be run at a set interval.
var collectPerformanceStats = function () {
  var memUsage = process.memoryUsage();
  client.gauge('memory.rss', memUsage.rss).send();
  client.gauge('memory.heapTotal', memUsage.heapTotal).send();
  client.gauge('memory.heapUsed', memUsage.heapUsed).send();
};

// Logs an event.
// Includes a kludgey wrapper for the dogstatsd client we're using, since it doesn't support events.
// http://docs.datadoghq.com/guides/dogstatsd
// Event Format: "_e{4,5}:test|testo|d:date_happened|h:hostname|p:priority|t:alert_type|#tag1,tag2";
var logEvent = function (title, msg, opt) {
  if (!msg) msg = title;

  // Always log to stdout
  console.log(title);

  // If we've got cloud instrumentation set up, talk to it.
  if (conf.instrumentation.enable) {
    var payload = "_e{" + title.length + "," + msg.length + "}:" + title + "|" + msg;
    if (opt) {
      if (opt.alertType) payload += "|t:" + opt.alertType; // Can be 'info', 'warning', 'error', 'success'
      if (opt.tags) payload += "|#" + opt.tags.join(",");
    }

    buf = new Buffer(payload);
    client.socket.send(buf, 0, buf.length, client.port, client.host);
  }
};

// Initializes the datadog stuff.
var initialize = function () {
  // Create our new datadog stats client.
  client = new StatsD({
    prefix: conf.instrumentation.ddogPrefix,
    host: conf.instrumentation.statsDHost,
    port: conf.instrumentation.statsDPort,
  });

  // Handle errors by swallowing them and logging them to syslog.
  client.socket.on('error', function (error) {
    return console.log("Error in socket: ", error);
  });

  // Set an interval for collecting our general stats.
  setInterval(collectPerformanceStats, 5000);

  logEvent("", "The datadog event logging and metrics service has started.");
};

// Express Middleware for tracking metrics.
var middleware = function (req, res, next) {
  client.increment('requests.int').send();

  // When we had a method for each different endpoint, we used this middleware to log requests.
  //if(req.method === 'GET' && req.path.includes('/api/') &&
  //!req.path.includes('pivot') && !req.path.includes('question'))
  //logEvent(req.user.Email + ": search on " + req.path,"",{tags: ["username:"+req.user.Email]});


  next();
};

module.exports = {
  initialize: initialize,
  logEvent: logEvent,
  middleware: middleware,
  client: client,
};