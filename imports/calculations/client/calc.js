import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

Template.calculations.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('schemes');
    self.subscribe('top_calc_list');
  });
});


Template.calculations.helpers({

  calcList  : function () {
    schemes = Schemes.find();
    topCalcs = schemes.map ((item) => {
      return Calculations.findOne({_id: item.last_calc_id});
    });
    return topCalcs;
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
    return "/static/" + calc._id + "/plots.pdf";
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
