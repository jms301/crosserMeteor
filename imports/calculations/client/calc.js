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


Template.user_calc_list.helpers({
   userEmail: (user) => {
    if(user && user.emails && user.emails[0].address) {
      return user.emails[0].address;
    } else {
      return "<blank>";
    }
  },

   calcList  : function (user) {
    console.log(Schemes.findOne({userId: user._id}));
    schemes = Schemes.find({userId: user._Id});
    schemes = Schemes.find({});
    topCalcs = schemes.map ((item) => {
      return Calculations.findOne({_id: item.last_calc_id});
    });
    console.log(topCalcs);
    return _.filter(topCalcs, (o) => { return !!o});
  }

});

Template.calculations.helpers({

 userList : () => {
    return Meteor.users.find();
  }

});

Template.calc_list_item.onCreated(function() {
  this.expanded = new ReactiveVar(false);

});

Template.calc_list_item.helpers({
  expanded : function () {
    return Template.instance().expanded.get();
  }
});


Template.calc_list_item.events({
  "click span" : function () {
    Template.instance().expanded.set(!Template.instance().expanded.get());
  }


});


Template.scheme_calc_list.helpers({

  scheme_calcs: function () {
    return Calculations.find({schemeId: this.schemeId}, {sort : {startTime: -1}});
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
