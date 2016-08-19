import { Meteor } from 'meteor/meteor';
import async from 'async';
import fs from 'file-system';
import child_process from 'child_process';
import {create_calc} from '../../calculations/server/calc_lib.js'

var spawn = child_process.spawn;

var cr_dir = Meteor.settings.CROSS_DIR;
var cr_exe = Meteor.settings.CROSS_EXE;
var r_exe = Meteor.settings.CROSS_R_EXE;
var cr_exe_dir = Meteor.settings.CROSS_EXE_DIR;
var mask = 0770;

if (typeof(cr_dir) == 'undefined')
  throw "Missing CROSS_DIR setting in settings.json";

if (typeof(cr_exe) == 'undefined')
  throw "Missing CROSS_EXE setting in settings.json";

if (typeof(r_exe) == 'undefined')
  throw "Missing CROSS_EXE setting in settings.json";

if (typeof(cr_exe_dir) == 'undefined')
  throw "Missing CROSS_EXE_DIR setting in settings.json";

var processScheme = Meteor.bindEnvironment(function (task, callback) {

  //set the calc record start time.

  Calculations.update({_id: task.calcId}, {$set : { startTime : new Date()}});
  outputdir = cr_dir + task.calcId + "/";

  task.child = spawn(cr_exe , ['-o' + outputdir, '-u http://127.0.0.1:3000/api/' + task.histId], {"cwd": cr_exe_dir, "detached": true});

  task.status = "Running Crosser";
  var stdOut = "";
  var stdErr = "";

  task.child.stdout.on('data', Meteor.bindEnvironment(function (data) {
    stdOut = stdOut + data;
    Calculations.update({_id: task.calcId},
      {$set : { crossStdOut : stdOut }});
  }, (e) => { callback ()}));

  task.child.stderr.on('data', Meteor.bindEnvironment(function (data) {
    stdErr = stdErr + data;
    Calculations.update({_id: task.calcId},
      {$set : { crossStdErr : stdErr }});
  }, (e) => { callback ()}));

  task.child.on('close', Meteor.bindEnvironment(function (code) {
    Calculations.update({_id: task.calcId},
      {$set : { crossExit : code }});

    if (code != 0) {
      throw new Meteor.Error(500, 'Cross exited with: ' + code);
      return;
    } else {
      task.status = "R Script";
      stdOut = "";
      stdErr = "";
      task.child = spawn(r_exe , [outputdir], {"cwd": cr_exe_dir, "detached" : true});

      task.child.stdout.on('data', Meteor.bindEnvironment(function (data) {
        data = (data + "")
        stdOut = stdOut + data;
        Calculations.update({_id: task.calcId},
          {$set : { rStdOut : stdOut }});
      }, (e) => { callback ()}));

      task.child.stderr.on('data', Meteor.bindEnvironment(function (data) {
        stdErr = stdErr + data;
        Calculations.update({_id: task.calcId},
          {$set : { rStdErr : stdErr }});
      }, (e) => { callback ()}));


      task.child.on('close', Meteor.bindEnvironment(function (code) {
        Calculations.update({_id: task.calcId},
          {$set : { rExit : code }});
        if(code == 0) {
          //SUCCESS!

          Calculations.update({_id: task.calcId},
            {$set : { endTime : new Date()}});
          console.log("completed calculation: " + task.calcId);
          callback ();
        } else {
          throw new Meteor.Error(500, 'R exited with: ' + code);
        }
      }, (e) => {

        stdErr = stdErr + "\n " + e;
        Calculations.update({_id: task.calcId},
          {$set : { rStdErr : stdErr }});
        callback ();
      }));
    }
  }, (e) => {
    stdErr = stdErr + "\n " + e;
    Calculations.update({_id: task.calcId},
      {$set : { crossStdErr : stdErr }});
    callback ();
  }));
}, (e) => {
  console.log("3: "  +  e);
  callback();
});

export var queue = async.queue(processScheme, 1);

function backupScheme(scheme) {
  var lastBackup = SchemeHistory.findOne(
                   {_schemeId: scheme._id, version: scheme.version-1});
  //TODO diff old version and current version.
  scheme.schemeId = scheme._id;
  delete scheme._id;
  var historyId = SchemeHistory.insert(scheme);

  if(historyId)
    Schemes.update({_id: scheme.schemeId}, {$inc: {version: 1}});

  return historyId;
}


Meteor.methods({
  'processScheme' : function (schemeId) {
    var scheme = Schemes.findOne({_id: schemeId});
    if(scheme) {
      if(this.userId && this.userId == scheme.userId) {
        console.log("Processing scheme: " + scheme.name);
        var histId = backupScheme(scheme);

        var calcId = create_calc(scheme.name + " - v:" + scheme.version, schemeId, histId, this.userId);

        queue.push({name: scheme.name + " - v: " + scheme.version, histId: histId, calcId: calcId, status: "Queued"}, (err) => {
          //TODO deal with errors more gracefully.
          if(err) {
            console.log("Cross processing failed with error!");
            console.log("Error: " + err);
            throw err;
          }

        });
      } else {
        console.log("Attempted backup with wrong user.")
        throw new Meteor.Error(401, "User not authorized");
      }
    } else {
      console.log("Failed to find backup for scheme.");
      throw new Meteor.Error(404, "No such scheme.");
    }

    return calcId;
  },

  'backupScheme' : function (schemeId) {
    var scheme = Schemes.findOne({_id: schemeId});
    if(scheme) {
      if(this.userId && this.userId == scheme.userId) {
        if(backupScheme(scheme))
          console.log("Backed up: " +  schemeId +
                      " ver: " + (scheme.version+1));

      } else {
        console.log("Attempted backup with wrong user.")
        throw new Meteor.Error(401, "User not authorized");
      }
    } else {
      console.log("Failed to find backup for scheme.");
      throw new Meteor.Error(404, "No such scheme.");
    }
  }
});
