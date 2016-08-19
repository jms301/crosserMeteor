import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

Template.admin.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('running_calculations');
    self.subscribe('working_tasks');
    self.subscribe('queued_tasks');
    if(self.subscriptionsReady()) {
			console.log("subscribed");
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

	getCalc: (id) => {
		return	Calculations.find({_id: id});
	}

});


Template.runningJob.events({
  "click button.kill-job" : function (evt, inst) {
    Meteor.call("killJob",  inst.data.task.calcId);
  }
});
