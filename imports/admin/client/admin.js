import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

Template.admin.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('working_tasks');
    self.subscribe('admin-users');
    self.subscribe('queued_tasks');
    if(self.subscriptionsReady()) {

    }
  });
});


Template.admin.helpers({
	workingTasks: () => {
		return WorkingTasks.find();

 	},

  queuedTasks: () => {
    return QueuedTasks.find();
  },

  userEmails: () => {
    return Meteor.users.find().map((user) => {
      if(user.emails && user.emails[0] && user.emails[0].address)
        return user.emails[0].address;
      return "";
    });
  }
});


Template.runningJob.events({
  "click button.kill-job" : function (evt, inst) {
    Meteor.call("killJob",  inst.data.task.calcId);
  }
});
