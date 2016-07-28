import { Meteor } from 'meteor/meteor';
import async from 'async';
import fs from 'file-system';
import child_process from 'child_process';

import create_calc from '../../calculations/server/calc_lib.js'

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

function processScheme(task, callback) {
  outputdir = cr_dir + task._id + "/";

  fs.mkdir(outputdir, mask, (err) => {
    if (!err || err.code == 'EEXIST') {

      task.child = spawn(cr_exe , ['-o' + outputdir, '-u http://127.0.0.1:3000/api/' + task._id], {"cwd": cr_exe_dir});

      console.log("#### API URL: http://127.0.0.1:3000/api/" + task._id);

      var stdOut = "";
      var stdErr = "";

      task.child.stdout.on('data', (data) => {
        console.log("" + data);
        stdOut = stdOut + data;
      });
      task.child.stderr.on('data', (data) => {
        stdErr = stdErr + data;
      });

      task.child.on('close', (code) => {
          console.log("Crosser closed with: " + code);
        if (code !== 0) {
         //error!
        } else {
          // everything OK with cross, run R;
          task.child = spawn(r_exe , [outputdir], {"cwd": cr_exe_dir});

          task.child.stdout.on('data', (data) => {
            console.log("" + data);
            stdOut = stdOut + data;
          });
          task.child.stderr.on('data', (data) => {
            console.log("" + data);
            stdErr = stdErr + data;
          });

          task.child.on('close', (code) => {
            console.log("R Scrip closed with: " + code);
          });


        }
      });
    } else {

    }
  });


  setTimeout(function() {
    callback(null);
  }, 2000);
}

var queue = async.queue(processScheme, 1);

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

        var calcId = create_calc(schemeId, histId, this.userId);

        queue.push({name: scheme.name, _id: histId, calcId: calcId}, (err) => {
          //TODO deal with errors more gracefully.
          console.log(err)});

        return ;
      } else {
        console.log("Attempted backup with wrong user.")
        throw new Meteor.Error(401, "User not authorized");
      }
    } else {
      console.log("Failed to find backup for scheme.");
      throw new Meteor.Error(404, "No such scheme.");
    }
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
