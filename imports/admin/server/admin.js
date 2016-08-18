import {queue} from '../../schemes/server/scheme.js';


Meteor.publish('queued_tasks', function () {
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
        console.log("Added " + doc._id);
      // console.log(doc);
        this.added("queued_tasks", doc._id, doc);
      }

      newPublished.push(doc._id);

    });

    //Remove stale publications
    published.forEach((staleId) => {
      console.log("removing " + staleId);
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
        console.log("Added " + doc._id);
      // console.log(doc);
        this.added("working_tasks", doc._id, doc);
      }

      newPublished.push(doc._id);

    });

    //Remove stale publications
    published.forEach((staleId) => {
      console.log("removing " + staleId);
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

Meteor.setInterval(() => {
  queue.tasks.forEach((task) => {
    //console.log(task);
  });

}, 1000);

