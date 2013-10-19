// utils
var execWrapFile = require.resolve("../../lib/exec-wrap");
var tracker = require("../../lib/tracker");
var startMongo = require('../../lib/start-mongo');
var find = require('../../lib/array-find');
var deepEqual = require('deep-equal');

// config
var path = require('path');
var dbroot = path.join(__dirname, '../../db');
var dbString = "mongodb://localhost:9001/workshop";

var expectedSchema = {
  name: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  }
};

var verify = function (cb) {
  var data = tracker.get("mongoose");

  // make sure they called createConnection
  var connectCall = find(data.calls, function(call){
    return call.fn === "createConnection";
  });
  if (!connectCall) return cb("You didn't call createConnection");
  if (connectCall.args[0] !== dbString) return cb("You didn't connect to the right database");

  // make sure they called Schema
  var schemaCall = find(data.calls, function(call){
    return call.fn === "Schema";
  });
  if (!schemaCall) return cb("You didn't call new Schema");
  if (!deepEqual(schemaCall.args[0], expectedSchema)) return cb("You didn't create the correct Schema")
  tracker.wipe("mongoose");
  cb();
};
module.exports = function (isRun, cb) {
  var isVerify = !isRun;

  // wipe old logs
  tracker.wipe("mongoose");

  var mongo = startMongo(dbroot, 9001);
  mongo.once('error', cb);
  mongo.once('ready', function(){
    cb(null, {
      args: [],
      stdin: null,
      long: false,
      ignoreStdout: true,
      execWrap: execWrapFile,
      close: mongo.close,
      verify: verify
    });
  });
};

module.exports.async = true;