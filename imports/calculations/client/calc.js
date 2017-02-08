import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { ReactiveVar } from 'meteor/reactive-var';

Template.calculations.onCreated(function () {

  var self = this;
  self.autorun(function () {
    self.subscribe('schemes');
    self.subscribe('users');
    self.subscribe('calculations');
  });
});

Template.calculations.helpers({

  userList : () => {
    return Meteor.users.find();
  },
  hasCalcs: (user) => {
    return (Calculations.find({userId: user._id}).count() > 0);
  }


});

Template.user_calc_list.onCreated(function() {

  if (this.data.user._id == Meteor.userId())
    this.expanded = new ReactiveVar(true);
  else
    this.expanded = new ReactiveVar(false);
});

Template.user_calc_list.helpers({

   calcList  : function (user) {
    schemes = Schemes.find({userId: user._id});
    topCalcs = schemes.map ((item) => {
      return Calculations.findOne({_id: item.last_calc_id});
    });
    return _.filter(topCalcs, (o) => { return !!o});
  },

  expanded : function () {
    return Template.instance().expanded.get();
  }

});

Template.user_calc_list.events({
  "click span.toggle-user" : function () {
    Template.instance().expanded.set(!Template.instance().expanded.get());
  }


});


Template.scheme_calc_list.onCreated(function() {
  this.expanded = new ReactiveVar(false);
});


Template.scheme_calc_list.helpers({
  expanded : function () {
    return Template.instance().expanded.get();
  }
});


Template.scheme_calc_list.events({
  "click span.toggle-scheme" : function () {
    Template.instance().expanded.set(!Template.instance().expanded.get());
  }


});


Template.calc_list_item.helpers({

  scheme_calcs: function () {
    return Calculations.find({schemeId: this.schemeId}, {sort : {startTime: -1}});
  },

  formatTime: function (time) {
    if(time)
    {
      return time.toLocaleString();
    } else {
      return "";
    }


  }
});



Template.calculation.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('calculation', FlowRouter.getParam('id'));
  });
});


Template.calculation.helpers({
  'getCalc' :  function () {
    var calcId = FlowRouter.getParam('id');
    return (Calculations.findOne({_id: calcId}) || {});
  },
  'status' : function (calc) {
    if ( calc.endTime )
      return 'Completed';
    if ( calc.startTime )
      return 'Running';
    if ( calc.queueTime )
      return 'Queued';
    return 'Terminated or Crashed!';
  }

});

Template.results.helpers({
  'pdfUrl' : function ( calc ) {
    return Meteor.absoluteUrl() + "static/" + calc._id + "/plots.pdf";
  },
  'resultsUrl' : function ( calc ) {
    return "/static/" + calc._id + "/";
  },
  'logUrl' : function ( calc ) {
    return "/static/" + calc._id + "/Crosser.log";
  },
  'duration' : function (calc) {
    var date = new Date(null);
    date.setMilliseconds(calc.endTime - calc.startTime);
    return date.toISOString().substr(11,8);
   // .substr(11,8);
  }
});
