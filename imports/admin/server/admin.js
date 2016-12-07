import {queue} from '../../schemes/server/scheme.js';
import process from 'process';


Meteor.publish('queued_tasks', function () {

  if(!this.userId || Meteor.users.findOne({_id: this.userId}).admin != 1) {
    console.log("non-admin user attempted to sub-queued_tasks");
    throw new Meteor.Error(403, "Un-authorized attempt has been logged");
    return;
  }

  var published = [];
  const poll = () => {
    var newPublished = [];
    var workers = queue.tasks

    workers.forEach((task) => {
      var doc = {
        name: task.data.name,
        _id: task.data.histId,
        calcId: task.data.calcId,
        status: task.data.status
      };

      if ( _.contains(published, task.data.histId)) {
        this.changed("queued_tasks", doc._id, doc);
        published = _.without(published, task.data.histId);
      } else {
        this.added("queued_tasks", doc._id, doc);
      }

      newPublished.push(doc._id);

    });

    //Remove stale publications
    published.forEach((staleId) => {
      this.removed("queued_tasks", staleId);
    });

    //throw out old publication census and replace with new one.
    published = newPublished;

  }
  poll();
  this.ready();

  const interval = Meteor.setInterval(poll , 500);

  this.onStop(() => {
    Meteor.clearInterval(interval);
  });
});

Meteor.publish('working_tasks', function () {

  if(!this.userId || Meteor.users.findOne({_id: this.userId}).admin != 1) {
    console.log("non-admin user attempted to sub-working_tasks");
    throw new Meteor.Error(403, "Un-authorized attempt has been logged");
    return;
  }

  var published = [];

  const poll = () => {
    var newPublished = [];
    var workers = queue.workersList();

    workers.forEach((task) => {
      var doc = {
        name: task.data.name,
        _id: task.data.histId,
        calcId: task.data.calcId,
        status: task.data.status
      };


      if ( _.contains(published, task.data.histId)) {
        this.changed("working_tasks", doc._id, doc);
        published = _.without(published, task.data.histId);
      } else {
        this.added("working_tasks", doc._id, doc);
      }

      newPublished.push(doc._id);

    });

    //Remove stale publications
    published.forEach((staleId) => {
      this.removed("working_tasks", staleId);
    });

    //throw out old publication census and replace with new one.
    published = newPublished;

  }
  poll();
  this.ready();

  const interval = Meteor.setInterval(poll , 500);

  this.onStop(() => {
    Meteor.clearInterval(interval);
  });
});



Meteor.methods({
  //TODO secure this for admin only
  killJob: function (calcId) {

    if(!Meteor.user() || Meteor.user().admin != 1) {
      console.log("non-admin user attempted to kill job");
      throw new Meteor.Error(403, "Un-authorized attempt has been logged");
      return;
    }

    var workers = queue.workersList();
    workers.forEach((task) => {

      if(calcId == task.data.calcId && task.data.child &&
         task.data.child.pid) {
        console.log("killing child process: " + task.data.child.pid);
        try {
          process.kill(-task.data.child.pid);

          Calculations.update({_id: task.data.calcId},
            {$set: {startTime: null, endTime: null, queueTime: null}});

        } catch (e) {
          //Failed to kill no action necessary
        }

      }
    });
  }
});
