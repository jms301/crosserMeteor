import { Meteor } from 'meteor/meteor';
import async from 'async';
import fs from 'file-system';
import child_process from 'child_process';

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

//queue.push({name: "wibble", _id: "5761067fc5b613e16e7a81e7"}, (err) => { });


Meteor.methods({
  'processScheme' : function (schemeId) {
    queue.push({name: "TestScheme", _id: schemeId}, (err) => {console.log(err)});

  }
});
