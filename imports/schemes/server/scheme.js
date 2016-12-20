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
  throw "Missing CROSS_R_EXE setting in settings.json";

if (typeof(cr_exe_dir) == 'undefined')
  throw "Missing CROSS_EXE_DIR setting in settings.json";

var processScheme = Meteor.bindEnvironment(function (task, callback) {

  //set the calc record start time.

  Calculations.update({_id: task.calcId}, {$set : { startTime : new Date()}});
  outputdir = cr_dir + task.calcId + "/";

  task.child = spawn(cr_exe , ['-o' + outputdir, '-u ' + Meteor.absoluteUrl() + 'api/' + task.histId], {"cwd": cr_exe_dir, "detached": true});

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


//Takes a SchemeHistory and Scheme entry and returns true if they are the same
function compSchemeHistory(history, scheme) {
  ignore = ['_id', 'version', 'schemeId'];

  for(key in history) {
    if (!_.contains(ignore, key) &&
        !_.isEqual(history[key], scheme[key])) {
      return false;
    }
  }
  return true;
}

function revertScheme(scheme, historic) {

  var id = scheme._id;
  //first up backup the scheme!
  backupScheme(scheme);
  // WARNING backup modifies the scheme object.
  // This is OK for us because we're replacing it with the historic version.
  scheme = Schemes.findOne({_id: id});

  historic._id = historic.schemeId;
  historic.version = scheme.version;
  delete historic.schemeId;
  if(Schemes.update({_id: historic._id}, historic) == 1) {
    return historic._id;
  } else {
    throw new Meteor.Error(500, "Error: Failed to update scheme. ");
  }

}


function backupScheme(scheme) {


  var lastBackup = SchemeHistory.findOne(
                   {schemeId: scheme._id, version: scheme.version-1});

  if(!lastBackup || !compSchemeHistory(lastBackup, scheme)) {

    scheme.schemeId = scheme._id;
    delete scheme._id;
    var historyId = SchemeHistory.insert(scheme);

    if(historyId)
      Schemes.update({_id: scheme.schemeId}, {$inc: {version: 1}});

    return {_id: historyId, backup: true};
  } else {
    return {_id: lastBackup._id, backup: false};
  }
}


Meteor.methods({
  'processScheme' : function (schemeId) {
    var scheme = Schemes.findOne({_id: schemeId});
    if(scheme) {
      if(this.userId && this.userId == scheme.userId) {
        var histId = backupScheme(scheme)._id;
        var calcId = create_calc(scheme.name + " - v:" + scheme.version, schemeId, histId, this.userId);

        Schemes.update({_id: schemeId}, {$set: {last_calc_id: calcId}});

        queue.push({name: scheme.name + " - v: " + scheme.version, histId: histId, calcId: calcId, status: "Queued"}, (err) => {
          if(err) {
            console.log("Cross processing failed with error!");
            console.log("Error: " + err);
            throw new Meteor.Error(500, "Error: " + err);
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
        return backupScheme(scheme);

      } else {
        console.log("Attempted backup with wrong user.")
        throw new Meteor.Error(401, "User not authorized");
      }
    } else {
      console.log("Failed to find backup for scheme.");
      throw new Meteor.Error(404, "No such scheme.");
    }
  },
  'revertScheme' : function (historicId) {
    var backup = SchemeHistory.findOne({_id: historicId});
    var scheme = Schemes.findOne({_id: backup.schemeId});

    if(scheme) {
      if(this.userId && this.userId == scheme.userId &&
        this.userId == backup.userId) {
         return revertScheme(scheme, backup);
      } else {
        console.log("Attempted backup with wrong user.")
        throw new Meteor.Error(401, "User not authorized");
      }
    } else {
      console.log("Failed to find backup for scheme.");
      throw new Meteor.Error(404, "No such scheme.");
    }
  },
  'ownCopyScheme' : function (historicId) {


  }
});
